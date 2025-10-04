import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmOptions { title?: string; message: string; confirmText?: string; cancelText?: string }

// Payload sent to the component includes the options and the opener element
export interface ConfirmRequest { opts: ConfirmOptions | null; opener?: Element | null }

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private subject = new Subject<ConfirmRequest>();

  // Observable that modal component subscribes to show options
  onRequest(): Observable<ConfirmRequest> { return this.subject.asObservable(); }

  // Show confirm and return a promise that resolves with boolean
  confirmAsync(opts: ConfirmOptions): Promise<boolean> {
    // capture the currently focused element so we can restore focus after the modal closes
    const opener = (document && document.activeElement) ? document.activeElement as Element : null;
    this.subject.next({ opts, opener });
    return new Promise((resolve) => {
      const handler = (ev: any) => {
        window.removeEventListener('app-confirm-result', handler as any);
        resolve(ev?.detail?.confirmed === true);
      };
      window.addEventListener('app-confirm-result', handler as any);
    });
  }

  // Programmatically clear modal
  clear() { this.subject.next({ opts: null, opener: null }); }
}
