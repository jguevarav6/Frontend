import { Component, OnInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ConfirmService, ConfirmOptions, ConfirmRequest } from './confirm.service';
import { trapFocus } from './focus-trap';

@Component({
  selector: 'app-confirm',
  template: `
    <div *ngIf="show" class="confirm-backdrop" (keydown)="onKey($event)">
      <div #panel class="confirm-panel" role="dialog" aria-modal="true" [attr.aria-label]="opts?.title || 'Confirmar'">
        <div class="confirm-header" [class.delete-header]="isDeleteAction">
          <div class="confirm-icon" [class.delete-icon]="isDeleteAction">
            <!-- Icono de Logout -->
            <svg *ngIf="!isDeleteAction" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <!-- Icono de Eliminar -->
            <svg *ngIf="isDeleteAction" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3>{{opts?.title || 'Confirmar'}}</h3>
        </div>
        <p class="confirm-message">{{opts?.message}}</p>
        <div class="actions">
          <button #cancelBtn class="btn-cancel" (click)="cancel()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{opts?.cancelText || 'Cancelar'}}
          </button>
          <button #confirmBtn class="btn-confirm" [class.btn-delete]="isDeleteAction" (click)="ok()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{opts?.confirmText || 'Confirmar'}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .confirm-backdrop { 
      position: fixed; 
      inset: 0; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: rgba(15, 23, 42, 0.75); 
      z-index: 2000;
      backdrop-filter: blur(8px);
      animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes fadeIn {
      from { 
        opacity: 0;
        backdrop-filter: blur(0px);
      }
      to { 
        opacity: 1;
        backdrop-filter: blur(8px);
      }
    }
    
    @keyframes slideUp {
      from { 
        transform: translateY(30px) scale(0.95);
        opacity: 0;
      }
      to { 
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
    
    .confirm-panel { 
      background: #ffffff; 
      padding: 0;
      border-radius: 20px; 
      width: 90%;
      max-width: 420px;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }
    
    .confirm-header {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .confirm-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #ffffff;
      box-shadow: 
        0 8px 24px rgba(15, 23, 42, 0.2),
        0 0 0 4px rgba(15, 23, 42, 0.1);
    }
    
    h3 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    
    .confirm-message {
      margin: 0;
      padding: 28px 32px;
      font-size: 16px;
      line-height: 1.6;
      text-align: center;
      color: #475569;
      font-weight: 400;
    }
    
    .actions { 
      display: flex; 
      gap: 12px; 
      padding: 24px 32px 32px;
      background: #f8fafc;
    }
    
    button {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 140px;
      position: relative;
      overflow: hidden;
    }
    
    button svg {
      width: 18px;
      height: 18px;
      stroke-width: 2.5;
    }
    
    .btn-cancel {
      background: #ffffff;
      color: #475569;
      border: 2px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    
    .btn-cancel:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .btn-confirm { 
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #ffffff;
      border: 2px solid transparent;
      box-shadow: 
        0 4px 14px rgba(15, 23, 42, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .btn-confirm:hover {
      box-shadow: 
        0 6px 20px rgba(15, 23, 42, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
    
    .btn-confirm:active,
    .btn-cancel:active {
      transform: translateY(0);
    }
    
    /* Estilo para acciones de eliminación */
    .delete-header {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    }
    
    .delete-icon {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 
        0 8px 24px rgba(220, 38, 38, 0.3),
        0 0 0 4px rgba(220, 38, 38, 0.1);
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 
        0 4px 14px rgba(220, 38, 38, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .btn-delete:hover {
      background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
      box-shadow: 
        0 6px 20px rgba(220, 38, 38, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
    
    button:focus-visible {
      outline: 3px solid rgba(59, 130, 246, 0.5);
      outline-offset: 2px;
    }
    
    /* Responsive */
    @media (max-width: 480px) {
      .confirm-panel {
        width: 95%;
        max-width: none;
      }
      
      .confirm-header {
        padding: 24px 24px 20px;
      }
      
      .confirm-icon {
        width: 64px;
        height: 64px;
      }
      
      h3 {
        font-size: 22px;
      }
      
      .confirm-message {
        padding: 20px 24px;
        font-size: 15px;
      }
      
      .actions {
        padding: 20px 24px 24px;
        flex-direction: column;
      }
      
      button {
        width: 100%;
        min-width: auto;
      }
    }
    `]
})
export class ConfirmComponent implements OnInit {
  @ViewChild('panel') panelRef!: ElementRef;
  @ViewChild('confirmBtn') confirmBtnRef!: ElementRef;
  @ViewChild('cancelBtn') cancelBtnRef!: ElementRef;

  show = false;
  opts: ConfirmOptions | null = null;
  private opener?: Element | null = null;
  private focusable: HTMLElement[] = [];
  private firstFocusable?: HTMLElement;
  private lastFocusable?: HTMLElement;
  private untrapFn: (() => void) | null = null;

  get isDeleteAction(): boolean {
    const title = this.opts?.title?.toLowerCase() || '';
    const message = this.opts?.message?.toLowerCase() || '';
    return title.includes('eliminar') || message.includes('eliminar');
  }

  constructor(private confirm: ConfirmService, private renderer: Renderer2, private host: ElementRef) {}

  ngOnInit(): void {
    this.confirm.onRequest().subscribe((req: ConfirmRequest) => {
      this.opts = req?.opts || null;
      this.opener = req?.opener || null;
      this.show = !!this.opts;
      if (this.show) {
        // wait for view to render then focus confirm button and trap focus
        setTimeout(() => {
          try { this.confirmBtnRef?.nativeElement?.focus(); } catch {}
          try {
            const panelEl = this.panelRef?.nativeElement as HTMLElement;
            const nodes = panelEl.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])");
            this.focusable = Array.from(nodes || []);
            this.firstFocusable = this.focusable[0];
            this.lastFocusable = this.focusable[this.focusable.length - 1];
            // install focus trap
            this.untrapFn = trapFocus(panelEl);
          } catch {}
        }, 0);
        // prevent background scroll
        this.renderer.addClass(document.body, 'no-scroll');
      } else {
        this.restoreFocus();
        this.renderer.removeClass(document.body, 'no-scroll');
      }
    });
  }

  onKey(ev: KeyboardEvent) {
    if (!this.show) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.cancel();
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      this.ok();
    } else if (ev.key === 'Tab') {
      // basic focus trap
      if (!this.focusable || this.focusable.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const first = this.firstFocusable as HTMLElement;
      const last = this.lastFocusable as HTMLElement;
      if (ev.shiftKey) {
        // shift + tab
        if (active === first) {
          ev.preventDefault();
          last.focus();
        }
      } else {
        // tab
        if (active === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    }
  }

  ok() {
    console.log('[ConfirmComponent] ok() called - emitting confirmed=true');
    this.confirm.emitResult(true);
    this.close();
  }
  cancel() {
    console.log('[ConfirmComponent] cancel() called - emitting confirmed=false');
    this.confirm.emitResult(false);
    this.close();
  }
  close() {
    console.log('[ConfirmComponent] close() called');
    this.show = false;
    this.opts = null;
    this.confirm.clear();
    // remove focus trap
    try { this.untrapFn && this.untrapFn(); } catch {}
    this.restoreFocus();
    this.renderer.removeClass(document.body, 'no-scroll');
  }

  private restoreFocus() {
    try {
      if (this.opener && (this.opener as HTMLElement).focus) {
        (this.opener as HTMLElement).focus();
      }
    } catch {}
  }
}
