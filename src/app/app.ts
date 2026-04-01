import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Login } from './components/login/login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, Login],
  template: `
    @if (auth.isAuthenticated$ | async) {
      <div class="floating-menu">
        <details class="dropdown" role="list">
          <summary aria-haspopup="listbox" class="outline contrast">Menu</summary>
          <ul role="listbox">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Todos</a></li>
            <li><a routerLink="/game" routerLinkActive="active">PixelSync</a></li>
            <li><a (click)="logout()">Logout</a></li>
          </ul>
        </details>
      </div>

      <main>
        <router-outlet></router-outlet>
      </main>
    } @else {
      <app-login></app-login>
    }
    `,
  styles: [`
    .floating-menu {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }
    .floating-menu details.dropdown ul {
      left: auto;
      right: 0;
      min-width: 200px;
    }
    .floating-menu ul li a {
      cursor: pointer;
    }
    @media (max-width: 600px) {
      .floating-menu {
        top: 0.5rem;
        right: 0.5rem;
      }
    }
  `],
  styleUrl: './app.scss'
})
export class App {
  auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
