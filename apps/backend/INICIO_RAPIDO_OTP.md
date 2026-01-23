# ⚡ Guía Rápida - Activar Sistema OTP con Email

## 🎯 Lo que necesitas hacer AHORA

### 1️⃣ Configurar Gmail (5 minutos)

#### a) Activar verificación en 2 pasos:
1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en dos pasos"
3. Actívala siguiendo las instrucciones

#### b) Crear contraseña de aplicación:
1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y tu dispositivo
3. Copia la contraseña de 16 caracteres que aparece

### 2️⃣ Editar el archivo .env

Abre: `apps/backend/.env`

Reemplaza estas líneas:
```env
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
```

Con tus datos reales:
```env
SMTP_USER=cordobapastor@unac.edu.co
SMTP_PASS=xxxx xxxx xxxx xxxx
```
(Usa la contraseña de 16 caracteres que copiaste)

### 3️⃣ Probar la configuración

```bash
cd apps/backend
npm run test:email
```

Si ves ✅ y recibes un email, ¡está listo!

### 4️⃣ Iniciar el backend

```bash
npm run dev
```

## ✅ ¡Listo!

Ahora cuando hagas login:
1. Ingresas email y contraseña
2. Recibes un código de 6 dígitos por email
3. Ingresas el código
4. ¡Estás dentro!

---

## 🚨 Si algo no funciona

### El código aparece en la consola pero no llega por email:
✅ **Esto es normal si no has configurado el SMTP**
- Copia el código de la consola y úsalo
- Configura el SMTP cuando tengas tiempo

### Error "Invalid login":
- Verifica que usaste la **contraseña de aplicación** (no tu contraseña de Gmail)
- Verifica que activaste la verificación en 2 pasos

### Quiero desactivar el OTP temporalmente:
En `auth.controller.ts`, comenta las líneas del OTP y descomenta el login directo.

---

## 📚 Más información

- Ver `CONFIGURACION_EMAIL_OTP.md` para guía completa
- Ver `RESUMEN_OTP.md` para detalles técnicos

---

**Tiempo estimado:** 5-10 minutos para configurar todo 🚀
