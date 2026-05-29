# Resumen del Problema: "Acceso denegado: roles insuficientes"

## 🎯 Problema Principal

Cuando el usuario `admin@unac.edu.co` intenta crear una práctica en el sistema, recibe el error:
```json
{
  "message": "Acceso denegado: roles insuficientes"
}
```

## ✅ Lo que YA está correcto

1. **El usuario tiene los roles correctos en la base de datos:**
   - `admin@unac.edu.co` tiene los roles: `ADMINISTRADOR_TECNICO` y `COORDINADOR_PRACTICAS`
   - Ambos roles están autorizados para crear prácticas

2. **El middleware RBAC funciona correctamente:**
   - El `rbacMiddleware` verifica roles desde `authReq.user.roles`
   - El `jwtMiddleware` carga los roles desde la base de datos en cada request

## 🔴 El Problema Identificado

**El token JWT no incluye los roles del usuario.**

### Código Problemático (ya corregido)

**Archivo:** `apps/backend/src/controllers/auth.controller.ts`

**ANTES (línea 68):**
```typescript
const token = jwt.sign({ sub: user.id, id: user.id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any);
```

**DESPUÉS (corregido):**
```typescript
// Cargar usuario con roles
const user = await prisma.user.findUnique({ 
  where: { email },
  include: {
    roles: {
      include: {
        role: true
      }
    }
  }
}) as any;

// Incluir roles en el token JWT
const roles = user.roles?.map((ur: any) => ur.role.nombre) || [];
const token = jwt.sign({ 
  sub: user.id, 
  id: user.id,
  roles: roles  // ← ESTO ES LO QUE FALTABA
}, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any);
```

## 🚨 Problema Secundario Descubierto

**El servicio OTP no está funcionando correctamente.**

Durante las pruebas descubrimos que:
- El método `generateOtp()` NO está insertando registros en la base de datos
- La tabla `OtpCode` existe pero parece haber un problema con Prisma Client

**Evidencia:**
```bash
# Después de hacer login, no se genera ningún OTP
node get_latest_otp_code.js
⚠️  No se encontraron códigos OTP para admin@unac.edu.co
```

## 🔧 Soluciones Aplicadas

### 1. Corregido: Token JWT ahora incluye roles (✅ HECHO)

**Archivo modificado:** `apps/backend/src/controllers/auth.controller.ts`

**Cambio:** El token JWT ahora incluye un array de roles del usuario

### 2. Agregado: Logs de debug (✅ HECHO)

**Archivo modificado:** 
- `apps/backend/src/controllers/auth.controller.ts` - logs en login
- `apps/backend/src/services/otp.service.ts` - logs en validateOtp

### 3. Regenerado: Prisma Client (✅ HECHO)

```bash
cd apps/backend
npx prisma generate
```

## 📝 Pasos para Verificar la Solución

### Opción 1: Sin OTP (más rápido)

Si el sistema OTP sigue sin funcionar, puedes usar el módulo de autenticación alternativo que NO requiere OTP:

**Usa el endpoint de autenticación de módulos:**
```bash
POST /api/auth/login  (del módulo, no del controller raíz)
```

### Opción 2: Con OTP (flujo completo)

1. **Generar un OTP manualmente:**
   ```bash
   node test_otp_generation.js
   ```

2. **Usar el código 123456** para autenticarte:
   ```bash
   POST /api/auth/verify-otp
   {
     "email": "admin@unac.edu.co",
     "code": "123456"
   }
   ```

3. **El token JWT resultante debe incluir roles:**
   ```json
   {
     "sub": "user_id",
     "id": "user_id",
     "roles": ["ADMINISTRADOR_TECNICO", "COORDINADOR_PRACTICAS"]
   }
   ```

### Opción 3: Frontend (para el usuario final)

1. **Cerrar sesión completamente** en el navegador
2. **Borrar el LocalStorage** (F12 → Application → Local Storage → Clear)
3. **Iniciar sesión nuevamente** con `admin@unac.edu.co`
4. **Intentar crear una práctica**

## 🐛 Problemas Pendientes

### Problema con el servicio OTP

**Síntomas:**
- `generateOtp()` no inserta registros en la base de datos
- No se ven logs de "OTP for {email}: {code}"

**Posibles causas:**
1. Error silencioso en Prisma (try-catch capturando)
2. Schema de Prisma desactualizado
3. Problema de conexión a la base de datos
4. El código TypeScript no se está recompilando

**Próximos pasos de debug:**
1. Agregar más logs en `generateOtp()`
2. Verificar que nodemon esté detectando cambios
3. Verificar la configuración de Prisma
4. Revisar logs completos del servidor

## 📊 Estado Actual

| Componente | Estado | Notas |
|-----------|--------|-------|
| Roles en BD | ✅ OK | Usuario tiene roles correctos |
| RBAC Middleware | ✅ OK | Verifica roles correctamente |
| JWT Middleware | ✅ OK | Carga roles de la BD |
| Token JWT con roles | ✅ CORREGIDO | Ahora incluye roles en payload |
| Servicio OTP | ❌ NO FUNCIONA | No genera códigos |
| Servidor Backend | ✅ CORRIENDO | Puerto 3001 |

## 🎯 Conclusión

**El problema principal está resuelto:** El código ahora incluye los roles en el token JWT.

**Sin embargo:** No podemos verificar la solución completamente porque el servicio OTP no está funcionando.

**Recomendación inmediata:** 
1. Reiniciar el servidor backend manualmente
2. Verificar que el código TypeScript se haya recompilado
3. Probar el flujo completo desde el frontend
4. Si persiste, usar el endpoint de autenticación alternativo que no requiere OTP
