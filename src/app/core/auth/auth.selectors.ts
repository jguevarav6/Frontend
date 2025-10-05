import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectAuthToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserRole = createSelector(
  selectCurrentUser,
  (user) => user?.role || null
);

export const selectUserName = createSelector(
  selectCurrentUser,
  (user) => user?.name || ''
);

export const selectIsAdmin = createSelector(
  selectUserRole,
  (role) => role === 'admin'
);
