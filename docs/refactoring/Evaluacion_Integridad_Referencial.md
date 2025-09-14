# Evaluación de Integridad Referencial y Modelo de Datos
## Sistema de Prácticas Profesionales FTR

**Fecha:** 18-07-2025  
**Evaluación Técnica:** Integridad Referencial  
**Versión:** 1.0  
**Estado:** Análisis Detallado  

---

## 1. Resumen de Evaluación

### 🎯 **OBJETIVO**
Evaluar la solidez del modelo de datos propuesto, identificar posibles problemas de integridad referencial y validar la consistencia del esquema.

### 📊 **RESULTADO GENERAL**
**CALIFICACIÓN: 8.5/10** - Modelo sólido con mejoras menores requeridas

---

## 2. Análisis de Integridad Referencial

### 2.1 Cadena Jerárquica Organizacional

#### ✅ **ESTADO ACTUAL (CORRECTO)**
```
Union (1) ──→ Association (N)
    ↓
Association (1) ──→ District (N)
    ↓  
District (1) ──→ Congregation (N)
```

#### 🔍 **VALIDACIÓN DE FKs:**
- `Association.unionId → Union.id` ✅
- `District.associationId → Association.id` ✅
- `Congregation.districtId → District.id` ✅
- `Institution.unionId → Union.id` ✅ (para centros externos)

#### ⚠️ **OBSERVACIÓN CRÍTICA:**
**Institution** debería tener relación opcional con Association/District para mayor flexibilidad:

```sql
ALTER TABLE public."Institution" 
  ADD COLUMN "associationId" text NULL REFERENCES public."Association"(id),
  ADD COLUMN "districtId" text NULL REFERENCES public."District"(id);
```

### 2.2 Modelo de Colocación (Placement)

#### ✅ **FKs VALIDADAS:**
```sql
-- Todas las referencias son sólidas
"studentId" → User.id (VÁLIDA)
"termId" → Term.id (VÁLIDA)
"congregationId" → Congregation.id (VÁLIDA, OPCIONAL)
"institutionId" → Institution.id (VÁLIDA, OPCIONAL)
"pastorId" → User.id (VÁLIDA)
```

#### 🔍 **CONSTRAINT EXCLUSIVO:**
```sql
CHECK (("congregationId" IS NULL) <> ("institutionId" IS NULL))
```
**EVALUACIÓN:** ✅ Correcto - Garantiza exactamente un tipo de centro

#### ⚠️ **MEJORA REQUERIDA - Validación de Roles:**
```sql
-- El pastor debe tener rol apropiado
ALTER TABLE public."Placement" 
  ADD CONSTRAINT placement_pastor_role_check
  CHECK (EXISTS (
    SELECT 1 FROM public."UserRole" ur 
    JOIN public."Role" r ON ur."roleId" = r.id 
    WHERE ur."userId" = "pastorId" 
    AND r.nombre IN ('PASTOR_TUTOR', 'COORDINADOR')
    AND ur.estado = 'ACTIVO'
  ));
```

### 2.3 Modelo de Asignación (Assignment)

#### ✅ **FKs PROPUESTAS (CORRECTAS):**
```sql
"studentId" → User.id
"practiceId" → Practice.id  
"placementId" → Placement.id
```

#### 🔍 **VALIDACIÓN DE CONSISTENCIA:**
Debe validarse que el estudiante en Assignment coincida con el de Placement:

```sql
ALTER TABLE public."Assignment"
  ADD CONSTRAINT assignment_student_consistency_check
  CHECK (EXISTS (
    SELECT 1 FROM public."Placement" p 
    WHERE p.id = "placementId" 
    AND p."studentId" = "studentId"
  ));
```

### 2.4 Historial de Traslados (AssignmentHistory)

#### ✅ **FKs VALIDADAS:**
```sql
"assignmentId" → Assignment.id ✅
"from_placement" → Placement.id ✅
"to_placement" → Placement.id ✅
"movedBy" → User.id ✅
```

