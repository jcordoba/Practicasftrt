# 📧 Sistema OTP con Envío de Correo - Configuración Completa

## ✅ Lo que se ha implementado

### 1. **Servicio de Email** (`src/services/email.service.ts`)
- Clase `EmailService` que maneja el envío de correos con nodemailer
- Template HTML profesional para los correos OTP
- Soporte para múltiples proveedores SMTP (Gmail, Outlook, Yahoo, SendGrid)
- Verificación de conexión SMTP

### 2. **Servicio OTP Actualizado** (`src/services/otp.service.ts`)
- Integración con el servicio de email
- Generación de códigos de 6 dígitos
- Almacenamiento en base de datos
- Expiración de 15 minutos
- Logs detallados para debug

### 3. **Controlador de Autenticación** (`src/controllers/auth.controller.ts`)
- Sistema OTP activado
- Login directo desactivado (comentado)
- Validación de usuario activo antes de enviar OTP
- Manejo de errores mejorado

### 4. **Variables de Entorno**
- Archivo `.env` actualizado con configuraciones SMTP
- Archivo `.env.example` con ejemplos y documentación

---

## 🚀 Pasos para Activar el Sistema

### Paso 1: Configurar Credenciales de Email

Edita el archivo `apps/backend/.env` y configura tus credenciales SMTP:

#### Para Gmail (Recomendado para desarrollo):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

**⚠️ IMPORTANTE para Gmail:**
1. Activa la verificación en 2 pasos: https://myaccount.google.com/security
2. Crea una contraseña de aplicación: https://myaccount.google.com/apppasswords
3. Usa esa contraseña (16 caracteres) en `SMTP_PASS`

#### Para Outlook:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña
```

#### Para SendGrid (Recomendado para producción):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=tu-api-key-de-sendgrid
```

### Paso 2: Verificar la Configuración

Ejecuta el script de prueba para verificar que todo funciona:

```bash
cd apps/backend
npm run test:email
```

Si todo está bien configurado, verás:
```
🧪 Iniciando prueba de configuración de email...
✅ Variables de entorno configuradas
🔌 Verificando conexión con el servidor SMTP...
✅ Conexión SMTP exitosa
📧 Enviando correo de prueba...
✅ ¡Correo de prueba enviado exitosamente!
```

Y recibirás un correo con un código OTP de prueba.

### Paso 3: Iniciar el Backend

```bash
cd apps/backend
npm run dev
```

### Paso 4: Probar el Login

1. Ve a la página de login del frontend
2. Ingresa email y contraseña
3. Si las credenciales son correctas, recibirás un código OTP por email
4. Ingresa el código OTP en la interfaz
5. ¡Listo! Estarás autenticado en el sistema

---

## 🔍 Flujo del Sistema OTP

```
1. Usuario → Ingresa email y contraseña
         ↓
2. Backend → Valida credenciales
         ↓
3. Backend → Genera código OTP de 6 dígitos
         ↓
4. Backend → Guarda OTP en base de datos (expira en 15 min)
         ↓
5. Backend → Envía email con código OTP
         ↓
6. Usuario → Recibe email y copia código
         ↓
7. Usuario → Ingresa código en la interfaz
         ↓
8. Backend → Valida código OTP
         ↓
9. Backend → Genera token JWT
         ↓
10. Usuario → Autenticado en el sistema ✅
```

---

## 📝 Archivos Creados/Modificados

### Nuevos Archivos:
- ✅ `src/services/email.service.ts` - Servicio de envío de emails
- ✅ `src/utils/test-email.ts` - Script de prueba de email
- ✅ `CONFIGURACION_EMAIL_OTP.md` - Guía detallada de configuración
- ✅ `RESUMEN_OTP.md` - Este archivo

### Archivos Modificados:
- ✅ `src/services/otp.service.ts` - Integración con email service
- ✅ `src/controllers/auth.controller.ts` - OTP activado, login directo desactivado
- ✅ `.env` - Variables SMTP agregadas
- ✅ `.env.example` - Documentación de variables SMTP
- ✅ `package.json` - Script `test:email` agregado

### Dependencias Instaladas:
- ✅ `nodemailer` - Librería para envío de emails
- ✅ `@types/nodemailer` - Tipos de TypeScript

---

## 🛠️ Solución de Problemas

### "Invalid login: 535-5.7.8 Username and Password not accepted"
**Causa:** Contraseña incorrecta o sin contraseña de aplicación
**Solución:** 
- Gmail: Usa contraseña de aplicación (no tu contraseña normal)
- Activa verificación en 2 pasos primero

### "Connection timeout"
**Causa:** Firewall o puerto bloqueado
**Solución:** 
- Verifica que el puerto 587 esté abierto
- Intenta con puerto 465 (SMTP_SECURE=true)

### El correo no llega
**Solución:**
1. Revisa la carpeta de spam
2. Verifica los logs del backend
3. Ejecuta `npm run test:email` para verificar configuración

### Para desarrollo sin configurar email
El código OTP se muestra en los logs de la consola:
```
✅ OTP generado para user@email.com: 123456
```
Puedes copiar ese código manualmente.

---

## 🔒 Consideraciones de Seguridad

1. **Nunca** subas el archivo `.env` a Git (ya está en `.gitignore`)
2. Usa contraseñas de aplicación, no contraseñas principales
3. En producción, usa servicios profesionales (SendGrid, AWS SES, Mailgun)
4. Considera implementar rate limiting (1 OTP cada 60 segundos por usuario)
5. Los códigos OTP expiran automáticamente en 15 minutos
6. Los códigos se marcan como "usados" después de validarse

---

## 🎯 Próximos Pasos Opcionales

1. **Rate Limiting**: Limitar solicitudes de OTP por usuario
2. **Intentos Fallidos**: Bloquear cuenta después de X intentos fallidos
3. **Notificaciones**: Enviar notificación si alguien intenta acceder a tu cuenta
4. **Recuperación de Contraseña**: Usar el mismo sistema para reset de contraseña
5. **Personalización**: Agregar logo de UNAC en los emails

---

## 📞 Soporte

Si tienes problemas:
1. Revisa `CONFIGURACION_EMAIL_OTP.md` para instrucciones detalladas
2. Ejecuta `npm run test:email` para diagnosticar problemas
3. Revisa los logs del backend con `npm run dev`
4. Verifica que todas las variables de entorno estén configuradas

---

## ✨ Características del Sistema

- ✅ Códigos OTP de 6 dígitos aleatorios
- ✅ Expiración automática en 15 minutos
- ✅ Un código por vez (se eliminan códigos anteriores)
- ✅ Marcar como usado después de validación
- ✅ Template HTML profesional y responsive
- ✅ Soporte para múltiples proveedores SMTP
- ✅ Logs detallados para debugging
- ✅ Manejo de errores robusto
- ✅ Script de prueba incluido

---

¡El sistema está listo para usarse! Solo falta configurar las credenciales SMTP en el archivo `.env` 🚀
