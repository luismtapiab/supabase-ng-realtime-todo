import { Component, OnInit, OnDestroy, output } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Database } from '../../services/database';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-lateral-panel',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './lateral-panel.html',
  styleUrl: './lateral-panel.scss'
})
export class LateralPanel implements OnInit, OnDestroy {
  logs: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  close = output();
  private subscription: Subscription = new Subscription();


  constructor(private db: Database) { }

  ngOnInit() {
    this.subscription = this.db.getTodoChanges().subscribe((payload) => {
      const event = payload.event;
      const time = new Date().toLocaleTimeString();
      let message = '';

      switch (event) {
        case 'INSERT':
          message = `New todo added at ${time}`;
          break;
        case 'UPDATE':
          message = `Todo updated at ${time}`;
          break;
        case 'DELETE':
          message = `Todo deleted at ${time}`;
          break;
        default:
          message = `Event ${event} at ${time}`;
      }
      this.logs.next([...this.logs.value, message]);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