#### ⚠️ **VALIDACIONES ADICIONALES REQUERIDAS:**
```sql
-- 1. Placements diferentes
ALTER TABLE public."AssignmentHistory"
  ADD CONSTRAINT history_different_placements_check
  CHECK ("from_placement" != "to_placement");

-- 2. Mismo estudiante en ambos placements
ALTER TABLE public."AssignmentHistory"
  ADD CONSTRAINT history_same_student_check
  CHECK (EXISTS (
    SELECT 1 FROM public."Placement" p1, public."Placement" p2
    WHERE p1.id = "from_placement" 
    AND p2.id = "to_placement"
    AND p1."studentId" = p2."studentId"
  ));

-- 3. Usuario autorizado para mover
ALTER TABLE public."AssignmentHistory"
  ADD CONSTRAINT history_authorized_mover_check
  CHECK (EXISTS (
    SELECT 1 FROM public."UserRole" ur 
    JOIN public."Role" r ON ur."roleId" = r.id 
    WHERE ur."userId" = "movedBy" 
    AND r.nombre IN ('COORDINADOR', 'DOCENTE_PRACTICA', 'ADMIN_TECNICO')
    AND ur.estado = 'ACTIVO'
  ));
```

---

## 3. Análisis de Consistencia de Datos

### 3.1 Evaluaciones (Evaluation)

#### ✅ **FK PRINCIPAL:**
```sql
"evaluador_id" → User.id (CORRECTA)
```

#### ⚠️ **PROBLEMAS IDENTIFICADOS:**

1. **Campo `asignacion_id` sin FK:**
```sql
-- DEBE AGREGARSE:
ALTER TABLE public."Evaluation"
  ADD CONSTRAINT evaluation_assignment_fk 
  FOREIGN KEY ("asignacion_id") REFERENCES public."Assignment"(id);
```

2. **Validación temporal faltante:**
```sql
-- Evaluación debe estar dentro del período del término
ALTER TABLE public."Evaluation"
  ADD CONSTRAINT evaluation_within_term_check
  CHECK (EXISTS (
    SELECT 1 FROM public."Assignment" a
    JOIN public."Placement" p ON a."placementId" = p.id
    JOIN public."Term" t ON p."termId" = t.id
    WHERE a.id = "asignacion_id"
    AND fecha_evaluacion BETWEEN t."startDate" AND t."endDate"
  ));
```

3. **Validación de corte vs fecha:**
```sql
-- Corte 1 debe ser antes de cut1EndDate
ALTER TABLE public."Evaluation"
  ADD CONSTRAINT evaluation_cut_timing_check
  CHECK (
    (corte = 1 AND EXISTS (
      SELECT 1 FROM public."Assignment" a
      JOIN public."Placement" p ON a."placementId" = p.id
      JOIN public."Term" t ON p."termId" = t.id
      WHERE a.id = "asignacion_id"
      AND fecha_evaluacion <= t."cut1EndDate"
    ))
    OR
    (corte = 2 AND EXISTS (
      SELECT 1 FROM public."Assignment" a
      JOIN public."Placement" p ON a."placementId" = p.id
      JOIN public."Term" t ON p."termId" = t.id
      WHERE a.id = "asignacion_id"
      AND fecha_evaluacion > t."cut1EndDate"
      AND fecha_evaluacion <= t."endDate"
    ))
  );
```

### 3.2 Evidencias (Evidence)

#### ✅ **FK REQUERIDA:**
```sql
-- Ya propuesta correctamente
FOREIGN KEY (subido_por) REFERENCES public."User"(id)
```

#### ⚠️ **FK FALTANTE:**
```sql
-- asignacion_id debe ser FK
ALTER TABLE public."Evidence"
  ADD CONSTRAINT evidence_assignment_fk 
  FOREIGN KEY ("asignacion_id") REFERENCES public."Assignment"(id);
```

---

