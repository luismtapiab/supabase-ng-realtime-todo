import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-latency-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="latency-badge" [class.high]="(latency$ | async)! > 200">
      <span class="dot"></span>
      <span class="value">{{ latency$ | async }}ms</span>
      <span class="label">latency</span>
    </div>
  `,
  styles: [`
    .latency-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      background: var(--pico-secondary-background);
      border-radius: 100px;
      font-size: 0.8rem;
      border: 1px solid var(--pico-border-color);
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
    }
    .latency-badge.high .dot {
      background: #ef4444;
    }
    .value {
      font-weight: bold;
      color: var(--pico-color);
    }
    .label {
      color: var(--pico-muted-color);
      text-transform: uppercase;
      font-size: 0.7rem;
    }
  `]
})
export class LatencyDisplayComponent {
  private game = inject(GameService);
  latency$ = this.game.latency$;
}
