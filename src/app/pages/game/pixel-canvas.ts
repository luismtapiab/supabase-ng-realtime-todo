import { Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Pixel, PresenceState } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pixel-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container" #container>
      <canvas #mainCanvas [width]="gridWidth * pixelSize" [height]="gridHeight * pixelSize"></canvas>
      <canvas #overlayCanvas [width]="gridWidth * pixelSize" [height]="gridHeight * pixelSize" 
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp($event)"
        (mouseleave)="onMouseLeave()">
      </canvas>
    </div>
  `,
  styles: [`
    .canvas-container {
      position: relative;
      cursor: crosshair;
      border: 1px solid var(--pico-border-color);
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    canvas {
      position: absolute;
      top: 0;
      left: 0;
    }
    canvas#mainCanvas {
      background-color: #f8fafc;
    }
    canvas#overlayCanvas {
      z-index: 10;
    }
  `]
})
export class PixelCanvasComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mainCanvas') mainCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  @Input() selectedColor = '#000000';

  gridWidth = 64;
  gridHeight = 36;
  pixelSize = 12;
  isGridVisible = false;

  private destroy$ = new Subject<void>();
  private game = inject(GameService);
  private auth = inject(AuthService);
  private currentPixels: Pixel[] = [];

  private lastPaintTime = 0;
  private cooldown = 500; // ms

  ngAfterViewInit() {
    this.updateCanvasSize();

    // Subscribe to pixels
    this.game.pixels$
      .pipe(takeUntil(this.destroy$))
      .subscribe(pixels => {
        this.currentPixels = pixels;
        this.redrawCanvas();
      });

    // Subscribe to presence
    this.game.presence$
      .pipe(takeUntil(this.destroy$))
      .subscribe(presence => {
        this.renderPresence(presence);
      });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCanvasSize() {
    const main = this.mainCanvas.nativeElement;
    const overlay = this.overlayCanvas.nativeElement;
    const container = this.container.nativeElement;

    const width = this.gridWidth * this.pixelSize;
    const height = this.gridHeight * this.pixelSize;

    main.width = width;
    main.height = height;
    overlay.width = width;
    overlay.height = height;
    container.style.width = width + 'px';
    container.style.height = height + 'px';
  }

  private redrawCanvas() {
    const ctx = this.mainCanvas.nativeElement.getContext('2d')!;
    ctx.clearRect(0, 0, this.gridWidth * this.pixelSize, this.gridHeight * this.pixelSize);

    if (this.isGridVisible) {
      this.drawGrid();
    }

    this.renderPixels(this.currentPixels);
  }

  public toggleGrid() {
    this.isGridVisible = !this.isGridVisible;
    this.redrawCanvas();
  }

  private drawGrid() {
    const ctx = this.mainCanvas.nativeElement.getContext('2d')!;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let i = 0; i <= this.gridWidth; i++) {
      const pos = i * this.pixelSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, this.gridHeight * this.pixelSize);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = 0; i <= this.gridHeight; i++) {
      const pos = i * this.pixelSize;
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(this.gridWidth * this.pixelSize, pos);
      ctx.stroke();
    }
  }

  private renderPixels(pixels: Pixel[]) {
    const ctx = this.mainCanvas.nativeElement.getContext('2d')!;
    pixels.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x * this.pixelSize, p.y * this.pixelSize, this.pixelSize, this.pixelSize);
    });
  }

  private renderPresence(presence: Map<string, PresenceState>) {
    const ctx = this.overlayCanvas.nativeElement.getContext('2d')!;
    ctx.clearRect(0, 0, this.gridWidth * this.pixelSize, this.gridHeight * this.pixelSize);

    const currentUser = this.auth.getCurrentUser();

    presence.forEach((state, key) => {
      if (currentUser && state.user_id === currentUser.id) return; // Hide self cursor

      // Draw other user cursors
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.fillRect(state.x * this.pixelSize, state.y * this.pixelSize, this.pixelSize, this.pixelSize);

      // Draw username label with high contrast (black text, white border)
      ctx.font = '12px sans-serif'; // slightly larger for readability
      
      const textX = state.x * this.pixelSize;
      const textY = state.y * this.pixelSize - 5;
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeText(state.username, textX, textY);
      
      ctx.fillStyle = 'black';
      ctx.fillText(state.username, textX, textY);
    });
  }

  onMouseDown(event: MouseEvent) {
    this.paint(event);
  }

  onMouseMove(event: MouseEvent) {
    const rect = this.overlayCanvas.nativeElement.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.pixelSize);
    const y = Math.floor((event.clientY - rect.top) / this.pixelSize);

    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
      this.game.updatePresence(x, y);
    }

    if (event.buttons === 1) {
      this.paint(event);
    }
  }

  onMouseUp(event: MouseEvent) { }

  onMouseLeave() {
    // Optionally hide cursor
  }

  private paint(event: MouseEvent) {
    const now = Date.now();
    if (now - this.lastPaintTime < this.cooldown) return;

    const rect = this.overlayCanvas.nativeElement.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.pixelSize);
    const y = Math.floor((event.clientY - rect.top) / this.pixelSize);

    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
      this.game.paintPixel(x, y, this.selectedColor);
      this.lastPaintTime = now;

      // Optimistic update
      const ctx = this.mainCanvas.nativeElement.getContext('2d')!;
      ctx.fillStyle = this.selectedColor;
      ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    }
  }
}
