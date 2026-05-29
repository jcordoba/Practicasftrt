# 📚 IDs de Usuarios para Crear Prácticas

## 🎯 Uso Rápido (Copy-Paste)

### Request Body Ejemplo
```json
{
  "name": "Práctica Pastoral en Congregación Local",
  "description": "Práctica supervisada en ministerio pastoral",
  "studentId": "student_juan_perez_001",
  "tutorId": "tutor_pastor_roberto_001",
  "teacherId": "teacher_fernando_prof_001",
  "institution": "Iglesia Adventista Central",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "status": "PENDING",
  "hours": 240
}
```

---

## 👥 Estudiantes (Para `studentId` - REQUERIDO)

| ID                        | Nombre                  | Email                   | Password   |
|---------------------------|-------------------------|-------------------------|------------|
| `student_juan_perez_001`  | Juan Pérez Estudiante   | estudiante1@unac.edu.co | student123 |
| `student_maria_garcia_002`| María García Estudiante | estudiante2@unac.edu.co | student123 |
| `student_carlos_lopez_003`| Carlos López Estudiante | estudiante3@unac.edu.co | student123 |

---

## 🏫 Tutores (Para `tutorId` - OPCIONAL)

| ID                          | Nombre               | Email              | Password |
|-----------------------------|----------------------|--------------------|----------|
| `tutor_pastor_roberto_001`  | Pastor Roberto Tutor | tutor1@iglesia.com | tutor123 |
| `tutor_pastora_ana_002`     | Pastora Ana Tutor    | tutor2@iglesia.com | tutor123 |

---

## 👨‍🏫 Profesores (Para `teacherId` - OPCIONAL)

| ID                           | Nombre               | Email                 | Password   |
|------------------------------|----------------------|-----------------------|------------|
| `teacher_fernando_prof_001`  | Dr. Fernando Profesor| profesor1@unac.edu.co | teacher123 |
| `teacher_laura_prof_002`     | Dra. Laura Profesor  | profesor2@unac.edu.co | teacher123 |

---

## 🔄 Re-ejecutar Seed en Docker

Si necesitas recrear los usuarios en el contenedor Docker:

```bash
# Copiar archivo actualizado
docker cp seed-docker.js practicasftrt-backend-1:/app/

# Ejecutar seed
docker exec practicasftrt-backend-1 node /app/seed-docker.js
```

---

## ✅ Campos Requeridos para Crear Práctica

| Campo       | Requerido | Tipo   | Ejemplo                     |
|-------------|-----------|--------|-----------------------------|
| name        | ✅ Sí     | string | "Práctica Pastoral..."      |
| description | ✅ Sí     | string | "Práctica supervisada..."   |
| **studentId**| ✅ Sí    | string | `student_juan_perez_001`    |
| institution | ✅ Sí     | string | "Iglesia Adventista..."     |
| startDate   | ✅ Sí     | string | "2025-01-15T00:00:00.000Z"  |
| endDate     | ✅ Sí     | string | "2025-06-30T00:00:00.000Z"  |
| hours       | ✅ Sí     | number | 240                         |
| tutorId     | ❌ No     | string | `tutor_pastor_roberto_001`  |
| teacherId   | ❌ No     | string | `teacher_fernando_prof_001` |
| status      | ❌ No     | string | "PENDING" (default)         |
