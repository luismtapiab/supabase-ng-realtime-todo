import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private counter = 0;
  private toastSubject = new Subject<Toast>();

  /** Consumers subscribe to this to render toasts */
  toast$ = this.toastSubject.asObservable();

  success(message: string): void {
    this.emit('success', message);
  }

  error(message: string): void {
    this.emit('error', message);
  }

  info(message: string): void {
    this.emit('info', message);
  }

  private emit(type: ToastType, message: string): void {
    this.toastSubject.next({ id: ++this.counter, type, message });
  }
}
