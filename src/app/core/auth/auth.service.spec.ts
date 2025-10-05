import { TestBed } from '@angular/core/testing';
import { AuthService, User, LoginCredentials, RegisterData } from './auth.service';
import { EmailService } from '../email.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let emailServiceSpy: jasmine.SpyObj<EmailService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('EmailService', ['sendVerificationCode', 'isConfigured']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: EmailService, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    emailServiceSpy = TestBed.inject(EmailService) as jasmine.SpyObj<EmailService>;
    
    // Configurar spy por defecto para que EmailService no esté configurado
    emailServiceSpy.isConfigured.and.returnValue(false);
    
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(response => {
        expect(response.user).toBeTruthy();
        expect(response.user.email).toBe('test@example.com');
        expect(response.user.name).toBe('Test User');
        expect(response.user.role).toBe('user');
        expect(response.token).toBeTruthy();
        done();
      });
    });

    it('should save user to localStorage after registration', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(() => {
        const users = JSON.parse(localStorage.getItem('app_users') || '[]');
        expect(users.length).toBeGreaterThan(0); // Incluye usuarios por defecto
        const registered = users.find((u: any) => u.email === 'test@example.com');
        expect(registered).toBeTruthy();
        expect(registered.name).toBe('Test User');
        done();
      });
    });

    it('should reject registration with duplicate email', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Primer registro
      service.register(registerData).subscribe(() => {
        // Segundo registro con mismo email
        service.register(registerData).subscribe(
          () => fail('Should have failed'),
          error => {
            expect(error.error).toBe('El email ya está registrado');
            done();
          }
        );
      });
    });

    it('should hash password when storing user', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(() => {
        const users = JSON.parse(localStorage.getItem('app_users') || '[]');
        const registered = users.find((u: any) => u.email === 'test@example.com');
        expect(registered.password).toBeTruthy();
        expect(registered.password).not.toBe('password123'); // Password should be hashed
        expect(registered.password).toContain('hash_'); // Verifica formato
        done();
      });
    });

    it('should save session after successful registration', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(response => {
        const tokenRaw = localStorage.getItem('app_auth_token');
        const currentUserRaw = localStorage.getItem('app_current_user');
        
        expect(tokenRaw).toBeTruthy();
        const token = JSON.parse(tokenRaw!);
        expect(token).toBe(response.token);
        
        expect(currentUserRaw).toBeTruthy();
        const user = JSON.parse(currentUserRaw!);
        expect(user.email).toBe('test@example.com');
        done();
      });
    });
  });

  describe('User Login', () => {
    beforeEach((done) => {
      // Registrar un usuario de prueba
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      service.register(registerData).subscribe(() => {
        localStorage.removeItem('app_auth_token');
        localStorage.removeItem('app_current_user');
        localStorage.removeItem('app_verification_code');
        done();
      });
    });

    it('should reject login with incorrect email', (done) => {
      const credentials: LoginCredentials = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(
        () => fail('Should have failed'),
        error => {
          expect(error.error).toBe('Email o contraseña incorrectos');
          done();
        }
      );
    });

    it('should reject login with incorrect password', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(credentials).subscribe(
        () => fail('Should have failed'),
        error => {
          expect(error.error).toBe('Email o contraseña incorrectos');
          done();
        }
      );
    });

    it('should request verification code on first login attempt', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(response => {
        expect(response.requiresVerification).toBe(true);
        
        // Verificar que el código se guardó en localStorage
        const stored = localStorage.getItem('app_verification_code');
        expect(stored).toBeTruthy();
        done();
      });
    });

    it('should complete login with valid verification code', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Primer intento - solicitar código
      service.login(credentials).subscribe(firstResponse => {
        expect(firstResponse.requiresVerification).toBe(true);
        
        // Obtener el código del localStorage
        const storedData = JSON.parse(localStorage.getItem('app_verification_code')!);
        const code = storedData.code;

        // Segundo intento - con código
        const credentialsWithCode: LoginCredentials = {
          ...credentials,
          verificationCode: code
        };

        service.login(credentialsWithCode).subscribe(finalResponse => {
          expect(finalResponse.user).toBeTruthy();
          expect(finalResponse.user.email).toBe('test@example.com');
          expect(finalResponse.token).toBeTruthy();
          expect(service.isAuthenticated()).toBe(true);
          done();
        });
      });
    });

    it('should reject login with invalid verification code', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Primer intento - solicitar código
      service.login(credentials).subscribe(() => {
        // Segundo intento - con código inválido
        const credentialsWithCode: LoginCredentials = {
          ...credentials,
          verificationCode: '000000' // Código inválido
        };

        service.login(credentialsWithCode).subscribe(
          () => fail('Should have failed'),
          error => {
            expect(error.error).toContain('Código de verificación');
            done();
          }
        );
      });
    });

    it('should be case-insensitive for email login', (done) => {
      const credentials: LoginCredentials = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };

      // Debería encontrar el usuario y solicitar verificación
      service.login(credentials).subscribe(response => {
        expect(response.requiresVerification).toBe(true);
        done();
      });
    });
  });

  describe('Session Management', () => {
    it('should get current user from localStorage', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(() => {
        const currentUser = service.getCurrentUser();
        expect(currentUser).toBeTruthy();
        expect(currentUser!.email).toBe('test@example.com');
        done();
      });
    });

    it('should return null when no user is logged in', () => {
      const currentUser = service.getCurrentUser();
      expect(currentUser).toBeNull();
    });

    it('should check if user is authenticated', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(() => {
        const isAuth = service.isAuthenticated();
        expect(isAuth).toBe(true);
        done();
      });
    });

    it('should return false for isAuthenticated when no token', () => {
      const isAuth = service.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should logout and clear session', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(() => {
        service.logout();

        const token = localStorage.getItem('app_auth_token');
        const currentUser = localStorage.getItem('app_current_user');
        
        expect(token).toBeNull();
        expect(currentUser).toBeNull();
        expect(service.isAuthenticated()).toBe(false);
        done();
      });
    });

    it('should get token from localStorage', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(response => {
        const token = service.getToken();
        expect(token).toBe(response.token);
        done();
      });
    });

    it('should validate valid token', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(response => {
        service.validateToken(response.token).subscribe(isValid => {
          expect(isValid).toBe(true);
          done();
        });
      });
    });

    it('should reject invalid token', (done) => {
      service.validateToken('invalid_token').subscribe(isValid => {
        expect(isValid).toBe(false);
        done();
      });
    });
  });

  describe('Token Generation', () => {
    it('should generate unique tokens for different users', (done) => {
      const user1: RegisterData = {
        email: 'user1@example.com',
        password: 'password123',
        name: 'User One'
      };

      const user2: RegisterData = {
        email: 'user2@example.com',
        password: 'password123',
        name: 'User Two'
      };

      service.register(user1).subscribe(response1 => {
        service.logout();
        
        service.register(user2).subscribe(response2 => {
          expect(response1.token).not.toBe(response2.token);
          done();
        });
      });
    });

    it('should generate tokens with correct format', (done) => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      service.register(registerData).subscribe(response => {
        expect(response.token).toContain('token_');
        done();
      });
    });
  });

  describe('Default Users', () => {
    it('should create default users on first load', (done) => {
      // Forzar recreación de usuarios por defecto
      localStorage.removeItem('app_users');
      
      const credentials: LoginCredentials = {
        email: 'admin@test.com',
        password: 'admin123'
      };

      service.login(credentials).subscribe(response => {
        expect(response.requiresVerification).toBe(true);
        
        // Verificar que se crearon los usuarios por defecto
        const users = JSON.parse(localStorage.getItem('app_users') || '[]');
        expect(users.length).toBeGreaterThan(0);
        expect(users.some((u: any) => u.email === 'admin@test.com')).toBe(true);
        expect(users.some((u: any) => u.email === 'user@test.com')).toBe(true);
        done();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle corrupted user data in localStorage', () => {
      localStorage.setItem('app_current_user', 'invalid json {[}');
      
      const currentUser = service.getCurrentUser();
      expect(currentUser).toBeNull();
    });

    it('should handle missing verification code gracefully', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        verificationCode: '123456'
      };

      // Intentar login con código sin haberlo solicitado primero
      service.login(credentials).subscribe(
        () => fail('Should have failed'),
        error => {
          expect(error.error).toContain('Email o contraseña incorrectos');
          done();
        }
      );
    });
  });
});
