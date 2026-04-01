import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  private auth = inject(AuthService);
  
  username = '';
  isRegistering = false;
  loading = signal(false);
  error = signal<string | null>(null);
  registeredUsers = signal<{id: string, username: string}[]>([]);

  async ngOnInit() {
    this.registeredUsers.set(await this.auth.getRegisteredUsernames());
  }

  async onSubmit() {
    if (!this.username.trim()) return;
    
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.isRegistering) {
        const { error } = await this.auth.register(this.username);
        if (error) {
          // If already exists, try to login? Or show error.
          this.error.set(error.message);
        }
      } else {
        const { error } = await this.auth.login(this.username);
        if (error) {
          this.error.set(error.message);
        }
      }
    } catch (e: any) {
      this.error.set(e.message || 'An unexpected error occurred');
    } finally {
      this.loading.set(false);
    }
  }

  toggleMode() {
    this.isRegistering = !this.isRegistering;
    this.error.set(null);
  }

  async selectUser(username: string) {
    if (this.loading()) return;
    this.username = username;
    await this.onSubmit();
  }
}
