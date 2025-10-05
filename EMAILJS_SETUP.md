# 📧 Configuración de EmailJS - Guía Paso a Paso

## ✅ **¿Qué es EmailJS?**

EmailJS es un servicio **gratuito** que permite enviar emails directamente desde JavaScript sin necesidad de un servidor backend.

- ✅ **Gratis**: Hasta 200 emails/mes
- ✅ **Sin Backend**: Funciona directamente desde el navegador
- ✅ **Fácil**: 5 minutos de configuración
- ✅ **Seguro**: Las credenciales se manejan en su servidor

---

## 🚀 **Paso 1: Crear Cuenta en EmailJS**

1. Ve a: **https://www.emailjs.com/**
2. Click en **"Sign Up"** (Registrarse)
3. Completa el formulario:
   - Email: `tu_email@gmail.com` (el que quieras usar)
   - Password: crea una contraseña segura
4. **Verifica tu email** (revisa bandeja de entrada o spam)

---

## 📧 **Paso 2: Conectar tu Cuenta de Email**

### Opción A: Gmail (Recomendado)

1. En el dashboard de EmailJS, ve a **"Email Services"**
2. Click en **"Add New Service"**
3. Selecciona **"Gmail"**
4. Click en **"Connect Account"**
5. Se abrirá Google OAuth → **Autoriza el acceso**
6. ✅ Listo! Copia el **Service ID** (algo como `service_abc123`)

### Opción B: Outlook/Hotmail

1. En **"Email Services"** → **"Add New Service"**
2. Selecciona **"Outlook"**
3. Ingresa tus credenciales de Outlook
4. ✅ Copia el **Service ID**

### Opción C: Otro proveedor

EmailJS soporta: Yahoo, AOL, FastMail, Zoho, iCloud, etc.

---

## 📝 **Paso 3: Crear Template de Email**

1. Ve a **"Email Templates"**
2. Click en **"Create New Template"**
3. Configura así:

### **Template Settings:**

**Template Name:** `Verification Code`

**From Name:** `TaxAssist - Sistema Fiscal`

**From Email:** `{{from_email}}` (déjalo así)

**Subject:** `🔐 Tu Código de Verificación`

### **Content (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            color: #2563eb;
            margin-bottom: 30px;
        }
        .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            letter-spacing: 8px;
            margin: 30px 0;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Código de Verificación</h1>
        </div>
        
        <p>Hola <strong>{{to_name}}</strong>,</p>
        
        <p>Has solicitado iniciar sesión en TaxAssist. Usa el siguiente código de verificación:</p>
        
        <div class="code-box">
            {{verification_code}}
        </div>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong> Este código expira en <strong>5 minutos</strong>. 
            Si no solicitaste este código, ignora este email.
        </div>
        
        <p>Si tienes problemas, contáctanos.</p>
        
        <div class="footer">
            <p>© 2025 TaxAssist - Sistema de Gestión Fiscal</p>
            <p>Este es un email automático, por favor no respondas.</p>
        </div>
    </div>
</body>
</html>
```

4. **Variables del template** (deben coincidir):
   - `{{to_name}}` → Nombre del usuario
   - `{{to_email}}` → Email destino
   - `{{verification_code}}` → Código de 6 dígitos
   - `{{from_email}}` → Email remitente (auto)

5. Click en **"Save"**
6. ✅ Copia el **Template ID** (algo como `template_xyz789`)

---

## 🔑 **Paso 4: Obtener Public Key**

1. Ve a **"Account"** → **"General"**
2. Busca **"Public Key"** (algo como `abcXYZ123-456`)
3. ✅ Cópiala

---

## 💻 **Paso 5: Configurar en el Proyecto**

Abre el archivo: `src/app/core/email.service.ts`

Reemplaza estas líneas:

```typescript
// ANTES
private readonly PUBLIC_KEY = 'TU_PUBLIC_KEY_AQUI';
private readonly SERVICE_ID = 'TU_SERVICE_ID_AQUI';
private readonly TEMPLATE_ID = 'TU_TEMPLATE_ID_AQUI';

// DESPUÉS (con tus datos reales)
private readonly PUBLIC_KEY = 'abcXYZ123-456';        // Tu Public Key
private readonly SERVICE_ID = 'service_abc123';        // Tu Service ID
private readonly TEMPLATE_ID = 'template_xyz789';      // Tu Template ID
```

---

## 🧪 **Paso 6: Probar**

1. Guarda los cambios
2. Ejecuta: `npm start`
3. Abre: `http://localhost:4200/auth/login`
4. Ingresa: `admin@test.com` / `admin123`
5. Click **"Iniciar Sesión"**
6. **¡Revisa tu email!** 📧

---

## ✅ **Ejemplo Real del Email que Recibirás:**

```
Para: tu_email@gmail.com
De: TaxAssist - Sistema Fiscal
Asunto: 🔐 Tu Código de Verificación

Hola Elena,

Has solicitado iniciar sesión en TaxAssist. Usa el siguiente código:

┌────────────────┐
│   487293      │
└────────────────┘

⚠️ Este código expira en 5 minutos.
```

---

## 🔒 **Seguridad**

- ✅ Las claves PUBLIC_KEY, SERVICE_ID, TEMPLATE_ID **NO son secretas**
- ✅ EmailJS las maneja de forma segura en su servidor
- ✅ Tu contraseña de Gmail/Outlook **nunca** se expone
- ✅ Solo tú puedes enviar emails desde tu cuenta EmailJS

---

## 💡 **Consejos**

### ¿No llega el email?

1. **Revisa spam/correo no deseado**
2. Verifica que el Service ID esté bien copiado
3. Verifica que el Template ID esté bien copiado
4. Revisa la consola del navegador (F12) para ver errores

### Límites del Plan Gratuito:

- 200 emails/mes
- Si necesitas más, planes pagos desde $7/mes

### Alternativas a EmailJS:

- **SendGrid** (100 emails/día gratis)
- **Mailgun** (5,000 emails/mes gratis)
- **Amazon SES** (62,000 emails/mes gratis el primer año)

---

## 📞 **Soporte**

- **Documentación oficial:** https://www.emailjs.com/docs/
- **Dashboard:** https://dashboard.emailjs.com/
- **Soporte:** support@emailjs.com

---

## 🎉 **¡Listo!**

Ahora tu aplicación puede enviar **emails reales** con códigos de verificación.

**Flujo completo:**
1. Usuario → `admin@test.com` / `admin123` → Submit
2. Sistema → Genera código `487293`
3. EmailJS → Envía email a `admin@test.com`
4. Usuario → Recibe email en su bandeja
5. Usuario → Ingresa código `487293`
6. Sistema → ✅ Login exitoso

---

## 📋 **Checklist de Configuración**

- [ ] Cuenta creada en EmailJS
- [ ] Email verificado
- [ ] Service conectado (Gmail/Outlook)
- [ ] Template creado con variables correctas
- [ ] Public Key copiada
- [ ] Service ID copiado
- [ ] Template ID copiado
- [ ] Claves configuradas en `email.service.ts`
- [ ] Aplicación reiniciada
- [ ] Email de prueba enviado ✅

---

**¿Necesitas ayuda?** Revisa la consola del navegador (F12) para ver logs detallados.
