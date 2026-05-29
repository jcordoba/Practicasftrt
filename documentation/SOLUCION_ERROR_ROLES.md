# Solución: Error "Acceso denegado: roles insuficientes" al crear práctica

## 🔍 Diagnóstico del Problema

El error **"Acceso denegado: roles insuficientes"** ocurre porque el endpoint para crear prácticas (`POST /api/practices`) requiere que tu usuario tenga uno de los siguientes roles:

- **COORDINADOR_PRACTICAS**
- **ADMINISTRADOR_TECNICO**

Este control se aplica en el archivo de rutas de prácticas mediante el middleware RBAC.

### Código relevante
```typescript
// apps/backend/src/routes/practice.routes.ts (línea 18-20)
router.post('/', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req: Request, res: Response) => {
  practiceController.create(req, res);
});
```

## 📋 Pasos para Solucionar

### Opción 1: Usar la Base de Datos (PostgreSQL) - RECOMENDADO

1. **Conectarte a tu base de datos PostgreSQL** usando pgAdmin, DBeaver, o la línea de comandos.

2. **Identificar tu usuario actual** ejecutando:
   ```sql
   SELECT id, email, nombre, estado FROM "User" WHERE email = 'tu-email@ejemplo.com';
   ```

3. **Verificar tus roles actuales**:
   ```sql
   SELECT 
       u.email, 
       r.nombre as rol_nombre
   FROM "User" u 
   LEFT JOIN "UserRole" ur ON u.id = ur."userId" 
   LEFT JOIN "Role" r ON ur."roleId" = r.id 
   WHERE u.email = 'tu-email@ejemplo.com';
   ```

4. **Asignar el rol COORDINADOR_PRACTICAS**:
   ```sql
   INSERT INTO "UserRole" ("userId", "roleId", estado, fecha_creacion, fecha_actualizacion, fecha_asignacion)
   SELECT 
       u.id,
       r.id,
       'ACTIVO',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
   FROM "User" u
   CROSS JOIN "Role" r
   WHERE u.email = 'tu-email@ejemplo.com'
   AND r.nombre = 'COORDINADOR_PRACTICAS'
   AND NOT EXISTS (
       SELECT 1 FROM "UserRole" ur2 
       WHERE ur2."userId" = u.id 
       AND ur2."roleId" = r.id
   );
   ```

5. **Verificar que el rol fue asignado correctamente**:
   ```sql
   SELECT 
       u.email, 
       r.nombre as rol_asignado,
       ur.estado as rol_estado
   FROM "User" u 
   JOIN "UserRole" ur ON u.id = ur."userId" 
   JOIN "Role" r ON ur."roleId" = r.id 
   WHERE u.email = 'tu-email@ejemplo.com';
   ```

6. **Cerrar sesión y volver a iniciar sesión** en tu aplicación frontend para que el nuevo token JWT incluya el rol actualizado.

### Opción 2: Scripts SQL Auxiliares

He creado dos scripts SQL para facilitar el proceso:

1. **`check_my_roles.sql`** - Para verificar usuarios y roles en la base de datos
2. **`assign_role_to_current_user.sql`** - Para asignar el rol COORDINADOR_PRACTICAS (con instrucciones detalladas)

**Uso:**
- Abre cualquiera de estos archivos en tu cliente de PostgreSQL
- Reemplaza `'TU_EMAIL_AQUI'` con tu email real
- Ejecuta las consultas paso a paso

## 🔑 Roles del Sistema

Los siguientes roles están definidos en el sistema:

| Rol | Descripción | Puede crear prácticas |
|-----|-------------|----------------------|
| ESTUDIANTE | Usuario que realiza la práctica | ❌ No |
| PASTOR_TUTOR | Supervisor de estudiantes en centros de práctica | ❌ No |
| DOCENTE_PRACTICA | Profesor a cargo del seguimiento académico | ❌ No |
| **COORDINADOR_PRACTICAS** | Responsable general del proceso de prácticas | ✅ **Sí** |
| DECANO | Directivo superior, visión global | ❌ No |
| **ADMINISTRADOR_TECNICO** | Encargado de infraestructura y soporte | ✅ **Sí** |

## 🎯 Permisos del Rol COORDINADOR_PRACTICAS

Según el código fuente, el rol COORDINADOR_PRACTICAS tiene los siguientes permisos:

```typescript
'COORDINADOR_PRACTICAS': [
  'VER_PRACTICAS', 'CREAR_PRACTICAS', 'EDITAR_PRACTICAS', 'ELIMINAR_PRACTICAS',
  'VER_ASIGNACIONES', 'CREAR_ASIGNACIONES', 'EDITAR_ASIGNACIONES', 
  'GESTIONAR_TRASLADOS', 'VER_EVALUACIONES', 'CREAR_EVALUACIONES', 
  'EDITAR_EVALUACIONES', 'VER_EVIDENCIAS', 'VALIDAR_EVIDENCIAS', 
  'VER_CENTROS', 'APROBAR_CENTROS', 'VER_REPORTES', 'EXPORTAR_REPORTES', 
  'VER_DASHBOARD', 'GESTIONAR_USUARIOS'
]
```

## 🔐 Middleware RBAC

El middleware de autorización (`rbacMiddleware`) verifica:

1. Que el usuario esté autenticado (token JWT válido)
2. Que el usuario tenga al menos uno de los roles requeridos
3. Extrae los roles del objeto `user.roles` en el request

**Código del middleware:**
```typescript
// apps/backend/src/modules/auth/middlewares/rbac.guard.ts
const userRoles = authReq.user.roles?.map((ur: { role: { nombre: string } }) => ur.role.nombre) || [];
const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

if (!hasRequiredRole) {
  return res.status(403).json({ message: 'Acceso denegado: roles insuficientes' });
}
```

## 📝 Notas Importantes

1. **Cierra sesión después de asignar el rol**: El token JWT almacenado en el frontend contiene los roles en el momento del login. Necesitas obtener un nuevo token.

2. **Verifica la estructura de la base de datos**: El sistema usa las siguientes tablas:
   - `User` - Usuarios
   - `Role` - Roles disponibles
   - `UserRole` - Relación muchos-a-muchos entre usuarios y roles

3. **Los roles se almacenan por nombre**: El middleware compara el campo `nombre` del rol, no el ID.

## 🐛 Debugging

Si después de asignar el rol sigues teniendo problemas, verifica:

1. **Logs del servidor** - El middleware RBAC imprime información de debug:
   ```
   🔍 RBAC Middleware Debug:
   Usuario: tu-email@ejemplo.com
   Roles extraídos: [...]
   Roles requeridos: ['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']
   ```

2. **Token JWT** - Decodifica tu token JWT para verificar que incluye los roles correctos. Puedes usar https://jwt.io

3. **Base de datos** - Ejecuta `check_my_roles.sql` para confirmar que el rol está asignado

## ✅ Verificación Final

Después de asignar el rol y reiniciar sesión, intenta crear una práctica nuevamente. Deberías poder hacerlo sin errores.

Si el problema persiste, revisa:
- Los logs del servidor backend
- La respuesta completa del endpoint (no solo el mensaje de error)
- Que el endpoint sea el correcto: `POST /api/practices`
