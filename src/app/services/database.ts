import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Subject } from 'rxjs';

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
      .channel('schema-db-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'todos',

      },
        payload => {
          this.changes.next(payload)
        }
      ).subscribe();

  }
  getTodoChanges() {
    return this.changes.asObservable();
  }
}
