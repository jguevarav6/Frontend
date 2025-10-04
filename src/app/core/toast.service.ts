import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastMessage { text: string; type?: 'success' | 'error' | 'info'; duration?: number }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new Subject<ToastMessage>();

  onToast(): Observable<ToastMessage> { return this.subject.asObservable(); }

  show(msg: string, type: 'success'|'error'|'info' = 'success', duration = 3500) {
    this.subject.next({ text: msg, type, duration });
  }
}
