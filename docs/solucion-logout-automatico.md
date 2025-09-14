# Solución al Problema de Logout Automático

## 📋 Resumen del Problema

El sistema presentaba un logout automático inmediatamente después del login exitoso. El problema raíz era una incompatibilidad entre:
- Los campos de la base de datos: `estado` y `nombre`
- Los campos esperados por el middleware JWT: `isActive` y `name`

## 🔧 Soluciones Implementadas

### 1. Normalización en UserRepository

**Archivo:** `apps/backend/src/modules/users/repositories/user.repository.ts`

**Función agregada:**
```typescript
private normalizeUser(user: any) {
  if (!user) return null;
  return {
    ...user,
    isActive: user.estado === 'ACTIVO',
    name: user.nombre || user.name
  };
}
```

**Métodos modificados:**
- `findById()` - Aplica normalización al resultado
- `findByEmail()` - Aplica normalización al resultado
- `findAll()` - Aplica normalización a todos los usuarios
- `update()` - Traduce campos antes de persistir y normaliza el resultado

### 2. Validación de Estado en Auth Controller

**Archivo:** `apps/backend/src/modules/auth/auth.controller.ts`

**Validaciones agregadas:**

#### En función `login()`:
```typescript
if (user.estado !== 'ACTIVO') {
  return res.status(401).json({ error: 'Usuario inactivo' });
}
```

#### En función `verifyOtp()`:
```typescript
if (user.estado !== 'ACTIVO') {
  return res.status(401).json({ error: 'Usuario inactivo' });
}
```

#### En función `register()`:
```typescript
const newUser = await this.userService.create({
  // ... otros campos
  estado: 'ACTIVO' // Explícitamente establecido
});
```

#### En función `verifyToken()`:
```typescript
name: user.name ?? user.nombre // Consistencia en mapeo de nombres
```

### 3. Configuración JWT

**Variables de entorno importantes:**
- `JWT_EXPIRES_IN=7d` - Tokens válidos por 7 días
- `JWT_SECRET` - Clave secreta para firmar tokens

## ✅ Verificación de la Solución

### Flujo de Autenticación Probado:
1. **Login** con `admin@sion.com` y `admin` ✅
2. **Generación de OTP** exitosa ✅
3. **Verificación de OTP** devuelve token JWT válido ✅
4. **Token JWT** configurado para 7 días ✅
5. **Sin logout automático** - Problema resuelto ✅

### Comandos de Verificación:
```bash
# Verificar estado de contenedores
docker ps

# Obtener OTP más reciente
Get-Content get_otp.sql | docker exec -i practicasftrt-postgres-1 psql -U postgres -d practicasftr

# Probar login
Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@sion.com","password":"admin"}'

# Verificar OTP
Invoke-WebRequest -Uri "http://localhost:3001/api/auth/verify-otp" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@sion.com","otp":"CODIGO_OTP"}'
```

## 🚨 Puntos Críticos a Preservar

### ⚠️ NO MODIFICAR SIN REVISAR:

1. **UserRepository.normalizeUser()** - Función crítica para compatibilidad
2. **Validaciones de estado en auth.controller.ts** - Previenen tokens para usuarios inactivos
3. **Mapeo estado → isActive** - Esencial para middleware JWT
4. **Configuración JWT_EXPIRES_IN=7d** - Duración correcta de tokens

### 🔄 Al Agregar Nuevas Funcionalidades:

1. **Siempre usar UserRepository** para operaciones de usuario (no Prisma directamente)
2. **Validar user.estado === 'ACTIVO'** antes de operaciones sensibles
3. **Usar user.isActive** en lugar de user.estado en lógica de aplicación
4. **Usar user.name** en lugar de user.nombre en respuestas de API

## 📊 Estructura de Datos

### Base de Datos (PostgreSQL):
```sql
User {
  id: string
  email: string
  password: string
  nombre: string    -- ⚠️ Campo original
  estado: string    -- ⚠️ Campo original ('ACTIVO'/'INACTIVO')
  // ... otros campos
}
```

### Objeto Usuario Normalizado (Aplicación):
```typescript
User {
  id: string
  email: string
  password: string
  nombre: string      // Campo original preservado
  name: string        // Campo normalizado
  estado: string      // Campo original preservado
  isActive: boolean   // Campo normalizado
  // ... otros campos
}
```

## 🔧 Comandos de Mantenimiento

### Reconstruir Backend (después de cambios):
```bash
docker-compose up --build -d backend
```

### Verificar Logs del Backend:
```bash
docker logs practicasftrt-backend-1
```

### Acceder a Base de Datos:
```bash
docker exec -it practicasftrt-postgres-1 psql -U postgres -d practicasftr
```

## 📝 Notas Adicionales

- **Base de datos:** `practicasftr` (no `practicasftrt`)
- **Puerto backend:** `3001` (no `4000`)
- **Puerto frontend:** `3000`
- **Puerto PostgreSQL:** `5432`

---

**Fecha de implementación:** Enero 2025  
**Estado:** ✅ Funcionando correctamente  
**Próxima revisión:** Al agregar nuevas funcionalidades de autenticación