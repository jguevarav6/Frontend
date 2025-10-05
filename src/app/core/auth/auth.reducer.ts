import { createReducer, on } from '@ngrx/store';
import { User } from './auth.service';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

export const authReducer = createReducer(
  initialState,

  // ========== LOGIN ==========
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
    isAuthenticated: true
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false
  })),

  // ========== REGISTER ==========
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
    isAuthenticated: true
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false
  })),

  // ========== LOGOUT ==========
  on(AuthActions.logout, AuthActions.logoutSuccess, () => ({
    ...initialState
  })),

  // ========== CHECK AUTH ==========
  on(AuthActions.checkAuth, (state) => ({
    ...state,
    loading: true
  })),

  on(AuthActions.checkAuthSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    isAuthenticated: true
  })),

  on(AuthActions.checkAuthFailure, (state) => ({
    ...initialState,
    loading: false
  }))
);
