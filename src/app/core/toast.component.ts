import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from './toast.service';

interface ToastWithId extends ToastMessage {
  id: number;
  removing?: boolean;
}

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <div *ngFor="let t of toasts" 
           class="toast" 
           [ngClass]="['toast-' + (t.type || 'info'), t.removing ? 'toast-slide-out' : 'toast-slide-in']">
        <div class="toast-icon">
          <svg *ngIf="t.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg *ngIf="t.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg *ngIf="t.type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="toast-content">{{ t.text }}</div>
        <button class="toast-close" (click)="removeToast(t.id)" aria-label="Cerrar notificación">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    .toast-container { 
      position: fixed; 
      right: 24px; 
      bottom: 24px; 
      z-index: 9999; 
      display: flex; 
      flex-direction: column; 
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }
    
    .toast { 
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px; 
      border-radius: 12px; 
      color: #fff; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1);
      backdrop-filter: blur(8px);
      font-size: 14px;
      font-weight: 500;
      min-width: 300px;
      border: 1px solid rgba(255,255,255,0.1);
      pointer-events: auto;
    }
    
    .toast-success { 
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    }
    
    .toast-error { 
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }
    
    .toast-info { 
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    }
    
    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .toast-content {
      flex: 1;
      line-height: 1.4;
    }
    
    .toast-close {
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 6px;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      color: white;
    }
    
    .toast-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    
    .toast-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
    
    .toast-slide-out {
      animation: slideOut 0.3s ease-in forwards;
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .toast-container {
        right: 16px;
        left: 16px;
        bottom: 16px;
      }
      
      .toast {
        min-width: auto;
        width: 100%;
      }
    }
    `
  ]
})
export class ToastComponent implements OnInit {
  toasts: ToastWithId[] = [];
  private nextId = 0;
  
  constructor(private toast: ToastService) {}
  
  ngOnInit(): void {
    this.toast.onToast().subscribe((m) => {
      const toastWithId: ToastWithId = { ...m, id: this.nextId++, removing: false };
      this.toasts.push(toastWithId);
      
      // Auto-remove after duration
      const duration = m.duration || 2500;
      setTimeout(() => {
        this.removeToast(toastWithId.id);
      }, duration);
    });
  }
  
  removeToast(id: number): void {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;
    
    // Mark as removing to trigger slide-out animation
    this.toasts[index].removing = true;
    
    // Actually remove from array after animation completes
    setTimeout(() => {
      const currentIndex = this.toasts.findIndex(t => t.id === id);
      if (currentIndex !== -1) {
        this.toasts.splice(currentIndex, 1);
      }
    }, 300); // Match animation duration
  }
}
