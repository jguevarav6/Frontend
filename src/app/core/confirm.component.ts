import { Component, OnInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ConfirmService, ConfirmOptions, ConfirmRequest } from './confirm.service';
import { trapFocus } from './focus-trap';

@Component({
  selector: 'app-confirm',
  template: `
    <div *ngIf="show" class="confirm-backdrop" (keydown)="onKey($event)">
      <div #panel class="confirm-panel" role="dialog" aria-modal="true" [attr.aria-label]="opts?.title || 'Confirmar'">
        <h3>{{opts?.title || 'Confirmar'}}</h3>
        <p>{{opts?.message}}</p>
        <div class="actions">
          <button #cancelBtn (click)="cancel()">{{opts?.cancelText || 'Cancelar'}}</button>
          <button #confirmBtn class="confirm" (click)="ok()">{{opts?.confirmText || 'Aceptar'}}</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.confirm-backdrop { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.35); z-index:2000 }
     .confirm-panel { background:white; padding:18px; border-radius:8px; width:320px; }
     .actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px }
     .confirm { background:#dc2626; color:white; border:none; padding:8px 12px; border-radius:6px }
     button { padding:8px 12px; border-radius:6px }
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
    window.dispatchEvent(new CustomEvent('app-confirm-result', { detail: { confirmed: true } }));
    this.close();
  }
  cancel() {
    window.dispatchEvent(new CustomEvent('app-confirm-result', { detail: { confirmed: false } }));
    this.close();
  }
  close() {
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
