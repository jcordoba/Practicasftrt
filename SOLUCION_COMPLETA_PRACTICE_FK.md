# ✅ SOLUCIÓN COMPLETA - Problema de Foreign Key en Practice

## 🎯 Problema Original

```
Error P2003: Foreign key constraint failed on the field: `Practice_studentId_fkey`
```

**Causa raíz**: El campo `studentId` es REQUERIDO y debe referenciar un `User.id` existente, pero solo existía el usuario admin en la base de datos.

---

## 📊 Análisis del Modelo Practice (schema.prisma)

### Relaciones de Clave Foránea

El modelo `Practice` tiene **3 relaciones** con el modelo `User`:

```prisma
model Practice {
  // REQUERIDO - FK a User (estudiante)
  studentId  String
  student    User     @relation("StudentToPractice", fields: [studentId], references: [id])

  // OPCIONAL - FK a User (tutor externo)
  tutorId    String?
  tutor      User?    @relation("TutorToPractice", fields: [tutorId], references: [id])

  // OPCIONAL - FK a User (profesor)
  teacherId  String?
  teacher    User?    @relation("TeacherToPractice", fields: [teacherId], references: [id])

  // Otros campos requeridos
  name        String
  description String
  institution String
  startDate   DateTime
  endDate     DateTime
  hours       Int
  status      String   @default("PENDING")
}
```

### Campos Requeridos vs Opcionales

| Campo       | Tipo   | Requerido | Relación           | Descripción                      |
| ----------- | ------ | --------- | ------------------ | -------------------------------- |
| studentId   | String | ✅ Sí      | StudentToPractice  | ID del estudiante (FK)           |
| tutorId     | String | ❌ No      | TutorToPractice    | ID del tutor externo (FK)        |
| teacherId   | String | ❌ No      | TeacherToPractice  | ID del profesor (FK)             |
| name        | String | ✅ Sí      | -                  | Nombre de la práctica            |
| description | String | ✅ Sí      | -                  | Descripción                      |
| institution | String | ✅ Sí      | -                  | Institución donde se realiza     |
| startDate   | Date   | ✅ Sí      | -                  | Fecha de inicio                  |
| endDate     | Date   | ✅ Sí      | -                  | Fecha de finalización            |
| hours       | Int    | ✅ Sí      | -                  | Horas totales de práctica        |

---

## 🌱 Solución Implementada: Script de Seed

### Archivo: `apps/backend/prisma/seed-practice-users.ts`

Características:
- ✅ **Idempotente**: Verifica existencia antes de crear
- ✅ **Completo**: Crea estudiantes, tutores y profesores
- ✅ **Documentado**: Imprime IDs generados para testing
- ✅ **Seguro**: Hashea contraseñas con bcrypt
- ✅ **Roles**: Asigna rol STUDENT a estudiantes

### Ejecución

```bash
cd apps/backend
npx tsx prisma/seed-practice-users.ts
```

### Usuarios Creados

#### 📚 ESTUDIANTES (3)

| Nombre                  | ID                          | Email                   | Password    |
| ----------------------- | --------------------------- | ----------------------- | ----------- |
| Juan Pérez Estudiante   | cmiyejgzf0000ubm4dpwvle1q   | estudiante1@unac.edu.co | student123  |
| María García Estudiante | cmiyejh1g0001ubm49dn2qt53   | estudiante2@unac.edu.co | student123  |
| Carlos López Estudiante | cmiyejh320002ubm41sdnx8yb   | estudiante3@unac.edu.co | student123  |

#### 🏫 TUTORES (2)

| Nombre               | ID                          | Email              | Password |
| -------------------- | --------------------------- | ------------------ | -------- |
| Pastor Roberto Tutor | cmiyejh4r0003ubm4ndagwhzx   | tutor1@iglesia.com | tutor123 |
| Pastora Ana Tutor    | cmiyejh6g0004ubm4cw2iyylc   | tutor2@iglesia.com | tutor123 |

#### 👨‍🏫 PROFESORES (2)

| Nombre               | ID                          | Email                 | Password  |
| -------------------- | --------------------------- | --------------------- | --------- |
| Dr. Fernando Profesor| cmiyejh820005ubm4r60t7xyz   | profesor1@unac.edu.co | teacher123|
| Dra. Laura Profesor  | cmiyejh9p0006ubm4qvkqmiff   | profesor2@unac.edu.co | teacher123|

---

## ✅ Prueba de Creación de Práctica

### Script de Test: `apps/backend/test_practice_complete.ts`

```bash
cd apps/backend
npx tsx test_practice_complete.ts
```

### Resultado Exitoso

```json
{
  "id": "66c700c3-5e13-49a8-bb67-e9ddc6dc6d74",
  "name": "Práctica Pastoral en Congregación Local",
  "description": "Práctica supervisada en ministerio pastoral con enfoque en predicación, consejería y administración eclesiástica",
  "studentId": "cmiyejgzf0000ubm4dpwvle1q",
  "tutorId": "cmiyejh4r0003ubm4ndagwhzx",
  "teacherId": "cmiyejh820005ubm4r60t7xyz",
  "institution": "Iglesia Adventista Central",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "status": "PENDING",
  "hours": 240,
  "createdAt": "2025-12-09T09:56:53.386Z",
  "updatedAt": "2025-12-09T09:56:53.386Z"
}
```

**Estado**: ✅ **PRÁCTICA CREADA EXITOSAMENTE**

---

## 📝 Ejemplo de Request POST /api/practices

### Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### Body (Mínimo Requerido)

