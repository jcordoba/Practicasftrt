# EvaluationDetail - Diseño Ajustado según Validación Institucional

## Resumen de Ajustes Aplicados

Basado en el documento de validación `ValidaciónrápidadeEvaluationDetail.md`, se han aplicado los siguientes ajustes críticos:

### 1. Períodos de Evaluación Limitados
- **Cambio**: Solo cortes 1 y 2 (eliminado corte 3)
- **Razón**: Alineación con proceso académico institucional real
- **Implementación**: `evaluationPeriod INTEGER CHECK (evaluationPeriod IN (1, 2))`

### 2. Control de Asistencia por Sábados
- **Nuevo**: Campos específicos para asistencia sabatina
- **Campos añadidos**:
  - `sabbathsPlanned SMALLINT DEFAULT 6` (6 sábados por corte)
  - `sabbathsAttended SMALLINT DEFAULT 0`
  - `sabbathAttendancePct DECIMAL(5,2)` (calculado automáticamente)
- **Razón**: Proceso real de control de asistencia institucional

### 3. Unicidad Simplificada
- **Cambio**: Una evaluación por placement y período
- **Implementación**: `UNIQUE INDEX uq_evaldetail_placement_period (placementId, evaluationPeriod)`
- **Razón**: Evitar duplicados y simplificar gestión

### 4. Vista de Compatibilidad con Nombres Legacy
- **Cambio**: Vista `EvaluationView` con nombres de campos originales
- **Mapeo**:
  - `placementId` → `asignacion_id`
  - `evaluationPeriod` → `corte`
  - `evaluationDate` → `fecha`
  - `evaluatedBy` → `evaluador_id`
  - `finalGrade` → `nota`
  - `evaluationDimensions` → `criterios`
  - `observations` → `observaciones`
- **Razón**: Mantener compatibilidad con código existente

## Estructura Final Ajustada

```sql
CREATE TABLE "EvaluationDetail" (
    -- Identificación
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placementId         UUID NOT NULL REFERENCES "Placement"(id) ON DELETE CASCADE,
    termId              UUID NOT NULL REFERENCES "Term"(id),
    
    -- Información de la evaluación
    evaluationPeriod    INTEGER NOT NULL, -- 1, 2 (cortes académicos oficiales)
    evaluationDate      TIMESTAMP NOT NULL DEFAULT NOW(),
    evaluationType      TEXT NOT NULL DEFAULT 'regular', -- 'regular', 'remedial', 'final'
    
    -- Evaluador
    evaluatedBy         UUID NOT NULL REFERENCES "User"(id),
    
    -- Dimensiones de evaluación (JSONB para flexibilidad)
    evaluationDimensions JSONB NOT NULL DEFAULT '{
        "academic": {"score": 0, "weight": 0.4, "observations": ""},
        "pastoral": {"score": 0, "weight": 0.2, "observations": ""},
        "social": {"score": 0, "weight": 0.2, "observations": ""},
        "administrative": {"score": 0, "weight": 0.2, "observations": ""}
    }',
    
    -- Control de asistencia
    attendanceRecord    JSONB NOT NULL DEFAULT '{}', -- Registro detallado de asistencia
    totalHours          INTEGER NOT NULL DEFAULT 0,
    attendedHours       INTEGER NOT NULL DEFAULT 0,
    attendancePercentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN totalHours > 0 THEN (attendedHours::DECIMAL / totalHours * 100)
            ELSE 0 
        END
    ) STORED,
    
    -- Control de asistencia por sábados (proceso real institucional)
    sabbathsPlanned     SMALLINT NOT NULL DEFAULT 6, -- 6 sábados por corte
    sabbathsAttended    SMALLINT NOT NULL DEFAULT 0,
    sabbathAttendancePct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN sabbathsPlanned > 0 THEN (sabbathsAttended::DECIMAL / sabbathsPlanned * 100)
            ELSE 0 
        END
    ) STORED,
    
    -- Calificaciones
    finalGrade          DECIMAL(3,2) NOT NULL, -- Nota final calculada
    gradeCalculationMethod TEXT DEFAULT 'weighted_average',
    
    -- Observaciones y evidencias
    observations        TEXT,
    evidenceFiles       JSONB DEFAULT '[]', -- URLs o referencias a archivos
    
    -- Estado y flujo
    status              TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
    
    -- Auditoría
    createdBy           UUID NOT NULL REFERENCES "User"(id),
    createdAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedBy           UUID REFERENCES "User"(id),
    updatedAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Metadatos adicionales
    metadata            JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT valid_evaluation_period CHECK (evaluationPeriod IN (1, 2)), -- Solo cortes 1 y 2
    CONSTRAINT valid_final_grade CHECK (finalGrade BETWEEN 0.0 AND 5.0),
    CONSTRAINT valid_attendance CHECK (attendedHours <= totalHours),
    CONSTRAINT valid_sabbath_attendance CHECK (sabbathsAttended <= sabbathsPlanned),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'))
);
```

## Índices Ajustados

```sql
-- Validar que no existan evaluaciones duplicadas por placement y período
CREATE UNIQUE INDEX uq_evaldetail_placement_period 
ON "EvaluationDetail"(placementId, evaluationPeriod);

-- Índices de rendimiento
CREATE INDEX idx_evaldetail_term ON "EvaluationDetail"(termId);
CREATE INDEX idx_evaldetail_evaluator ON "EvaluationDetail"(evaluatedBy);
CREATE INDEX idx_evaldetail_status ON "EvaluationDetail"(status);
CREATE INDEX idx_evaldetail_date ON "EvaluationDetail"(evaluationDate);
```

## Vista de Compatibilidad Final

```sql
-- Vista de compatibilidad con tabla Evaluation existente (nombres legacy)
CREATE OR REPLACE VIEW "EvaluationView" AS
SELECT 
    ed.id,
    ed.placementId as asignacion_id,
    ed.evaluationPeriod as corte,
    ed.evaluationDate as fecha,
    ed.evaluatedBy as evaluador_id,
    ed.finalGrade as nota,
    ed.evaluationDimensions as criterios,
    ed.observations as observaciones,
    p.programId,
    ed.createdBy as creado_por,
    ed.createdAt as fecha_creacion,
    ed.updatedBy as actualizado_por,
    ed.updatedAt as fecha_actualizacion,
    ed.metadata
FROM "EvaluationDetail" ed
JOIN "Placement" p ON p.id = ed.placementId;
```

## Próximos Pasos

1. ✅ **Ajustes aplicados a EvaluationDetail**
2. 🔄 **Continuar con diseño de SocialProjection**
3. 🔄 **Continuar con diseño de SniesReport**
4. 🔄 **Generar migraciones Prisma y SQL**

## Validación Completada

- ✅ Períodos limitados a cortes 1 y 2
- ✅ Control de asistencia por sábados añadido
- ✅ Unicidad por placement y período garantizada
- ✅ Vista de compatibilidad con nombres legacy
- ✅ Estructura robusta y escalable mantenida