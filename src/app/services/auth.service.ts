import { Injectable, inject } from '@angular/core';
import { Database } from './database';
import { BehaviorSubject, map } from 'rxjs';
import { User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private db = inject(Database);
  
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  isAuthenticated$ = this.user$.pipe(map(user => !!user));

  constructor() {
    // Check initial session
    this.db.client.auth.getSession().then(({ data: { session } }) => {
      this.userSubject.next(session?.user ?? null);
    });

    // Listen for auth changes
    this.db.client.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      this.userSubject.next(session?.user ?? null);
    });
  }

  /**
   * Helper to map username to a dummy email for Supabase Auth
   */
  private getEmailFromUsername(username: string): string {
    return `${username.trim().toLowerCase()}@internal.todo`;
  }

  async login(username: string, password: string = 'dummy-password') {
    const email = this.getEmailFromUsername(username);
    const { data, error } = await this.db.client.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async register(username: string, password: string = 'dummy-password') {
    const email = this.getEmailFromUsername(username);
    const { data, error } = await this.db.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim()
        }
      }
    });
    return { data, error };
  }

  async logout() {
    const { error } = await this.db.client.auth.signOut();
    return { error };
  }

  getCurrentUser() {
    return this.userSubject.value;
  }

  async getRegisteredUsernames(): Promise<{id: string, username: string}[]> {
    const { data, error } = await this.db.client.rpc('get_registered_usernames');
    if (error) {
      console.error('Error fetching usernames:', error);
      return [];
    }
    return (data as any[]).map(row => ({
      id: row.id,
      username: row.username
    }));
  }
}
