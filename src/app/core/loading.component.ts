import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectItemsLoading } from '../features/items/state/items.selectors';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { BehaviorSubject, timer } from 'rxjs';

@Component({
  selector: 'app-loading',
  template: `
    <div *ngIf="loading$ | async" class="loading-backdrop">
      <div class="spinner"></div>
    </div>
  `,
  styles: [
    `.loading-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.6);z-index:2000}
     .spinner{width:48px;height:48px;border-radius:50%;border:6px solid rgba(2,44,67,0.12);border-top-color:#08263a;animation:spin 1s linear infinite}
     @keyframes spin{to{transform:rotate(360deg)}}
    `]
})
export class LoadingComponent {
  loading$: Observable<boolean>;
  private raw$ = new BehaviorSubject<boolean>(false);
  constructor(private store: Store) {
    // raw$ receives the store loading state and we expose a debounced version
    (this.store.select(selectItemsLoading) as Observable<boolean>).subscribe((v) => this.raw$.next(v));
    // show the spinner only if loading lasts more than 150ms; keep it visible at least 250ms to avoid flicker
    this.loading$ = this.raw$.pipe(
      distinctUntilChanged(),
      switchMap((isLoading) => {
        if (isLoading) {
          return timer(150).pipe(map(() => true));
        } else {
          // ensure spinner stays visible briefly before hiding
          return timer(250).pipe(map(() => false));
        }
      })
    );
  }
}
