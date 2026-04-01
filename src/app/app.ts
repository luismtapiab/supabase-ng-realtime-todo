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
    @if (auth.isAuthenticated$ | async) {
      <div>
        <router-outlet></router-outlet>
      </div>
    } @else {
      <app-login></app-login>
    }
    `,
  styleUrl: './app.scss'
})
export class App {
  auth = inject(AuthService);
}
