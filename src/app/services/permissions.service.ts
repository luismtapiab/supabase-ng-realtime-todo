import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private auth = inject(AuthService);

  canModifyTodo(todo: Todo): boolean {
    const user = this.auth.getCurrentUser();
    if (!user) return false;
    // Users can only modify their own todos, analogous to RLS
    return todo.user_id === user.id;
  }
}