```json
{
  "name": "Práctica Pastoral en Congregación Local",
  "description": "Práctica supervisada en ministerio pastoral",
  "studentId": "cmiyejgzf0000ubm4dpwvle1q",
  "institution": "Iglesia Adventista Central",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "hours": 240
}
```

### Body (Con Tutor y Profesor)

```json
{
  "name": "Práctica Pastoral en Congregación Local",
  "description": "Práctica supervisada en ministerio pastoral",
  "studentId": "cmiyejgzf0000ubm4dpwvle1q",
  "tutorId": "cmiyejh4r0003ubm4ndagwhzx",
  "teacherId": "cmiyejh820005ubm4r60t7xyz",
  "institution": "Iglesia Adventista Central",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "status": "PENDING",
  "hours": 240
}
```

---

## 🔧 Testing con cURL

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unac.edu.co","password":"Admin123!"}'

# 2. Verify OTP (usa el código recibido por email o BD)
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unac.edu.co","otp":"YOUR_OTP_CODE"}'

# 3. Crear práctica
curl -X POST http://localhost:3001/api/practices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Práctica Pastoral",
    "description": "Práctica supervisada",
    "studentId": "cmiyejgzf0000ubm4dpwvle1q",
    "tutorId": "cmiyejh4r0003ubm4ndagwhzx",
    "teacherId": "cmiyejh820005ubm4r60t7xyz",
    "institution": "Iglesia Adventista Central",
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2025-06-30T00:00:00.000Z",
    "hours": 240
  }'

# 4. Listar prácticas
curl -X GET http://localhost:3001/api/practices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 Archivos Creados/Modificados

### Archivos Nuevos

1. **`apps/backend/prisma/seed-practice-users.ts`**
   - Script de seed para crear usuarios de prueba
   - Crea 3 estudiantes, 2 tutores, 2 profesores
   - Idempotente y seguro

2. **`apps/backend/test_practice_complete.ts`**
   - Script de test end-to-end
   - Prueba login → OTP → crear práctica
   - Verifica todas las relaciones

3. **`apps/backend/fix_admin_password.ts`**
   - Actualiza contraseña del admin a `Admin123!`
   - Útil para resetear acceso

4. **`SEED_DATA_REFERENCE.md`** (raíz del proyecto)
   - Documentación completa de usuarios seed
   - Tabla de IDs para copy-paste
   - Ejemplos de uso

5. **`SOLUCION_COMPLETA_PRACTICE_FK.md`** (este archivo)
   - Resumen ejecutivo del problema y solución
   - Guía paso a paso para replicar

### Archivos NO Modificados

- ✅ `schema.prisma` - No requirió cambios, el schema estaba correcto
- ✅ `practice.service.ts` - Lógica de creación correcta
- ✅ `practice.controller.ts` - No requirió validación adicional

---

## 🎯 Resumen Ejecutivo

### Problema

- Error P2003 al crear prácticas
- Foreign key `studentId` no encontraba usuarios válidos
- Solo existía usuario admin en BD

### Causa Raíz

- Campo `studentId` es REQUERIDO (no opcional)
- Debe referenciar `User.id` existente
- Base de datos vacía sin estudiantes

### Solución

1. ✅ Crear script de seed con usuarios de prueba
2. ✅ Documentar IDs generados para testing
3. ✅ Validar creación de práctica end-to-end
4. ✅ Proporcionar ejemplos de uso

### Resultado

- ✅ **Práctica creada exitosamente**
- ✅ **Foreign keys validadas** (student, tutor, teacher)
- ✅ **Documentación completa** de IDs
- ✅ **Scripts de test** funcionales

---

## 🚀 Próximos Pasos Recomendados

### 1. Validación en el Controller

Agregar validación de IDs antes de llamar al service:

```typescript
// apps/backend/src/modules/practices/controllers/practice.controller.ts

async create(req: Request, res: Response): Promise<void> {
  try {
    // Validar que studentId existe
    const student = await prisma.user.findUnique({ 
      where: { id: req.body.studentId } 
    });
    
    if (!student) {
      res.status(400).json({ 
        error: 'Student not found', 
        studentId: req.body.studentId 
      });
      return;
    }

    // Validar tutorId si se proporciona
    if (req.body.tutorId) {
      const tutor = await prisma.user.findUnique({ 
        where: { id: req.body.tutorId } 
      });
      if (!tutor) {
        res.status(400).json({ 
          error: 'Tutor not found', 
          tutorId: req.body.tutorId 
        });
        return;
      }
    }

    // Continuar con creación...
    const practice = await this.practiceService.create(req.body);
    res.status(201).json(practice);
  } catch (error) {
    // Error handling...
  }
}
```

### 2. Seed en Producción

Para producción, modificar `seed-practice-users.ts` para:
- Usar emails reales de estudiantes
- Importar desde CSV/Excel
- No incluir contraseñas por defecto

### 3. Documentación API

Actualizar Swagger/OpenAPI con:
- Ejemplos de IDs válidos
- Descripción de relaciones FK
- Códigos de error posibles (P2003)

---

## 📞 Soporte

**Archivos de referencia:**
- `SEED_DATA_REFERENCE.md` - IDs de usuarios seed
- `apps/backend/prisma/seed-practice-users.ts` - Script de seed
- `apps/backend/test_practice_complete.ts` - Test end-to-end

**Comandos útiles:**
```bash
# Re-ejecutar seed
npx tsx apps/backend/prisma/seed-practice-users.ts

# Test completo
npx tsx apps/backend/test_practice_complete.ts

# Resetear password admin
npx tsx apps/backend/fix_admin_password.ts
```

---

✅ **PROBLEMA RESUELTO EXITOSAMENTE**
