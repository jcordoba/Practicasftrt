# ⚠️ Configuración Crítica del Sistema

> **ADVERTENCIA:** Los elementos documentados aquí son CRÍTICOS para el funcionamiento del sistema. Modificarlos sin entender las implicaciones puede causar regresiones graves.

## 🔒 Archivos Críticos - NO MODIFICAR SIN REVISAR

### 1. UserRepository - Normalización de Datos
**Archivo:** `apps/backend/src/modules/users/repositories/user.repository.ts`

```typescript
// ⚠️ FUNCIÓN CRÍTICA - NO ELIMINAR
private normalizeUser(user: any) {
  if (!user) return null;
  return {
    ...user,
    isActive: user.estado === 'ACTIVO',  // ⚠️ MAPEO CRÍTICO
    name: user.nombre || user.name       // ⚠️ MAPEO CRÍTICO
  };
}
```

**Métodos que DEBEN aplicar normalización:**
- `findById()` ✅
- `findByEmail()` ✅
- `findAll()` ✅
- `update()` ✅

### 2. Auth Controller - Validaciones de Estado
**Archivo:** `apps/backend/src/modules/auth/auth.controller.ts`

```typescript
// ⚠️ VALIDACIÓN CRÍTICA - NO ELIMINAR
if (user.estado !== 'ACTIVO') {
  return res.status(401).json({ error: 'Usuario inactivo' });
}
```

**Funciones que DEBEN validar estado:**
- `login()` ✅
- `verifyOtp()` ✅
- `register()` - debe establecer `estado: 'ACTIVO'` ✅

## 🔧 Variables de Entorno Críticas

```env
# ⚠️ NO CAMBIAR - Duración correcta de tokens
JWT_EXPIRES_IN=7d

# ⚠️ REQUERIDO - Clave secreta
JWT_SECRET=tu_clave_secreta_aqui

# ⚠️ VERIFICAR - Configuración de base de datos
DATABASE_URL=postgresql://postgres:password@localhost:5432/practicasftr
```

## 🗄️ Esquema de Base de Datos - Campos Críticos

```sql
-- ⚠️ NO RENOMBRAR ESTOS CAMPOS
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nombre TEXT,           -- ⚠️ CAMPO ORIGINAL - NO RENOMBRAR
  estado TEXT DEFAULT 'ACTIVO', -- ⚠️ CAMPO ORIGINAL - NO RENOMBRAR
  -- otros campos...
);

CREATE TABLE "OtpCode" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Flujo de Datos Crítico

### Mapeo de Campos:
```
Base de Datos → Aplicación
─────────────────────────
estado        → isActive
nombre        → name
```

### Validaciones Requeridas:
```
1. user.estado === 'ACTIVO' (antes de emitir tokens)
2. user.isActive === true (en middleware JWT)
3. Normalización en TODOS los métodos de UserRepository
```

## 🚨 Errores Comunes a Evitar

### ❌ NO HACER:
```typescript
// ❌ Usar Prisma directamente sin normalización
const user = await prisma.user.findUnique({ where: { email } });
if (user.isActive) { ... } // ❌ isActive será undefined

// ❌ No validar estado antes de emitir tokens
const token = jwt.sign({ ... }); // ❌ Sin validar user.estado

// ❌ Cambiar nombres de campos en base de datos
ALTER TABLE "User" RENAME COLUMN estado TO isActive; // ❌ ROMPE TODO
```

### ✅ HACER:
```typescript
// ✅ Usar UserRepository con normalización
const user = await this.userRepository.findByEmail(email);
if (user.isActive) { ... } // ✅ isActive está normalizado

// ✅ Validar estado antes de emitir tokens
if (user.estado !== 'ACTIVO') {
  return res.status(401).json({ error: 'Usuario inactivo' });
}
const token = jwt.sign({ ... }); // ✅ Usuario validado
```

## 🔍 Comandos de Verificación

### Verificar Normalización:
```bash
# Probar que el mapeo funciona
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sion.com","password":"admin"}'
```

### Verificar Base de Datos:
```sql
-- Verificar estructura de tabla User
\d "User"

-- Verificar usuarios activos
SELECT email, estado FROM "User" WHERE estado = 'ACTIVO';
```

## 📋 Checklist de Cambios Seguros

Antes de modificar código relacionado con autenticación:

- [ ] ¿El cambio afecta UserRepository?
- [ ] ¿Se mantiene la función normalizeUser()?
- [ ] ¿Se preservan las validaciones de estado?
- [ ] ¿Se mantiene el mapeo estado → isActive?
- [ ] ¿Se mantiene el mapeo nombre → name?
- [ ] ¿Se probó el flujo completo de login?
- [ ] ¿Los tokens siguen siendo de 7 días?

## 🆘 En Caso de Problemas

### Síntomas de Regresión:
- Logout automático después del login
- Error "Usuario inactivo" para usuarios activos
- Tokens que expiran en 1 hora en lugar de 7 días
- Error "Cannot read property 'isActive' of undefined"

### Solución Rápida:
1. Verificar que UserRepository.normalizeUser() existe
2. Verificar validaciones en auth.controller.ts
3. Reconstruir backend: `docker-compose up --build -d backend`
4. Probar flujo completo de autenticación

---

**⚠️ IMPORTANTE:** Este documento debe actualizarse cada vez que se modifique la lógica de autenticación o el esquema de base de datos.

**Última actualización:** Enero 2025  
**Responsable:** Sistema de Autenticación  
**Estado:** ✅ Funcionando correctamente