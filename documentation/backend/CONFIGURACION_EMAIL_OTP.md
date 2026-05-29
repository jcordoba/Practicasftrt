# Configuración del Envío de Correos OTP

## 📧 Configuración de Gmail

### Paso 1: Activar verificación en 2 pasos
1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En el menú lateral, selecciona "Seguridad"
3. En la sección "Cómo inicias sesión en Google", busca "Verificación en dos pasos"
4. Haz clic en "Verificación en dos pasos" y sigue las instrucciones para activarla

### Paso 2: Crear una contraseña de aplicación
1. Una vez activada la verificación en 2 pasos, regresa a la página de Seguridad
2. Busca la sección "Contraseñas de aplicaciones"
3. Selecciona la aplicación "Correo" y el dispositivo que estés usando
4. Google generará una contraseña de 16 caracteres
5. **Copia esta contraseña** (no podrás verla de nuevo)

### Paso 3: Configurar el archivo .env
En el archivo `apps/backend/.env`, configura:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # La contraseña de aplicación de 16 caracteres
```

**Ejemplo:**
```env
SMTP_USER=cordobapastor@unac.edu.co
SMTP_PASS=abcd efgh ijkl mnop
```

---

## 📧 Configuración de Outlook / Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña
```

---

## 📧 Configuración de Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@yahoo.com
SMTP_PASS=contraseña-de-aplicacion
```

**Nota:** Yahoo también requiere contraseñas de aplicación. Ve a: https://login.yahoo.com/account/security

---

## 📧 Configuración de SendGrid (Recomendado para producción)

1. Regístrate en https://sendgrid.com/
2. Verifica tu correo electrónico
3. Ve a Settings > API Keys
4. Crea una nueva API Key
5. Configura:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=tu-api-key-de-sendgrid
```

---

## 🔧 Activar el Sistema OTP

Una vez configurado el correo, descomenta las líneas en `auth.controller.ts`:

```typescript
// Descomenta estas líneas:
console.log('🔐 Generando OTP para:', email);
await otpService.generateOtp(email);
console.log('✅ OTP generado exitosamente');
res.json({ message: 'OTP sent to your email' });

// Y comenta el login directo:
// const isActive = user.estado ? user.estado === 'ACTIVO' : true;
// if (!isActive) {
//   return res.status(401).json({ error: 'Usuario inactivo' });
// }
// ... resto del código de login directo
```

---

## ✅ Verificar Configuración

Puedes verificar que el correo esté configurado correctamente ejecutando:

```bash
cd apps/backend
npm run dev
```

Intenta hacer login y revisa los logs en la consola. Deberías ver:
```
✅ OTP generado para user@email.com: 123456
📧 Email enviado exitosamente a user@email.com
```

---

## 🚨 Solución de Problemas

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
- **Gmail:** Asegúrate de usar una contraseña de aplicación, no tu contraseña normal
- **Outlook/Yahoo:** Verifica que las contraseñas de aplicación estén habilitadas

### Error: "self signed certificate in certificate chain"
Agrega a la configuración del transporter:
```typescript
tls: {
  rejectUnauthorized: false
}
```

### El correo se envía pero no llega
- Revisa la carpeta de spam
- Verifica que el correo del remitente (SMTP_USER) esté verificado
- Asegúrate de que el correo destino exista

### Para desarrollo local sin configurar correo
El código OTP se genera en la base de datos y se muestra en los logs de la consola:
```
✅ OTP generado para user@email.com: 123456
```

Puedes copiar ese código y usarlo para el login incluso si falla el envío de email.

---

## 📝 Notas de Seguridad

1. **Nunca** subas el archivo `.env` a Git
2. Las contraseñas de aplicación son más seguras que usar tu contraseña principal
3. En producción, considera usar servicios profesionales como SendGrid, AWS SES, o Mailgun
4. Limita el rate de envío de OTP para evitar spam (1 OTP cada 60 segundos por usuario)

---

## 🔄 Flujo del Sistema OTP

1. Usuario ingresa email y contraseña
2. Si las credenciales son válidas, se genera un OTP de 6 dígitos
3. El OTP se guarda en la base de datos con una expiración de 15 minutos
4. Se envía el OTP por correo electrónico al usuario
5. El usuario ingresa el OTP recibido
6. Si el OTP es válido y no ha expirado, se genera el JWT token
7. El usuario queda autenticado en el sistema
