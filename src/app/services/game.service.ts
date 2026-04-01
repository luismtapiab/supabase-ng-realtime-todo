import { Injectable, inject } from '@angular/core';
import { Database } from './database';
import { AuthService } from './auth.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Pixel {
  x: number;
  y: number;
  color: string;
  user_id?: string;
}

export interface PresenceState {
  user_id: string;
  username: string;
  x: number;
  y: number;
  last_active: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private db = inject(Database);
  private auth = inject(AuthService);

  private pixelsSubject = new BehaviorSubject<Pixel[]>([]);
  pixels$ = this.pixelsSubject.asObservable();

  private presenceSubject = new BehaviorSubject<Map<string, PresenceState>>(new Map());
  presence$ = this.presenceSubject.asObservable();

  private latencySubject = new BehaviorSubject<number>(0);
  latency$ = this.latencySubject.asObservable();

  private channel: RealtimeChannel | null = null;
  private pingStart: number = 0;

  constructor() {
    this.initGame();
  }

  private async initGame() {
    // Initial load
    const { data, error } = await this.db.client
      .from('pixels')
      .select('*');

    if (data) {
      this.pixelsSubject.next(data);
    }

    // Setup Realtime Channel
    this.channel = this.db.client.channel('pixel-sync', {
      config: {
        presence: { key: this.auth.getCurrentUser()?.id || 'guest' },
      },
    });

    // Listen for Pixel Changes
    this.db.client
      .channel('pixels-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pixels' },
        (payload) => {
          const updatedPixel = payload.new as Pixel;
          const current = this.pixelsSubject.value;
          const index = current.findIndex(p => p.x === updatedPixel.x && p.y === updatedPixel.y);

          if (index > -1) {
            current[index] = updatedPixel;
            this.pixelsSubject.next([...current]);
          } else {
            this.pixelsSubject.next([...current, updatedPixel]);
          }
        }
      )
      .subscribe();

    // Setup Presence & Broadcast
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState() as Record<string, any>;
        const presenceMap = new Map<string, PresenceState>();

        Object.keys(state).forEach((key) => {
          const userState = state[key][0] as PresenceState;
          presenceMap.set(key, userState);
        });

        this.presenceSubject.next(presenceMap);
      })
      .on('broadcast', { event: 'pong' }, () => {
        const end = Date.now();
        this.latencySubject.next(end - this.pingStart);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const user = this.auth.getCurrentUser();
          if (user) {
            await this.channel?.track({
              user_id: user.id,
              username: user.user_metadata?.['username'] || 'Anonymous',
              x: 0,
              y: 0,
              last_active: Date.now(),
            });
          }
          this.startPingLoop();
        }
      });
  }

  async paintPixel(x: number, y: number, color: string) {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    const { error } = await this.db.client.from('pixels').upsert({
      x,
      y,
      color,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error painting pixel:', error);
    }
  }

  private lastPresenceUpdate = 0;
  private presenceUpdateCooldown = 150; // ms throttle for presence tracking

  updatePresence(x: number, y: number) {
    const now = Date.now();
    if (now - this.lastPresenceUpdate < this.presenceUpdateCooldown) return;
    this.lastPresenceUpdate = now;

    const user = this.auth.getCurrentUser();
    if (!user || !this.channel) return;

    this.channel.track({
      user_id: user.id,
      username: user.user_metadata?.['username'] || 'Anonymous',
      x,
      y,
      last_active: Date.now(),
    });
  }

  private startPingLoop() {
    setInterval(() => {
      if (this.channel) {
        this.pingStart = Date.now();
        this.channel.send({
          type: 'broadcast',
          event: 'ping',
          payload: {},
        });
      }
    }, 5000);
  }
}