## 4. Diagrama de Integridad Referencial

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    Union    │◄──┤ Association  │◄──┤   District  │
└─────────────┘    └──────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐                    ┌─────────────────┐
│ Institution │                    │  Congregation   │
└─────────────┘                    └─────────────────┘
       │                                     │
       └──────────┐           ┌──────────────┘
                  ▼           ▼
              ┌─────────────────────┐
              │     Placement       │
              │ (studentId, termId, │
              │ center, pastorId)   │
              └─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │     Assignment      │
              │ (studentId,         │
              │ practiceId,         │
              │ placementId)        │
              └─────────────────────┘
                   │           │
                   ▼           ▼
        ┌─────────────────┐ ┌─────────────────┐
        │   Evaluation    │ │    Evidence     │
        │ (asignacion_id, │ │ (asignacion_id, │
        │ evaluador_id)   │ │ subido_por)     │
        └─────────────────┘ └─────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ AssignmentHistory   │
        │ (assignmentId,      │
        │ from_placement,     │
        │ to_placement,       │
        │ movedBy)            │
        └─────────────────────┘
```

---

## 5. Índices para Integridad y Performance

### 5.1 Índices de Integridad Referencial
```sql
-- Para validaciones de constraints
CREATE INDEX idx_user_role_active ON public."UserRole"("userId", "roleId") 
  WHERE estado = 'ACTIVO';

CREATE INDEX idx_placement_student_term ON public."Placement"("studentId", "termId");

CREATE INDEX idx_assignment_placement_student ON public."Assignment"("placementId", "studentId");
```

### 5.2 Índices de Performance
```sql
-- Para consultas frecuentes
CREATE INDEX idx_evaluation_assignment_cut ON public."Evaluation"("asignacion_id", corte);

CREATE INDEX idx_evidence_assignment_status ON public."Evidence"("asignacion_id", estado);

CREATE INDEX idx_assignment_history_timeline ON public."AssignmentHistory"("assignmentId", "movedAt");
```

---

## 6. Validaciones de Migración

### 6.1 Script de Validación Pre-Migración
```sql
-- Verificar datos huérfanos antes de crear FKs
SELECT 'Assignment sin Student válido' as issue, COUNT(*) as count
FROM public."Assignment" a
LEFT JOIN public."User" u ON a.estudiante_id = u.id
WHERE u.id IS NULL;

SELECT 'Assignment sin Practice válida' as issue, COUNT(*) as count  
FROM public."Assignment" a
LEFT JOIN public."Practice" p ON a.practica_id = p.id
WHERE p.id IS NULL;

SELECT 'Evaluation sin Assignment válida' as issue, COUNT(*) as count
FROM public."Evaluation" e
LEFT JOIN public."Assignment" a ON e.asignacion_id = a.id
WHERE a.id IS NULL;
```

### 6.2 Script de Limpieza Pre-Migración
```sql
-- Limpiar datos inconsistentes
DELETE FROM public."Assignment" 
WHERE estudiante_id NOT IN (SELECT id FROM public."User");

DELETE FROM public."Evaluation" 
WHERE asignacion_id NOT IN (SELECT id FROM public."Assignment");

DELETE FROM public."Evidence" 
WHERE asignacion_id NOT IN (SELECT id FROM public."Assignment");
```

---

## 7. Conclusiones de Integridad

### ✅ **FORTALEZAS DEL MODELO:**
1. **Jerarquía organizacional sólida** con FKs apropiadas
2. **Modelo de colocación robusto** que garantiza reglas de negocio
3. **Trazabilidad completa** de traslados y cambios
4. **Separación clara** entre entidades de dominio

### ⚠️ **MEJORAS REQUERIDAS:**
1. **FKs faltantes** en Evaluation y Evidence
2. **Validaciones temporales** para evaluaciones
3. **Constraints de autorización** para operaciones críticas
4. **Validaciones de consistencia** entre entidades relacionadas

### 🎯 **RECOMENDACIÓN FINAL:**
**IMPLEMENTAR CON MEJORAS** - El modelo es sólido pero requiere las validaciones adicionales identificadas para garantizar integridad completa.

---

**Próximo Paso:** Implementar las mejoras sugeridas antes de la migración de datos.

**Validación:** Ejecutar scripts de validación pre y post-migración.

**Monitoreo:** Establecer alertas para violaciones de integridad referencial.