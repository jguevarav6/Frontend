import { createAction, props } from '@ngrx/store';
import { User, LoginCredentials, RegisterData, AuthResponse } from './auth.service';

// ========== LOGIN ==========
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginCredentials }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string; requiresVerification?: boolean }>()
);

// ========== REGISTER ==========
export const register = createAction(
  '[Auth] Register',
  props<{ data: RegisterData }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; token: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// ========== LOGOUT ==========
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// ========== INIT ==========
export const checkAuth = createAction('[Auth] Check Auth');

export const checkAuthSuccess = createAction(
  '[Auth] Check Auth Success',
  props<{ user: User; token: string }>()
);

export const checkAuthFailure = createAction('[Auth] Check Auth Failure');
