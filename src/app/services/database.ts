import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Database {
  client: SupabaseClient;

  changes: Subject<any> = new Subject<any>();
  constructor() {
    this.client = createClient(
      import.meta.env.NG_APP_API_URL,
      import.meta.env.NG_APP_ANON_KEY
    );

    const changes = this.client
      .channel('txchanges', {
        config: {
          private: true,
        },
      })
      .on('broadcast', {
        event: '*'
      },
        payload => {
          this.changes.next(payload)
          console.log(payload)
        }
      ).subscribe();

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