# 🚀 CONFIGURACIÓN RÁPIDA DE EMAILJS (5 minutos)

## Para recibir códigos en: pedroguevarap50@gmail.com

### ✅ Paso 1: Crear Cuenta
1. Abre: https://www.emailjs.com/
2. Click en **"Sign Up"**
3. Usa tu email: **pedroguevarap50@gmail.com**
4. Crea una contraseña
5. **Verifica tu email** (revisa bandeja de entrada)

---

### ✅ Paso 2: Conectar Gmail

1. Ve al Dashboard de EmailJS
2. Click en **"Email Services"** (menú izquierdo)
3. Click en **"Add New Service"**
4. Selecciona **"Gmail"**
5. Click en **"Connect Account"**
6. Se abre ventana de Google → **Selecciona pedroguevarap50@gmail.com**
7. Click en **"Permitir"** para dar acceso
8. **COPIA** el `Service ID` que aparece (ej: `service_abc123`)

---

### ✅ Paso 3: Crear Template de Email

1. Click en **"Email Templates"** (menú izquierdo)
2. Click en **"Create New Template"**
3. Configura:

**Template Name:** `Codigo Verificacion`

**From Name:** `TaxAssist - Sistema Fiscal`

**Subject:** `🔐 Tu Código de Verificación`

**Content (copiar TODO esto):**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #2563eb; margin-bottom: 30px; }
        .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 30px 0; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Código de Verificación</h1>
        </div>
        <p>Hola <strong>{{to_name}}</strong>,</p>
        <p>Has solicitado iniciar sesión en TaxAssist. Usa el siguiente código:</p>
        <div class="code-box">{{verification_code}}</div>
        <div class="warning">
            <strong>⚠️ Importante:</strong> Este código expira en <strong>5 minutos</strong>.
        </div>
        <div class="footer">
            <p>© 2025 TaxAssist - Sistema de Gestión Fiscal</p>
        </div>
    </div>
</body>
</html>
```

4. Click en **"Save"**
5. **COPIA** el `Template ID` (ej: `template_xyz789`)

---

### ✅ Paso 4: Obtener Public Key

1. Click en tu nombre (arriba derecha)
2. Click en **"Account"**
3. Ve a pestaña **"General"**
4. Busca **"Public Key"**
5. **COPIA** la clave (ej: `abcXYZ123-456`)

---

### ✅ Paso 5: Configurar en el Proyecto

Abre el archivo:
```
src/app/core/email.service.ts
```

**Líneas 17-19**, reemplaza:

```typescript
// ANTES
private readonly PUBLIC_KEY = 'TU_PUBLIC_KEY_AQUI';
private readonly SERVICE_ID = 'TU_SERVICE_ID_AQUI';
private readonly TEMPLATE_ID = 'TU_TEMPLATE_ID_AQUI';

// DESPUÉS (con TUS claves reales)
private readonly PUBLIC_KEY = 'abcXYZ123-456';        // Tu Public Key
private readonly SERVICE_ID = 'service_abc123';        // Tu Service ID
private readonly TEMPLATE_ID = 'template_xyz789';      // Tu Template ID
```

---

### ✅ Paso 6: Probar

1. **Guarda** el archivo `email.service.ts`
2. Si el servidor está corriendo, reinícialo:
   ```powershell
   Ctrl+C
   npm start
   ```
3. Ve a: http://localhost:4200/auth/login
4. Ingresa: `pedroguevarap50@gmail.com` / `tu_contraseña`
5. Click **"Iniciar Sesión"**
6. **¡Revisa tu email!** 📧

---

## 📧 Ejemplo del Email que Recibirás:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Para: pedroguevarap50@gmail.com
De: TaxAssist - Sistema Fiscal
Asunto: 🔐 Tu Código de Verificación
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hola Pedro,

Has solicitado iniciar sesión en TaxAssist.
Usa el siguiente código de verificación:

┌─────────────────┐
│    487293      │
└─────────────────┘

⚠️ Importante: Este código expira en 5 minutos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 TaxAssist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚠️ Si no llega el email:

1. **Revisa SPAM/Correo no deseado**
2. Verifica que las 3 claves estén bien copiadas
3. Revisa la consola del navegador (F12) para ver errores
4. Verifica que Gmail esté conectado correctamente en EmailJS

---

## 📝 Resumen de Claves Necesarias:

| Clave | Dónde encontrarla | Ejemplo |
|-------|-------------------|---------|
| **PUBLIC_KEY** | Account → General | `abcXYZ123-456` |
| **SERVICE_ID** | Email Services | `service_abc123` |
| **TEMPLATE_ID** | Email Templates | `template_xyz789` |

---

## 🎯 ¿Necesitas Ayuda?

Si tienes algún problema:
1. Toma captura de pantalla del error
2. Revisa la consola del navegador (F12)
3. Verifica que las 3 claves estén correctas

---

**¡Listo!** En 5 minutos tendrás emails reales funcionando 📧
