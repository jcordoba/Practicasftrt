# 🌱 Referencia de Datos Seed - Practice Module

## 📊 Relaciones del Modelo Practice

Según `schema.prisma`, el modelo `Practice` tiene las siguientes relaciones de clave foránea con `User`:

### 1. **studentId** (REQUERIDO)
- **Campo**: `studentId String`
- **Relación**: `@relation("StudentToPractice")`
- **Descripción**: ID del estudiante que realiza la práctica
- **Requerido**: ✅ Sí

### 2. **tutorId** (OPCIONAL)
- **Campo**: `tutorId String?`
- **Relación**: `@relation("TutorToPractice")`
- **Descripción**: ID del tutor externo que supervisa la práctica
- **Requerido**: ❌ No (opcional)

### 3. **teacherId** (OPCIONAL)
- **Campo**: `teacherId String?`
- **Relación**: `@relation("TeacherToPractice")`
- **Descripción**: ID del profesor de la universidad que supervisa
- **Requerido**: ❌ No (opcional)

---

## 👥 Usuarios Creados por Seed

### 📚 ESTUDIANTES (Para `studentId`)

| #   | Nombre                  | ID                          | Email                      |
| --- | ----------------------- | --------------------------- | -------------------------- |
| 1   | Juan Pérez Estudiante   | `cmiyejgzf0000ubm4dpwvle1q` | estudiante1@unac.edu.co    |
| 2   | María García Estudiante | `cmiyejh1g0001ubm49dn2qt53` | estudiante2@unac.edu.co    |
| 3   | Carlos López Estudiante | `cmiyejh320002ubm41sdnx8yb` | estudiante3@unac.edu.co    |

**Contraseña para todos**: `student123`

---

### 🏫 TUTORES (Para `tutorId`)

| #   | Nombre               | ID                          | Email              |
| --- | -------------------- | --------------------------- | ------------------ |
| 1   | Pastor Roberto Tutor | `cmiyejh4r0003ubm4ndagwhzx` | tutor1@iglesia.com |
| 2   | Pastora Ana Tutor    | `cmiyejh6g0004ubm4cw2iyylc` | tutor2@iglesia.com |

**Contraseña para todos**: `tutor123`

---

### 👨‍🏫 PROFESORES (Para `teacherId`)

| #   | Nombre               | ID                          | Email                  |
| --- | -------------------- | --------------------------- | ---------------------- |
| 1   | Dr. Fernando Profesor| `cmiyejh820005ubm4r60t7xyz` | profesor1@unac.edu.co  |
| 2   | Dra. Laura Profesor  | `cmiyejh9p0006ubm4qvkqmiff` | profesor2@unac.edu.co  |

**Contraseña para todos**: `teacher123`

---

## 📝 Ejemplo de Creación de Práctica

### Request Body (POST `/api/practices`)

```json
{
  "name": "Práctica Pastoral en Congregación Local",
  "description": "Práctica supervisada en ministerio pastoral con enfoque en predicación, consejería y administración eclesiástica",
  "studentId": "cmiyejgzf0000ubm4dpwvle1q",
  "tutorId": "cmiyejh4r0003ubm4ndagwhzx",
  "teacherId": "cmiyejh820005ubm4r60t7xyz",
  "institution": "Iglesia Adventista Central",
  "startDate": "2025-01-15",
  "endDate": "2025-06-30",
  "status": "PENDING",
  "hours": 240
}
```

### Campos Requeridos

| Campo         | Tipo   | Descripción                           | Ejemplo                        |
| ------------- | ------ | ------------------------------------- | ------------------------------ |
| `name`        | string | Nombre de la práctica                 | "Práctica Pastoral..."         |
| `description` | string | Descripción detallada                 | "Práctica supervisada en..."   |
| `studentId`   | string | ID del estudiante (FK User)           | "cmiyejgzf0000ubm4dpwvle1q"    |
| `institution` | string | Nombre de la institución              | "Iglesia Adventista Central"   |
| `startDate`   | string | Fecha de inicio (ISO 8601)            | "2025-01-15"                   |
| `endDate`     | string | Fecha de finalización (ISO 8601)      | "2025-06-30"                   |
| `hours`       | number | Horas totales de práctica             | 240                            |

### Campos Opcionales

| Campo       | Tipo   | Descripción                        | Ejemplo                      |
| ----------- | ------ | ---------------------------------- | ---------------------------- |
| `tutorId`   | string | ID del tutor externo (FK User)     | "cmiyejh4r0003ubm4ndagwhzx"  |
| `teacherId` | string | ID del profesor supervisor (FK User)| "cmiyejh820005ubm4r60t7xyz"  |
| `status`    | string | Estado inicial (default: PENDING)  | "PENDING"                    |

---

## 🧪 Testing con cURL

```bash
# 1. Login y obtener token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unac.edu.co","password":"TuPassword"}'

# 2. Crear práctica con token
curl -X POST http://localhost:3001/api/practices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "name": "Práctica Pastoral en Congregación Local",
    "description": "Práctica supervisada en ministerio pastoral",
    "studentId": "cmiyejgzf0000ubm4dpwvle1q",
    "tutorId": "cmiyejh4r0003ubm4ndagwhzx",
    "teacherId": "cmiyejh820005ubm4r60t7xyz",
    "institution": "Iglesia Adventista Central",
    "startDate": "2025-01-15",
    "endDate": "2025-06-30",
    "status": "PENDING",
    "hours": 240
  }'
```

---

## 🔄 Re-ejecutar Seed

Si necesitas crear usuarios nuevamente:

```bash
cd apps/backend
npx tsx prisma/seed-practice-users.ts
```

El script es **idempotente**: solo crea usuarios si no existen (verifica por email).

---

## 🚨 Solución a P2003 Foreign Key Constraint

**Problema Original:**
```
P2003: Foreign key constraint failed on the field: `Practice_studentId_fkey`
```

**Causa Raíz:**
- El campo `studentId` debe referenciar un `User.id` existente
- Solo existía 1 usuario en la base de datos (admin)
- No había estudiantes disponibles para asignar a prácticas

**Solución Implementada:**
1. ✅ Script de seed creó 3 estudiantes, 2 tutores, 2 profesores
2. ✅ Documentación de IDs generados para uso en testing
3. ✅ Ejemplo completo de creación de práctica
4. ✅ Validación de relaciones opcionales (tutor/teacher)

---

## 📚 Documentación Adicional

- **Schema**: `apps/backend/prisma/schema.prisma` (líneas 200-220)
- **Service**: `apps/backend/src/modules/practices/services/practice.service.ts`
- **Controller**: `apps/backend/src/modules/practices/controllers/practice.controller.ts`
- **Seed Script**: `apps/backend/prisma/seed-practice-users.ts`
