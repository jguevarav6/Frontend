import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <div *ngFor="let t of toasts" class="toast" [ngClass]="t.type || ''">{{ t.text }}</div>
    </div>
  `,
  styles: [
    `.toast-container { position: fixed; right: 16px; bottom: 16px; z-index: 9999; display:flex; flex-direction:column; gap:8px; }
     .toast { padding: 10px 14px; border-radius:8px; color:#fff; box-shadow:0 6px 20px rgba(2,44,67,0.08); }
     .toast.success { background: #16a34a; }
     .toast.error { background: #dc2626; }
     .toast.info { background: #0ea5e9; }
    `
  ]
})
export class ToastComponent implements OnInit {
  toasts: ToastMessage[] = [];
  constructor(private toast: ToastService) {}
  ngOnInit(): void {
    this.toast.onToast().subscribe((m) => {
      this.toasts.push(m);
      const idx = this.toasts.length - 1;
      setTimeout(() => this.toasts.splice(idx, 1), m.duration || 3500);
    });
  }
}
