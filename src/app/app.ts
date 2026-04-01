import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Login } from './components/login/login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Login],
  template: `
    <div *ngIf="auth.isAuthenticated$ | async; else loginTmpl">
      <router-outlet></router-outlet>
    </div>
    <ng-template #loginTmpl>
       <app-login></app-login>
    </ng-template>
  `,
  styleUrl: './app.scss'
})
export class App {
  auth = inject(AuthService);
}
