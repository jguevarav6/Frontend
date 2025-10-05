import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { login } from '../../../core/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../core/auth/auth.selectors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  showPassword = false;
  requiresVerification = false;
  verificationSent = false;
  private errorSubscription?: Subscription;
  
  // Estados para el personaje animado
  isTypingEmail = false;
  isTypingPassword = false;

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      verificationCode: ['']
    });

    // Suscribirse a errores para detectar si requiere verificación
    this.errorSubscription = this.error$.subscribe(error => {
      if (error === 'VERIFICATION_REQUIRED') {
        this.requiresVerification = true;
        this.verificationSent = true;
        this.loginForm.get('verificationCode')?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{6}$/)
        ]);
        this.loginForm.get('verificationCode')?.updateValueAndValidity();
      }
    });
  }

  ngOnDestroy(): void {
    this.errorSubscription?.unsubscribe();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      
      // Si requiere verificación pero no se ha enviado el código, agregamos el campo
      if (this.requiresVerification && !credentials.verificationCode) {
        this.loginForm.get('verificationCode')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
        this.loginForm.get('verificationCode')?.updateValueAndValidity();
        this.loginForm.markAllAsTouched();
        return;
      }
      
      this.store.dispatch(login({ credentials }));
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get verificationCode() {
    return this.loginForm.get('verificationCode');
  }

  onEmailFocus(): void {
    this.isTypingEmail = true;
    this.isTypingPassword = false;
  }

  onEmailBlur(): void {
    this.isTypingEmail = false;
  }

  onPasswordFocus(): void {
    this.isTypingPassword = true;
    this.isTypingEmail = false;
  }

  onPasswordBlur(): void {
    this.isTypingPassword = false;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}
