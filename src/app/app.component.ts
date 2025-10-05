import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { checkAuth } from './core/auth/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /** Sidebar abierto en móvil */
  mobileOpen = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Verificar si hay sesión guardada al iniciar la app
    this.store.dispatch(checkAuth());
  }
}
