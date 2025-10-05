import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../../core/auth/auth.service';
import { selectCurrentUser } from '../../../../core/auth/auth.selectors';
import { logout } from '../../../../core/auth/auth.actions';
import { ToastService } from '../../../../core/toast.service';
import { ConfirmService } from '../../../../core/confirm.service';

@Component({
  selector: 'app-items-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() logoLoadError = false;
  collapsed = false;
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;

  constructor(
    private store: Store,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('[Sidebar] Current user updated:', user);
    });
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  onLogoError(event: Event) {
    this.logoLoadError = true;
    console.warn('Error loading logo:', event);
  }

  onComingSoon(feature: string) {
    this.toastService.show(`${feature} - Próximamente disponible`, 'info');
  }

  async onLogout() {
    const confirmed = await this.confirmService.confirmAsync({
      title: 'Cerrar Sesión',
      message: '¿Está seguro que desea cerrar su sesión actual?',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar'
    });
    
    if (confirmed) {
      this.store.dispatch(logout());
    }
  }
}
