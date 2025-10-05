import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmOptions { title?: string; message: string; confirmText?: string; cancelText?: string }

// Payload sent to the component includes the options and the opener element
export interface ConfirmRequest { opts: ConfirmOptions | null; opener?: Element | null }

// Result payload
export interface ConfirmResult { confirmed: boolean }

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private requestSubject = new Subject<ConfirmRequest>();
  private resultSubject = new Subject<ConfirmResult>();

  // Observable that modal component subscribes to show options
  onRequest(): Observable<ConfirmRequest> { return this.requestSubject.asObservable(); }

  // Observable that resolves promises subscribe to
  onResult(): Observable<ConfirmResult> { return this.resultSubject.asObservable(); }

  // Emit result (called by component)
  emitResult(confirmed: boolean) {
    this.resultSubject.next({ confirmed });
  }

  // Show confirm and return a promise that resolves with boolean
  confirmAsync(opts: ConfirmOptions): Promise<boolean> {
    console.log('[ConfirmService] confirmAsync called with message:', opts.message);
    // capture the currently focused element so we can restore focus after the modal closes
    const opener = (document && document.activeElement) ? document.activeElement as Element : null;
    this.requestSubject.next({ opts, opener });
    
    return new Promise((resolve) => {
      const subscription = this.resultSubject.subscribe((result) => {
        console.log('[ConfirmService] result received:', result);
        subscription.unsubscribe();
        resolve(result.confirmed === true);
      });
      
      // Timeout fallback after 30 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        console.log('[ConfirmService] timeout - resolving false');
        resolve(false);
      }, 30000);
    });
  }

  // Programmatically clear modal
  clear() { this.requestSubject.next({ opts: null, opener: null }); }
}
