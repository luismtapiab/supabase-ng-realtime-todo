import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { PixelCanvasComponent } from './pixel-canvas';
import { LatencyDisplayComponent } from './latency-display';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule, PixelCanvasComponent, LatencyDisplayComponent, FormsModule],
  template: `
    <div class="game-container">
      <div class="game-layout">
        <aside class="controls">
          <header class="game-header">
            <div class="header-content">
              <h1>PixelSync</h1> 
              <p>Collaborative 64x36 Realtime Canvas</p>
              <app-latency-display />
            </div>
          </header>

          <div class="user-info">
            <strong>Painting as:</strong> {{ username }}
          </div>
          
          <div class="color-palette">
            <label>Selected Color:</label>
            <input type="color" [(ngModel)]="selectedColor" (change)="onColorChange($event)" />
            <div class="swatches">
              @for (color of commonColors; track color) {
                <div 
                  class="swatch" 
                  [style.backgroundColor]="color"
                  [class.active]="selectedColor === color"
                  (click)="selectedColor = color">
                </div>
              }
            </div>
          </div>

          <div class="instructions">
            <small>Click to paint. Cooldown: 500ms.</small>
          </div>
          
          <button class="outline" (click)="goHome()">Back to Todos</button>
        </aside>

        <main class="canvas-wrapper">
          <button class="outline" (click)="toggleGrid()" style="position: absolute; top: 1rem; left: 1rem;" >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
          <app-pixel-canvas [selectedColor]="selectedColor" />
          
          <footer class="canvas-footer">
            <button class="outline secondary presence-trigger" (click)="isUserModalOpen.set(true)">
              Online: <strong>{{ onlineCount }}</strong> players
            </button>
          </footer>
        </main>
      </div>
    </div>

    <!-- User List Modal -->
    <dialog [open]="isUserModalOpen()">
      <article>
        <header>
          <button aria-label="Close" rel="prev" (click)="isUserModalOpen.set(false)"></button>
          <h3>Online Players</h3>
        </header>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            @for (user of presenceList(); track user.user_id) {
              <tr>
                <td>{{ user.username }}</td>
                <td><span class="status-dot"></span> Online</td>
                <td>{{ user.last_active | date:'HH:mm:ss' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <footer>
          <button (click)="isUserModalOpen.set(false)">Close</button>
        </footer>
      </article>
    </dialog>
  `,
  styles: [`
    .game-container {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    .game-layout {
      display: grid;
      grid-template-columns: 180px 1fr;
      height: 100%;
      gap: 0;
    }
    .controls {
      background: var(--pico-card-background-color);
      border-right: 1px solid var(--pico-border-color);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 0.8rem;
      z-index: 10;
    }
    .game-header {
      margin-bottom: 0.5rem;
    }
    .header-content {
      h1 { margin-bottom: 0; font-size: 1.2rem; }
      p { margin-bottom: 0.5rem; font-size: 0.7rem; color: var(--pico-muted-color); }
    }
    .user-info { font-weight: bold; }
    .swatches {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.35rem;
      margin-top: 0.25rem;
    }
    .swatch {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: transform 0.1s;
    }
    .swatch:hover { transform: scale(1.05); }
    .swatch.active { border-color: var(--pico-primary); transform: scale(1.1); }
    
    .canvas-wrapper {
      background: var(--pico-background-color);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: auto;
    }
    .canvas-footer {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
    }
    .presence-trigger {
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
      background: rgba(var(--pico-card-background-color-rgb), 0.8);
      backdrop-filter: blur(4px);
    }
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      margin-right: 0.5rem;
    }
    dialog article {
      max-width: 500px;
      width: 100%;
    }
  `]
})
export class GamePageComponent implements OnInit {
  private game = inject(GameService);
  private auth = inject(AuthService);
  private router = inject(Router);

  selectedColor = '#3b82f6';
  commonColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316',
    '#f59e0b', '#84cc16', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'
  ];

  username = 'Guest';
  onlineCount = 0;
  isUserModalOpen = signal(false);

  // Derive presence list for the table
  presenceList = signal<any[]>([]);

  @ViewChild(PixelCanvasComponent)
  pixelCanvas!: PixelCanvasComponent;

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }
    this.username = user.user_metadata?.['username'] || 'Anonymous';

    this.game.presence$.subscribe(presence => {
      this.onlineCount = presence.size;
      this.presenceList.set(Array.from(presence.values()));
    });
  }

  toggleGrid() {
    this.pixelCanvas.toggleGrid();
  }

  onColorChange(event: any) {
    this.selectedColor = event.target.value;
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
