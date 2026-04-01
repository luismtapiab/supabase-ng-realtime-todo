import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Database {
  client: SupabaseClient;

  private channel: any;
  changes: Subject<any> = new Subject<any>();

  constructor() {
    this.client = createClient(
      import.meta.env.NG_APP_API_URL,
      import.meta.env.NG_APP_ANON_KEY
    );

    this.setupRealtime();
    
    // Listen for auth changes to ensure realtime is connected with the right token
    this.client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        this.setupRealtime();
      }
    });
  }

  private setupRealtime() {
    if (this.channel) {
      this.client.removeChannel(this.channel);
    }

    this.channel = this.client
      .channel('txchanges', {
        config: {
          private: true,
        },
      })
      .on('broadcast', { event: '*' }, payload => {
        this.changes.next(payload);
        console.log('Broadcast received:', payload);
      })
      .subscribe((status) => {
        console.log('Realtime status:', status);
      });
  }
  getTodoChanges() {
    return this.changes.asObservable();
  }

  isAlive(): Observable<AliveMsg> {
    return new Observable((observer) => {
      this.client.rpc('db_is_alive').then(res => {
        if (res.data) {
          observer.next(res.data as AliveMsg);
        } else {
          observer.error(res.error);
        }
      });
    });
  }
}


export interface AliveMsg {
  alive: boolean,
  now: string,
  version: string,
  message: string
}