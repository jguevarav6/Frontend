import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ToastService } from '../toast.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  // ========== LOGIN ==========
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map(response => {
            // Si requiere verificación, mostrar mensaje y no hacer login
            if (response.requiresVerification) {
              this.toast.show('📧 Código enviado! Revisa tu email (o consola si EmailJS no está configurado)', 'info', 6000);
              return AuthActions.loginFailure({ 
                error: 'VERIFICATION_REQUIRED',
                requiresVerification: true 
              });
            }
            
            console.log('[AuthEffects] Login success:', response.user.email);
            return AuthActions.loginSuccess({
              user: response.user,
              token: response.token
            });
          }),
          catchError(error => {
            console.error('[AuthEffects] Login error:', error);
            const errorMsg = error?.error || 'Error al iniciar sesión';
            return of(AuthActions.loginFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          this.toast.show(`✓ Bienvenido ${user.name}`, 'success');
          this.router.navigate(['/items']);
        })
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          this.toast.show(`❌ ${error}`, 'error');
        })
      ),
    { dispatch: false }
  );

  // ========== REGISTER ==========
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ data }) =>
        this.authService.register(data).pipe(
          map(response => {
            console.log('[AuthEffects] Register success:', response.user.email);
            return AuthActions.registerSuccess({
              user: response.user,
              token: response.token
            });
          }),
          catchError(error => {
            console.error('[AuthEffects] Register error:', error);
            const errorMsg = error?.error || 'Error al registrar usuario';
            return of(AuthActions.registerFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ user }) => {
          this.toast.show(`✓ Cuenta creada para ${user.name}`, 'success');
          this.router.navigate(['/items']);
        })
      ),
    { dispatch: false }
  );

  registerFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerFailure),
        tap(({ error }) => {
          this.toast.show(`❌ ${error}`, 'error');
        })
      ),
    { dispatch: false }
  );

  // ========== LOGOUT ==========
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          console.log('[AuthEffects] Logout');
          this.authService.logout();
          this.toast.show('✓ Sesión cerrada', 'info');
          this.router.navigate(['/auth/login']);
        }),
        map(() => AuthActions.logoutSuccess())
      )
  );

  // ========== CHECK AUTH ==========
  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      switchMap(() => {
        const user = this.authService.getCurrentUser();
        const token = this.authService.getToken();

        if (user && token) {
          console.log('[AuthEffects] Auth restored from localStorage:', user.email);
          return of(AuthActions.checkAuthSuccess({ user, token }));
        } else {
          return of(AuthActions.checkAuthFailure());
        }
      })
    )
  );
}
