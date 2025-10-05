import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap, catchError } from 'rxjs/operators';
import { EmailService } from '../email.service';
import { StorageService } from '../storage.service';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  email: string;
  password: string;
  verificationCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  requiresVerification?: boolean;
}

export interface VerificationCodeResponse {
  code: string;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'app_users';
  private readonly AUTH_KEY = 'app_auth_token';
  private readonly CURRENT_USER_KEY = 'app_current_user';
  private readonly VERIFICATION_CODE_KEY = 'app_verification_code';

  constructor(
    private emailService: EmailService,
    private storage: StorageService
  ) {}

  /**
   * Registrar nuevo usuario
   */
  register(data: RegisterData): Observable<AuthResponse> {
    const users = this.getStoredUsers();
    
    // Validar que el email no exista
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return throwError({ error: 'El email ya está registrado' }).pipe(delay(500));
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: Date.now(),
      email: data.email,
      name: data.name,
      role: 'user'
    };

    // Guardar usuario con contraseña hasheada (simulado)
    const userWithPassword = {
      ...newUser,
      password: this.hashPassword(data.password)
    };

    users.push(userWithPassword);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Generar token
    const token = this.generateToken(newUser);
    
    // Guardar sesión
    this.saveSession(newUser, token);

    return of({
      user: newUser,
      token
    }).pipe(delay(800)); // Simular latencia de red
  }

  /**
   * Iniciar sesión con código de verificación
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const users = this.getStoredUsers();
    
    const userWithPassword = users.find(
      u => u.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!userWithPassword) {
      return throwError({ error: 'Email o contraseña incorrectos' }).pipe(delay(500));
    }

    // Verificar contraseña
    const hashedPassword = this.hashPassword(credentials.password);
    if (userWithPassword.password !== hashedPassword) {
      return throwError({ error: 'Email o contraseña incorrectos' }).pipe(delay(500));
    }

    // Si no se proporcionó código de verificación, enviarlo y requerir verificación
    if (!credentials.verificationCode) {
      const code = this.generateVerificationCode();
      const { password, ...user } = userWithPassword;
      
      this.saveVerificationCode(credentials.email, code);
      
      // Intentar enviar email real
      if (this.emailService.isConfigured()) {
        // EmailJS configurado - enviar email real
        return this.emailService.sendVerificationCode(
          credentials.email,
          user.name,
          code
        ).pipe(
          switchMap(() => {
            console.log(`[AUTH] ✅ Email enviado exitosamente a ${credentials.email}`);
            return of({
              user: null as any,
              token: '',
              requiresVerification: true
            });
          }),
          catchError(error => {
            console.error('[AUTH] ❌ Error al enviar email:', error);
            console.log(`[AUTH] 📧 Código de verificación (fallback): ${code}`);
            // Aunque falle el envío, permitir continuar mostrando en consola
            return of({
              user: null as any,
              token: '',
              requiresVerification: true
            });
          }),
          delay(500)
        );
      } else {
        // EmailJS NO configurado - mostrar en consola
        console.warn('[AUTH] ⚠️ EmailJS no configurado. Ver instrucciones en email.service.ts');
        console.log(`[AUTH] 📧 Código de verificación para ${credentials.email}: ${code}`);
        console.log(`[AUTH] 💡 Para recibir emails reales, configura EmailJS siguiendo las instrucciones`);
        
        return of({
          user: null as any,
          token: '',
          requiresVerification: true
        }).pipe(delay(800));
      }
    }

    // Verificar el código
    const isCodeValid = this.verifyCode(credentials.email, credentials.verificationCode);
    if (!isCodeValid) {
      return throwError({ error: 'Código de verificación incorrecto o expirado' }).pipe(delay(500));
    }

    // Crear objeto usuario sin contraseña
    const { password, ...user } = userWithPassword;
    
    // Generar token
    const token = this.generateToken(user as User);
    
    // Guardar sesión
    this.saveSession(user as User, token);

    // Limpiar código de verificación
    this.clearVerificationCode(credentials.email);

    return of({
      user: user as User,
      token
    }).pipe(delay(800)); // Simular latencia de red
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.storage.removeItem(this.AUTH_KEY);
    this.storage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser(): User | null {
    return this.storage.getItem<User>(this.CURRENT_USER_KEY, null);
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return this.storage.getItem<string>(this.AUTH_KEY, null);
  }

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  /**
   * Validar token (simulado)
   */
  validateToken(token: string): Observable<boolean> {
    // En producción, esto haría una llamada al backend
    const isValid = !!token && token.startsWith('token_');
    return of(isValid).pipe(delay(300));
  }

  // ========== MÉTODOS PRIVADOS ==========

  private getStoredUsers(): any[] {
    const users = this.storage.getItem<any[]>(this.USERS_KEY, null);
    if (!users) {
      // Crear usuarios por defecto
      const defaultUsers = [
        {
          id: 1,
          email: 'admin@test.com',
          name: 'Administrador',
          role: 'admin',
          password: this.hashPassword('admin123')
        },
        {
          id: 2,
          email: 'user@test.com',
          name: 'Usuario',
          role: 'user',
          password: this.hashPassword('user123')
        }
      ];
      this.storage.setItem(this.USERS_KEY, defaultUsers);
      return defaultUsers;
    }
    return users;
  }

  private saveSession(user: User, token: string): void {
    this.storage.setItem(this.AUTH_KEY, token);
    this.storage.setItem(this.CURRENT_USER_KEY, user);
  }

  private generateToken(user: User): string {
    // Token simple (en producción usar JWT)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `token_${user.id}_${timestamp}_${random}`;
  }

  private hashPassword(password: string): string {
    // Hash simple (en producción usar bcrypt o similar)
    // Solo para demo, NO usar en producción real
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash_${hash.toString(16)}`;
  }

  /**
   * Genera un código de verificación de 6 dígitos
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Guarda el código de verificación en localStorage con tiempo de expiración (5 minutos)
   */
  private saveVerificationCode(email: string, code: string): void {
    const verificationData = {
      email: email.toLowerCase(),
      code,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutos
    };
    this.storage.setItem(this.VERIFICATION_CODE_KEY, verificationData);
  }

  /**
   * Verifica si el código proporcionado es correcto y no ha expirado
   */
  private verifyCode(email: string, code: string): boolean {
    const verificationData = this.storage.getItem<any>(this.VERIFICATION_CODE_KEY, null);
    if (!verificationData) {
      return false;
    }

    // Verificar email
    if (verificationData.email !== email.toLowerCase()) {
      return false;
    }

    // Verificar expiración
    if (Date.now() > verificationData.expiresAt) {
      this.clearVerificationCode(email);
      return false;
    }

    // Verificar código
    return verificationData.code === code;
  }

  /**
   * Limpia el código de verificación
   */
  private clearVerificationCode(email: string): void {
    const verificationData = this.storage.getItem<any>(this.VERIFICATION_CODE_KEY, null);
    if (verificationData?.email === email.toLowerCase()) {
      this.storage.removeItem(this.VERIFICATION_CODE_KEY);
    }
  }
}
