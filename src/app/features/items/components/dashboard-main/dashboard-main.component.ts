import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../../core/auth/auth.service';
import { selectCurrentUser } from '../../../../core/auth/auth.selectors';

@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.scss']
})
export class DashboardMainComponent implements OnInit {
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('[Dashboard] Usuario actual:', user);
    });
  }

  getUserName(): string {
    return this.currentUser?.name || 'Usuario';
  }
}
