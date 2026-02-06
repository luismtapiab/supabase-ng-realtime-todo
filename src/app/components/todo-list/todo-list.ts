import { Component, OnInit, signal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Database } from '../../services/database';
import { Todo } from '../../models/todo.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss'
})
export class TodoList implements OnInit {
  todos: Subject<Todo[]> = new Subject<Todo[]>();
  newTodoTitle = '';
  loading = signal(false);

  constructor(private db: Database) { }

  ngOnInit() {

    // Subscribe to realtime changes to update the list
    this.db.getTodoChanges().subscribe(() => {
      this.fetchTodos();
    });


    this.fetchTodos();
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

  async addTodo() {
    if (!this.newTodoTitle.trim()) return;

    const { error } = await this.db.client
      .from('todos')
      .insert([{ title: this.newTodoTitle, is_completed: false }]);

    if (error) {
      console.error('Error adding todo:', error);
    } else {
      this.newTodoTitle = '';
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
