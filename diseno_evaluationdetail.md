# Diseño Estructura EvaluationDetail - Sistema SION Prácticas FTR

## 🎯 Objetivo
Crear una estructura robusta para evaluaciones detalladas que cumpla con los requisitos oficiales SION, incluyendo dimensiones específicas, control de asistencia y observaciones granulares.

## 📋 Estructura de la Tabla EvaluationDetail

### Campos Principales

```sql
CREATE TABLE "EvaluationDetail" (
    -- Identificación única
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones principales
    placementId         UUID NOT NULL REFERENCES "Placement"(id) ON DELETE CASCADE,
    evaluatorId         UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    termId              UUID NOT NULL REFERENCES "Term"(id) ON DELETE RESTRICT,
    
    -- Información de la evaluación
    evaluationPeriod    INTEGER NOT NULL, -- 1, 2 (cortes académicos oficiales)
    evaluationDate      TIMESTAMP NOT NULL DEFAULT NOW(),
    evaluationType      TEXT NOT NULL DEFAULT 'regular', -- 'regular', 'remedial', 'final'
    
    -- Dimensiones de evaluación (0-5 escala)
    academicDimension   JSONB NOT NULL DEFAULT '{}', -- Conocimientos, habilidades técnicas
    pastoralDimension   JSONB NOT NULL DEFAULT '{}', -- Valores, ética, servicio
    socialDimension     JSONB NOT NULL DEFAULT '{}', -- Interacción, comunicación
    administrativeDimension JSONB NOT NULL DEFAULT '{}', -- Puntualidad, responsabilidad
    
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
    gradeBreakdown      JSONB NOT NULL DEFAULT '{}', -- Desglose de calificaciones
    
    -- Observaciones específicas
    academicObservations TEXT,
    pastoralObservations TEXT,
    socialObservations TEXT,
    administrativeObservations TEXT,
    generalObservations TEXT,
    
    -- Evidencias y documentación
    evidences           JSONB DEFAULT '[]', -- URLs/paths de evidencias
    attachments         JSONB DEFAULT '[]', -- Documentos adjuntos
    
    -- Estado y validación
    status              TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
    validatedBy         UUID REFERENCES "User"(id),
    validatedAt         TIMESTAMP,
    
    -- Metadatos y auditoría
    metadata            JSONB DEFAULT '{}',
    createdBy           UUID NOT NULL REFERENCES "User"(id),
    createdAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedBy           UUID REFERENCES "User"(id),
    updatedAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_evaluation_period CHECK (evaluationPeriod IN (1, 2)), -- Solo cortes 1 y 2
    CONSTRAINT valid_final_grade CHECK (finalGrade BETWEEN 0.0 AND 5.0),
    CONSTRAINT valid_attendance CHECK (attendedHours <= totalHours),
    CONSTRAINT valid_sabbath_attendance CHECK (sabbathsAttended <= sabbathsPlanned),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'))
);
```

## 📊 Estructura de Dimensiones (JSONB)

### 1. Academic Dimension
```json
{
  "theoreticalKnowledge": {
    "score": 4.2,
    "maxScore": 5.0,
    "criteria": [
      {
        "name": "Conocimiento teórico",
        "score": 4.5,
        "weight": 0.4
      },
      {
        "name": "Aplicación práctica",
        "score": 4.0,
        "weight": 0.6
      }
    ]
  },
  "technicalSkills": {
    "score": 4.0,
    "maxScore": 5.0,
    "details": "Excelente manejo de herramientas técnicas"
  },
  "overallScore": 4.1
}
```

### 2. Pastoral Dimension
```json
{
  "christianValues": {
    "score": 4.8,
    "maxScore": 5.0,
    "observations": "Demuestra valores cristianos sólidos"
  },
  "serviceAttitude": {
    "score": 4.5,
    "maxScore": 5.0,
    "examples": ["Ayuda a compañeros", "Servicio comunitario"]
  },
  "ethicalBehavior": {
    "score": 4.7,
    "maxScore": 5.0
  },
  "overallScore": 4.67
}
```

### 3. Social Dimension
```json
{
  "communication": {
    "score": 4.3,
    "maxScore": 5.0,
    "verbal": 4.5,
    "written": 4.0,
    "nonVerbal": 4.5
  },
  "teamwork": {
    "score": 4.2,
    "maxScore": 5.0,
    "collaboration": 4.0,
    "leadership": 4.5
  },
  "interpersonalRelations": {
    "score": 4.4,
    "maxScore": 5.0
  },
  "overallScore": 4.3
}
```

### 4. Administrative Dimension
```json
{
  "punctuality": {
    "score": 4.0,
    "maxScore": 5.0,
    "lateArrivals": 2,
    "onTimePercentage": 90
  },
  "responsibility": {
    "score": 4.5,
    "maxScore": 5.0,
    "taskCompletion": 95,
    "reliability": 4.8
  },
  "organization": {
    "score": 4.2,
    "maxScore": 5.0
  },
  "overallScore": 4.23
}
```

## 📅 Estructura de Asistencia (JSONB)

