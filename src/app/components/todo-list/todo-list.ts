import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AliveMsg, Database } from '../../services/database';
import { Todo } from '../../models/todo.model';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TodoFormDialog } from '../todo-form-dialog/todo-form-dialog';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, TodoFormDialog],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss'
})
export class TodoList implements OnInit {
  todos: Subject<Todo[]> = new Subject<Todo[]>();
  loading = signal(false);
  isConnected = signal<AliveMsg | null>(null);
  userMap = signal<Record<string, string>>({});

  @ViewChild('todoForm') todoForm!: TodoFormDialog;

  constructor(
    private db: Database, 
    public auth: AuthService
  ) { }

  ngOnInit() {

    this.db.isAlive().subscribe((res) => {
      this.isConnected.set(res);
    });


    // Subscribe to realtime changes to update the list
    this.db.getTodoChanges().subscribe(() => {
      this.fetchTodos();
    });


    this.fetchUserMap();
    this.fetchTodos();
  }

  async fetchUserMap() {
    const users = await this.auth.getRegisteredUsernames();
    const mapping: Record<string, string> = {};
    users.forEach(u => {
      mapping[u.id] = u.username;
    });
    this.userMap.set(mapping);
  }

  getUsername(userId: string): string {
    return this.userMap()[userId] || 'Unknown';
  }

  async fetchTodos() {
    this.loading.set(true);
    const { data, error } = await this.db.client
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.loading.set(false);
      console.error('Error fetching todos:', error);
    } else {
      this.todos.next(data || []);
      this.loading.set(false);
    }
  }

  async logout() {
    await this.auth.logout();
  }

  openAddTodo() {
    this.todoForm.open((title, content) => {
      this.addTodo(title, content);
    });
  }

  async addTodo(title: string, content: string) {
    if (!title.trim()) return;

    const user = this.auth.getCurrentUser();
    if (!user) return;

    const { error } = await this.db.client
      .from('todos')
      .insert([{ 
        title, 
        content,
        is_completed: false,
        user_id: user.id
      }]);

    if (error) {
      console.error('Error adding todo:', error);
    }
  }

  async toggleTodo(todo: Todo) {
    const { error } = await this.db.client
      .from('todos')
      .update({ is_completed: !todo.is_completed })
      .eq('id', todo.id);

    if (error) {
      console.error('Error toggling todo:', error);
    }
  }

  async deleteTodo(id: number) {
    const { error } = await this.db.client
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
    }
  }
}
