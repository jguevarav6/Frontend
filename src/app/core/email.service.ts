import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { Observable, from } from 'rxjs';

/**
 * Servicio para envío de emails usando EmailJS
 * 
 * CONFIGURACIÓN REQUERIDA:
 * 1. Crear cuenta en https://www.emailjs.com/ (GRATIS)
 * 2. Crear un Email Service (Gmail, Outlook, etc.)
 * 3. Crear un Email Template
 * 4. Copiar las claves y reemplazar en environment.ts
 */

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // IMPORTANTE: Estas claves deben estar en environment.ts
  // Por ahora las dejo aquí para facilitar la configuración inicial
  private readonly PUBLIC_KEY = 'TU_PUBLIC_KEY_AQUI';  // Reemplazar después de registrarte
  private readonly SERVICE_ID = 'TU_SERVICE_ID_AQUI';   // Reemplazar
  private readonly TEMPLATE_ID = 'TU_TEMPLATE_ID_AQUI'; // Reemplazar

  constructor() {
    // Inicializar EmailJS con la clave pública
    emailjs.init(this.PUBLIC_KEY);
  }

  /**
   * Envía un email con el código de verificación
   * @param toEmail Email del destinatario
   * @param userName Nombre del usuario
   * @param verificationCode Código de 6 dígitos
   */
  sendVerificationCode(toEmail: string, userName: string, verificationCode: string): Observable<any> {
    const templateParams = {
      to_email: toEmail,
      to_name: userName,
      verification_code: verificationCode,
      subject: '🔐 Código de Verificación - TaxAssist',
      message: `Tu código de verificación es: ${verificationCode}. Este código expira en 5 minutos.`
    };

    // Convertir Promise a Observable
    return from(
      emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      )
    );
  }

  /**
   * Verifica si el servicio está configurado
   */
  isConfigured(): boolean {
    return this.PUBLIC_KEY !== 'TU_PUBLIC_KEY_AQUI' && 
           this.SERVICE_ID !== 'TU_SERVICE_ID_AQUI' && 
           this.TEMPLATE_ID !== 'TU_TEMPLATE_ID_AQUI';
  }
}