```json
{
  "weeklyRecords": [
    {
      "week": 1,
      "startDate": "2025-08-18",
      "endDate": "2025-08-22",
      "scheduledHours": 40,
      "attendedHours": 38,
      "dailyRecord": [
        {
          "date": "2025-08-18",
          "scheduled": 8,
          "attended": 8,
          "arrivalTime": "08:00",
          "departureTime": "17:00",
          "status": "present"
        },
        {
          "date": "2025-08-19",
          "scheduled": 8,
          "attended": 6,
          "arrivalTime": "08:30",
          "departureTime": "15:30",
          "status": "partial",
          "reason": "Cita médica"
        }
      ]
    }
  ],
  "summary": {
    "totalWeeks": 12,
    "averageAttendance": 92.5,
    "perfectAttendanceWeeks": 8,
    "absences": 3,
    "tardiness": 5
  }
}
```

## 🔗 Índices y Optimización

```sql
-- Índices principales
CREATE INDEX idx_evaluationdetail_placement ON "EvaluationDetail"(placementId);
CREATE INDEX idx_evaluationdetail_evaluator ON "EvaluationDetail"(evaluatorId);
CREATE INDEX idx_evaluationdetail_term ON "EvaluationDetail"(termId);
CREATE INDEX idx_evaluationdetail_period ON "EvaluationDetail"(evaluationPeriod);
CREATE INDEX idx_evaluationdetail_date ON "EvaluationDetail"(evaluationDate);
CREATE INDEX idx_evaluationdetail_status ON "EvaluationDetail"(status);

-- Índices GIN para JSONB
CREATE INDEX idx_evaluationdetail_academic_gin ON "EvaluationDetail" USING GIN (academicDimension);
CREATE INDEX idx_evaluationdetail_pastoral_gin ON "EvaluationDetail" USING GIN (pastoralDimension);
CREATE INDEX idx_evaluationdetail_social_gin ON "EvaluationDetail" USING GIN (socialDimension);
CREATE INDEX idx_evaluationdetail_administrative_gin ON "EvaluationDetail" USING GIN (administrativeDimension);
CREATE INDEX idx_evaluationdetail_attendance_gin ON "EvaluationDetail" USING GIN (attendanceRecord);
CREATE INDEX idx_evaluationdetail_metadata_gin ON "EvaluationDetail" USING GIN (metadata);

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_evaluationdetail_placement_period ON "EvaluationDetail"(placementId, evaluationPeriod);
```

## 🔄 Triggers y Funciones

```sql
-- Trigger para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_evaluationdetail_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_evaluationdetail_updated
    BEFORE UPDATE ON "EvaluationDetail"
    FOR EACH ROW
    EXECUTE FUNCTION update_evaluationdetail_timestamp();

-- Función para calcular nota final
CREATE OR REPLACE FUNCTION calculate_final_grade(
    academic_score DECIMAL,
    pastoral_score DECIMAL,
    social_score DECIMAL,
    administrative_score DECIMAL,
    attendance_percentage DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    -- Pesos: Académico 40%, Pastoral 25%, Social 20%, Administrativo 10%, Asistencia 5%
    RETURN ROUND(
        (academic_score * 0.40) +
        (pastoral_score * 0.25) +
        (social_score * 0.20) +
        (administrative_score * 0.10) +
        (attendance_percentage / 20 * 0.05), -- Convertir % a escala 0-5
        2
    );
END;
$$ LANGUAGE plpgsql;
```

## 📋 Validaciones de Negocio

```sql
-- Validar que no existan evaluaciones duplicadas por placement y período
CREATE UNIQUE INDEX uq_evaldetail_placement_period 
ON "EvaluationDetail"(placementId, evaluationPeriod);

-- Validar estructura de dimensiones
CREATE OR REPLACE FUNCTION validate_dimension_structure(dimension_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        dimension_data ? 'overallScore' AND
        (dimension_data->>'overallScore')::DECIMAL BETWEEN 0.0 AND 5.0
    );
END;
$$ LANGUAGE plpgsql;
```

## 🔗 Relación con Tabla Legacy

```sql
-- Vista de compatibilidad con tabla Evaluation existente (nombres legacy)
CREATE OR REPLACE VIEW "EvaluationView" AS
SELECT 
    ed.id,
    ed.placementId as asignacion_id,
    ed.evaluationPeriod as corte,
    ed.evaluationDate as fecha,
    ed.evaluatorId as evaluador_id,
    ed.finalGrade as nota,
    jsonb_build_object(
        'academic', ed.academicDimension,
        'pastoral', ed.pastoralDimension,
        'social', ed.socialDimension,
        'administrative', ed.administrativeDimension
    ) as criterios,
    COALESCE(ed.generalObservations, '') as observaciones,
    p.programId,
    ed.createdBy as creado_por,
    ed.createdAt as fecha_creacion,
    ed.updatedBy as actualizado_por,
    ed.updatedAt as fecha_actualizacion,
    ed.metadata
FROM "EvaluationDetail" ed
JOIN "Placement" p ON ed.placementId = p.id
WHERE ed.status = 'approved';
```

## 🚀 Beneficios de la Nueva Estructura

### Funcionalidades Avanzadas
1. **Evaluación multidimensional** con criterios específicos
2. **Control de asistencia integrado** con registro detallado
3. **Trazabilidad completa** de cambios y validaciones
4. **Evidencias documentales** vinculadas a evaluaciones
5. **Cálculo automático** de notas finales
6. **Compatibilidad** con sistema existente

### Cumplimiento Normativo
- ✅ **Dimensiones oficiales** SION
- ✅ **Control de asistencia** detallado
- ✅ **Observaciones específicas** por área
- ✅ **Trazabilidad** completa
- ✅ **Validación** de datos
- ✅ **Auditoría** integrada

---
**Fecha de Diseño**: 18 de Agosto 2025  
**Estado**: Estructura completa - Lista para implementación