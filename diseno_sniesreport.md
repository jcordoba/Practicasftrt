# SniesReport - Diseño de Estructura para Informes Consolidados de Calidad

## Contexto y Requisitos Oficiales SNIES

El Sistema Nacional de Información de la Educación Superior (SNIES) requiere informes consolidados que incluyan:

1. **Agregaciones Automáticas**: Por programa, período académico y centro de práctica
2. **Indicadores de Calidad**: Académica, pastoral, social y administrativa
3. **Datos Estadísticos**: Métricas requeridas para reportes institucionales
4. **Exportación Oficial**: Formatos estándar del SNIES
5. **Trazabilidad**: Historial completo de reportes generados
6. **Validaciones**: Consistencia e integridad de la información

## Análisis de Requisitos Institucionales

### Tipos de Reportes SNIES
- **Reporte de Calidad Académica**: Evaluaciones, notas, asistencia
- **Reporte de Proyección Social**: Actividades comunitarias y culturales
- **Reporte de Centros de Práctica**: Distribución y capacidad
- **Reporte de Estudiantes**: Matrícula, deserción, graduación
- **Reporte Consolidado**: Integración de todos los indicadores

### Períodos de Reporte
- **Semestral**: Cada período académico
- **Anual**: Consolidado por año académico
- **Histórico**: Tendencias y comparativos

## Estructura Principal - SniesReport

```sql
CREATE TABLE "SniesReport" (
    -- Identificación
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reportCode          TEXT NOT NULL UNIQUE, -- Código único del reporte
    
    -- Clasificación del reporte
    reportType          TEXT NOT NULL, -- 'academic_quality', 'social_projection', 'practice_centers', 'students', 'consolidated'
    reportSubtype       TEXT, -- Subtipo específico según el tipo
    reportVersion       TEXT NOT NULL DEFAULT '1.0',
    
    -- Período de reporte
    reportPeriod        TEXT NOT NULL, -- 'semester', 'annual', 'custom'
    academicYear        INTEGER NOT NULL,
    academicPeriod      INTEGER, -- 1, 2 para semestres
    startDate           TIMESTAMP NOT NULL,
    endDate             TIMESTAMP NOT NULL,
    
    -- Alcance del reporte
    programIds          UUID[] DEFAULT '{}', -- Programas incluidos
    centerIds           UUID[] DEFAULT '{}', -- Centros incluidos
    termIds             UUID[] DEFAULT '{}', -- Términos incluidos
    
    -- Metadatos del reporte
    title               TEXT NOT NULL,
    description         TEXT,
    methodology         TEXT, -- Metodología de cálculo utilizada
    
    -- Indicadores consolidados
    qualityIndicators   JSONB NOT NULL DEFAULT '{}', -- Indicadores de calidad
    statisticalData     JSONB NOT NULL DEFAULT '{}', -- Datos estadísticos
    aggregatedMetrics   JSONB NOT NULL DEFAULT '{}', -- Métricas agregadas
    
    -- Datos de origen
    sourceDataSummary   JSONB NOT NULL DEFAULT '{}', -- Resumen de datos fuente
    dataQualityMetrics  JSONB NOT NULL DEFAULT '{}', -- Métricas de calidad de datos
    
    -- Estado y procesamiento
    status              TEXT NOT NULL DEFAULT 'draft', 
    -- 'draft', 'processing', 'completed', 'approved', 'published', 'archived', 'error'
    
    processingStarted   TIMESTAMP,
    processingCompleted TIMESTAMP,
    processingDuration  INTERVAL GENERATED ALWAYS AS (
        CASE 
            WHEN processingCompleted IS NOT NULL AND processingStarted IS NOT NULL 
            THEN processingCompleted - processingStarted
            ELSE NULL 
        END
    ) STORED,
    
    -- Validaciones
    validationResults   JSONB DEFAULT '{}', -- Resultados de validaciones
    validationErrors    TEXT[], -- Errores encontrados
    validationWarnings  TEXT[], -- Advertencias
    
    -- Exportación
    exportFormats       TEXT[] DEFAULT '{}', -- Formatos disponibles: 'pdf', 'excel', 'csv', 'json', 'xml'
    exportedFiles       JSONB DEFAULT '[]', -- Archivos generados
    
    -- Aprobación y publicación
    approvedBy          UUID REFERENCES "User"(id),
    approvedAt          TIMESTAMP,
    publishedBy         UUID REFERENCES "User"(id),
    publishedAt         TIMESTAMP,
    
    -- Auditoría
    generatedBy         UUID NOT NULL REFERENCES "User"(id),
    createdAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedBy           UUID REFERENCES "User"(id),
    updatedAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Metadatos adicionales
    metadata            JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT valid_report_type CHECK (reportType IN ('academic_quality', 'social_projection', 'practice_centers', 'students', 'consolidated')),
    CONSTRAINT valid_report_period CHECK (reportPeriod IN ('semester', 'annual', 'custom')),
    CONSTRAINT valid_academic_period CHECK (academicPeriod IS NULL OR academicPeriod IN (1, 2)),
    CONSTRAINT valid_dates CHECK (endDate >= startDate),
    CONSTRAINT valid_processing_dates CHECK (processingCompleted IS NULL OR processingCompleted >= processingStarted),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'processing', 'completed', 'approved', 'published', 'archived', 'error')),
    CONSTRAINT valid_approval CHECK ((approvedBy IS NULL AND approvedAt IS NULL) OR (approvedBy IS NOT NULL AND approvedAt IS NOT NULL)),
    CONSTRAINT valid_publication CHECK ((publishedBy IS NULL AND publishedAt IS NULL) OR (publishedBy IS NOT NULL AND publishedAt IS NOT NULL))
);
```

## Tabla de Líneas de Reporte - SniesReportLine

```sql
CREATE TABLE "SniesReportLine" (
    -- Identificación
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reportId            UUID NOT NULL REFERENCES "SniesReport"(id) ON DELETE CASCADE,
    
    -- Clasificación de la línea
    lineType            TEXT NOT NULL, -- 'summary', 'program', 'center', 'student', 'evaluation', 'activity'
    lineCategory        TEXT NOT NULL, -- Categoría específica según el tipo
    
    -- Identificadores de entidades
    programId           UUID, -- Programa académico
    centerId            UUID, -- Centro de práctica
    termId              UUID, -- Término académico
    studentId           UUID, -- Estudiante (si aplica)
    placementId         UUID, -- Práctica específica (si aplica)
    
    -- Datos de la línea
    lineData            JSONB NOT NULL DEFAULT '{}', -- Datos específicos de la línea
    calculatedMetrics   JSONB NOT NULL DEFAULT '{}', -- Métricas calculadas
    
    -- Orden y agrupación
    sortOrder           INTEGER DEFAULT 0,
    groupKey            TEXT, -- Clave de agrupación
    parentLineId        UUID REFERENCES "SniesReportLine"(id), -- Para líneas jerárquicas
    
    -- Auditoría
    createdAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_line_type CHECK (lineType IN ('summary', 'program', 'center', 'student', 'evaluation', 'activity'))
);
```

## Ejemplos de Estructuras JSONB

### 1. Indicadores de Calidad (qualityIndicators)

```json
{
  "academic": {
    "averageGrade": 4.2,
    "passRate": 0.85,
    "excellenceRate": 0.25,
    "attendanceRate": 0.92,
    "evaluationsCompleted": 156,
    "evaluationsTotal": 160
  },
  "pastoral": {
    "averageGrade": 4.5,
    "participationRate": 0.88,
    "spiritualActivities": 45,
    "counselingSessions": 23
  },
  "social": {
    "averageGrade": 4.3,
    "communityProjects": 12,
    "beneficiariesReached": 450,
    "volunteerHours": 1200
  },
  "administrative": {
    "averageGrade": 4.1,
    "punctualityRate": 0.91,
    "documentationComplete": 0.95,
    "processCompliance": 0.89
  },
  "overall": {
    "weightedAverage": 4.25,
    "qualityIndex": 0.87,
    "improvementTrend": "positive"
  }
}
```

### 2. Datos Estadísticos (statisticalData)

```json
{
  "students": {
    "total": 180,
    "active": 165,
    "completed": 142,
    "dropped": 15,
    "pending": 8,
    "byProgram": {
      "program_1": 85,
      "program_2": 95
    }
  },
  "placements": {
    "total": 165,
    "active": 158,
    "completed": 142,
    "averageDuration": 120,
    "byCenterType": {
      "hospital": 89,
      "clinic": 76
    }
  },
  "evaluations": {
    "total": 320,
    "firstPeriod": 160,
    "secondPeriod": 160,
    "averageProcessingTime": 2.5,
    "qualityDistribution": {
      "excellent": 80,
      "good": 180,
      "satisfactory": 55,
      "needs_improvement": 5
    }
  },
  "socialProjection": {
    "activities": 25,
    "participants": 145,
    "beneficiaries": 1200,
    "totalHours": 3500,
    "byType": {
      "health_brigades": 8,
      "cultural_events": 12,
      "community_service": 5
    }
  }
}
```

### 3. Métricas Agregadas (aggregatedMetrics)

```json
{
  "performance": {
    "overallSuccess": 0.89,
    "retentionRate": 0.92,
    "satisfactionIndex": 4.3,
    "improvementRate": 0.15
  },
  "efficiency": {
    "processingTime": {
      "average": 2.5,
      "median": 2.0,
      "percentile95": 4.0
    },
    "resourceUtilization": 0.87,
    "costPerStudent": 1250000
  },
  "quality": {
    "dataCompleteness": 0.98,
    "dataAccuracy": 0.96,
    "validationScore": 0.94
  },
  "trends": {
    "yearOverYear": {
      "students": 0.08,
      "grades": 0.05,
      "satisfaction": 0.12
    },
    "seasonality": {
      "firstSemester": 1.05,
      "secondSemester": 0.95
    }
  }
}
```

## Índices de Rendimiento

```sql
-- Índices principales para SniesReport
CREATE INDEX idx_sniesreport_type_period ON "SniesReport"(reportType, reportPeriod);
CREATE INDEX idx_sniesreport_academic_year ON "SniesReport"(academicYear, academicPeriod);
CREATE INDEX idx_sniesreport_status ON "SniesReport"(status);
CREATE INDEX idx_sniesreport_dates ON "SniesReport"(startDate, endDate);
CREATE INDEX idx_sniesreport_generated_by ON "SniesReport"(generatedBy);
CREATE INDEX idx_sniesreport_approved ON "SniesReport"(approvedBy, approvedAt);

-- Índices GIN para búsquedas en JSONB
CREATE INDEX idx_sniesreport_quality_indicators ON "SniesReport" USING GIN (qualityIndicators);
CREATE INDEX idx_sniesreport_statistical_data ON "SniesReport" USING GIN (statisticalData);
CREATE INDEX idx_sniesreport_aggregated_metrics ON "SniesReport" USING GIN (aggregatedMetrics);

-- Índices para arrays
CREATE INDEX idx_sniesreport_programs ON "SniesReport" USING GIN (programIds);
CREATE INDEX idx_sniesreport_centers ON "SniesReport" USING GIN (centerIds);
CREATE INDEX idx_sniesreport_terms ON "SniesReport" USING GIN (termIds);

-- Índices para SniesReportLine
CREATE INDEX idx_sniesreportline_report ON "SniesReportLine"(reportId);
CREATE INDEX idx_sniesreportline_type ON "SniesReportLine"(lineType, lineCategory);
CREATE INDEX idx_sniesreportline_program ON "SniesReportLine"(programId);
CREATE INDEX idx_sniesreportline_center ON "SniesReportLine"(centerId);
CREATE INDEX idx_sniesreportline_term ON "SniesReportLine"(termId);
CREATE INDEX idx_sniesreportline_student ON "SniesReportLine"(studentId);
CREATE INDEX idx_sniesreportline_placement ON "SniesReportLine"(placementId);
CREATE INDEX idx_sniesreportline_parent ON "SniesReportLine"(parentLineId);
CREATE INDEX idx_sniesreportline_sort ON "SniesReportLine"(reportId, sortOrder);

-- Índice GIN para datos de línea
CREATE INDEX idx_sniesreportline_data ON "SniesReportLine" USING GIN (lineData);
CREATE INDEX idx_sniesreportline_metrics ON "SniesReportLine" USING GIN (calculatedMetrics);
```

## Funciones de Generación Automática

### 1. Función Principal de Generación de Reportes

```sql
CREATE OR REPLACE FUNCTION generate_snies_report(
    p_report_type TEXT,
    p_academic_year INTEGER,
    p_academic_period INTEGER DEFAULT NULL,
    p_program_ids UUID[] DEFAULT NULL,
    p_center_ids UUID[] DEFAULT NULL,
    p_generated_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_report_id UUID;
    v_report_code TEXT;
    v_start_date TIMESTAMP;
    v_end_date TIMESTAMP;
    v_quality_indicators JSONB;
    v_statistical_data JSONB;
    v_aggregated_metrics JSONB;
BEGIN
    -- Generar código único del reporte
    v_report_code := generate_report_code(p_report_type, p_academic_year, p_academic_period);
    
    -- Determinar fechas del período
    SELECT start_date, end_date INTO v_start_date, v_end_date
    FROM get_period_dates(p_academic_year, p_academic_period);
    
    -- Crear registro del reporte
    INSERT INTO "SniesReport" (
        reportCode, reportType, academicYear, academicPeriod,
        startDate, endDate, programIds, centerIds,
        title, status, generatedBy
    ) VALUES (
        v_report_code, p_report_type, p_academic_year, p_academic_period,
        v_start_date, v_end_date, COALESCE(p_program_ids, '{}'), COALESCE(p_center_ids, '{}'),
        format('Reporte %s - %s %s', p_report_type, p_academic_year, COALESCE(p_academic_period::TEXT, 'Anual')),
        'processing', p_generated_by
    ) RETURNING id INTO v_report_id;
    
    -- Actualizar timestamp de inicio de procesamiento
    UPDATE "SniesReport" SET processingStarted = NOW() WHERE id = v_report_id;
    
    -- Calcular indicadores según el tipo de reporte
    CASE p_report_type
        WHEN 'academic_quality' THEN
            PERFORM calculate_academic_quality_indicators(v_report_id, p_academic_year, p_academic_period, p_program_ids, p_center_ids);
        WHEN 'social_projection' THEN
            PERFORM calculate_social_projection_indicators(v_report_id, p_academic_year, p_academic_period, p_program_ids, p_center_ids);
        WHEN 'practice_centers' THEN
            PERFORM calculate_practice_centers_indicators(v_report_id, p_academic_year, p_academic_period, p_program_ids, p_center_ids);
        WHEN 'students' THEN
            PERFORM calculate_students_indicators(v_report_id, p_academic_year, p_academic_period, p_program_ids, p_center_ids);
        WHEN 'consolidated' THEN
            PERFORM calculate_consolidated_indicators(v_report_id, p_academic_year, p_academic_period, p_program_ids, p_center_ids);
    END CASE;
    
    -- Ejecutar validaciones
    PERFORM validate_report_data(v_report_id);
    
    -- Actualizar estado y timestamp de finalización
    UPDATE "SniesReport" 
    SET status = 'completed', processingCompleted = NOW()
    WHERE id = v_report_id;
    
    RETURN v_report_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Marcar reporte como error
        UPDATE "SniesReport" 
        SET status = 'error', 
            validationErrors = ARRAY[SQLERRM],
            processingCompleted = NOW()
        WHERE id = v_report_id;
        
        RAISE;
END;
$$ LANGUAGE plpgsql;
```

### 2. Función de Cálculo de Indicadores Académicos

```sql
CREATE OR REPLACE FUNCTION calculate_academic_quality_indicators(
    p_report_id UUID,
    p_academic_year INTEGER,
    p_academic_period INTEGER,
    p_program_ids UUID[],
    p_center_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
    v_quality_indicators JSONB;
    v_statistical_data JSONB;
    v_aggregated_metrics JSONB;
BEGIN
    -- Calcular indicadores de calidad académica
    WITH evaluation_stats AS (
        SELECT 
            COUNT(*) as total_evaluations,
            AVG(ed.finalGrade) as avg_grade,
            COUNT(*) FILTER (WHERE ed.finalGrade >= 3.0) as passed,
            COUNT(*) FILTER (WHERE ed.finalGrade >= 4.5) as excellent,
            AVG(ed.attendancePercentage) as avg_attendance,
            AVG(ed.sabbathAttendancePct) as avg_sabbath_attendance
        FROM "EvaluationDetail" ed
        JOIN "Placement" p ON p.id = ed.placementId
        JOIN "Term" t ON t.id = ed.termId
        WHERE t.academicYear = p_academic_year
        AND (p_academic_period IS NULL OR t.period = p_academic_period)
        AND (p_program_ids IS NULL OR p.programId = ANY(p_program_ids))
        AND (p_center_ids IS NULL OR p.centerId = ANY(p_center_ids))
        AND ed.status = 'approved'
    )
    SELECT jsonb_build_object(
        'academic', jsonb_build_object(
            'averageGrade', ROUND(avg_grade::numeric, 2),
            'passRate', ROUND((passed::numeric / NULLIF(total_evaluations, 0))::numeric, 3),
            'excellenceRate', ROUND((excellent::numeric / NULLIF(total_evaluations, 0))::numeric, 3),
            'attendanceRate', ROUND((avg_attendance / 100)::numeric, 3),
            'sabbathAttendanceRate', ROUND((avg_sabbath_attendance / 100)::numeric, 3),
            'evaluationsCompleted', total_evaluations
        )
    ) INTO v_quality_indicators
    FROM evaluation_stats;
    
    -- Calcular datos estadísticos
    WITH placement_stats AS (
        SELECT 
            COUNT(*) as total_placements,
            COUNT(*) FILTER (WHERE p.status = 'active') as active_placements,
            COUNT(*) FILTER (WHERE p.status = 'completed') as completed_placements,
            AVG(EXTRACT(DAYS FROM (p.endDate - p.startDate))) as avg_duration
        FROM "Placement" p
        JOIN "Term" t ON t.id = p.termId
        WHERE t.academicYear = p_academic_year
        AND (p_academic_period IS NULL OR t.period = p_academic_period)
        AND (p_program_ids IS NULL OR p.programId = ANY(p_program_ids))
        AND (p_center_ids IS NULL OR p.centerId = ANY(p_center_ids))
    )
    SELECT jsonb_build_object(
        'placements', jsonb_build_object(
            'total', total_placements,
            'active', active_placements,
            'completed', completed_placements,
            'averageDuration', ROUND(avg_duration::numeric, 1)
        )
    ) INTO v_statistical_data
    FROM placement_stats;
    
    -- Actualizar el reporte con los indicadores calculados
    UPDATE "SniesReport"
    SET 
        qualityIndicators = v_quality_indicators,
        statisticalData = v_statistical_data,
        updatedAt = NOW()
    WHERE id = p_report_id;
    
    -- Generar líneas detalladas del reporte
    PERFORM generate_academic_report_lines(p_report_id, p_academic_year, p_academic_period, p_program_ids, p_center_ids);
    
END;
$$ LANGUAGE plpgsql;
```

### 3. Función de Generación de Código de Reporte

```sql
CREATE OR REPLACE FUNCTION generate_report_code(
    p_report_type TEXT,
    p_academic_year INTEGER,
    p_academic_period INTEGER DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_type_prefix TEXT;
    v_period_suffix TEXT;
    v_sequence INTEGER;
    v_final_code TEXT;
BEGIN
    -- Determinar prefijo según tipo de reporte
    v_type_prefix := CASE p_report_type
        WHEN 'academic_quality' THEN 'AQ'
        WHEN 'social_projection' THEN 'SP'
        WHEN 'practice_centers' THEN 'PC'
        WHEN 'students' THEN 'ST'
        WHEN 'consolidated' THEN 'CO'
        ELSE 'GN'
    END;
    
    -- Determinar sufijo de período
    v_period_suffix := CASE 
        WHEN p_academic_period IS NULL THEN p_academic_year::TEXT
        ELSE p_academic_year::TEXT || '-' || p_academic_period::TEXT
    END;
    
    -- Obtener siguiente número de secuencia
    SELECT COALESCE(MAX(CAST(SUBSTRING(reportCode FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO v_sequence
    FROM "SniesReport"
    WHERE reportCode LIKE v_type_prefix || v_period_suffix || '%';
    
    -- Generar código final
    v_final_code := v_type_prefix || v_period_suffix || '-' || LPAD(v_sequence::TEXT, 3, '0');
    
    RETURN v_final_code;
END;
$$ LANGUAGE plpgsql;
```

## Triggers de Auditoría y Validación

```sql
-- Trigger para actualizar timestamp de modificación
CREATE OR REPLACE FUNCTION update_sniesreport_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sniesreport_update_timestamp
    BEFORE UPDATE ON "SniesReport"
    FOR EACH ROW
    EXECUTE FUNCTION update_sniesreport_timestamp();

-- Trigger para validar cambios de estado
CREATE OR REPLACE FUNCTION validate_sniesreport_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar transiciones de estado válidas
    IF OLD.status = 'completed' AND NEW.status NOT IN ('approved', 'archived') THEN
        RAISE EXCEPTION 'No se puede cambiar el estado de un reporte completado a %', NEW.status;
    END IF;
    
    IF OLD.status = 'approved' AND NEW.status NOT IN ('published', 'archived') THEN
        RAISE EXCEPTION 'No se puede cambiar el estado de un reporte aprobado a %', NEW.status;
    END IF;
    
    IF OLD.status = 'published' AND NEW.status != 'archived' THEN
        RAISE EXCEPTION 'No se puede cambiar el estado de un reporte publicado a %', NEW.status;
    END IF;
    
    -- Validar campos requeridos según estado
    IF NEW.status = 'approved' AND NEW.approvedBy IS NULL THEN
        RAISE EXCEPTION 'Se requiere approvedBy para aprobar un reporte';
    END IF;
    
    IF NEW.status = 'published' AND NEW.publishedBy IS NULL THEN
        RAISE EXCEPTION 'Se requiere publishedBy para publicar un reporte';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sniesreport_validate_status
    BEFORE UPDATE ON "SniesReport"
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION validate_sniesreport_status_change();
```

## Vistas de Consulta y Compatibilidad

### 1. Vista Resumen de Reportes

```sql
CREATE OR REPLACE VIEW "SniesReportSummary" AS
SELECT 
    sr.id,
    sr.reportCode,
    sr.reportType,
    sr.reportSubtype,
    sr.title,
    sr.academicYear,
    sr.academicPeriod,
    sr.startDate,
    sr.endDate,
    sr.status,
    sr.processingDuration,
    ug.name as generatedByName,
    ua.name as approvedByName,
    up.name as publishedByName,
    sr.createdAt,
    sr.approvedAt,
    sr.publishedAt,
    CARDINALITY(sr.programIds) as programCount,
    CARDINALITY(sr.centerIds) as centerCount,
    CARDINALITY(sr.exportedFiles) as exportedFileCount
FROM "SniesReport" sr
LEFT JOIN "User" ug ON ug.id = sr.generatedBy
LEFT JOIN "User" ua ON ua.id = sr.approvedBy
LEFT JOIN "User" up ON up.id = sr.publishedBy;
```

### 2. Vista de Indicadores Consolidados

```sql
CREATE OR REPLACE VIEW "SniesQualityIndicators" AS
SELECT 
    sr.id as reportId,
    sr.reportCode,
    sr.academicYear,
    sr.academicPeriod,
    
    -- Indicadores académicos
    (sr.qualityIndicators->'academic'->>'averageGrade')::DECIMAL as academicAverage,
    (sr.qualityIndicators->'academic'->>'passRate')::DECIMAL as academicPassRate,
    (sr.qualityIndicators->'academic'->>'excellenceRate')::DECIMAL as academicExcellenceRate,
    
    -- Indicadores pastorales
    (sr.qualityIndicators->'pastoral'->>'averageGrade')::DECIMAL as pastoralAverage,
    (sr.qualityIndicators->'pastoral'->>'participationRate')::DECIMAL as pastoralParticipation,
    
    -- Indicadores sociales
    (sr.qualityIndicators->'social'->>'averageGrade')::DECIMAL as socialAverage,
    (sr.qualityIndicators->'social'->>'communityProjects')::INTEGER as communityProjects,
    (sr.qualityIndicators->'social'->>'beneficiariesReached')::INTEGER as beneficiariesReached,
    
    -- Indicadores administrativos
    (sr.qualityIndicators->'administrative'->>'averageGrade')::DECIMAL as administrativeAverage,
    (sr.qualityIndicators->'administrative'->>'punctualityRate')::DECIMAL as punctualityRate,
    
    -- Indicador general
    (sr.qualityIndicators->'overall'->>'weightedAverage')::DECIMAL as overallAverage,
    (sr.qualityIndicators->'overall'->>'qualityIndex')::DECIMAL as qualityIndex
    
FROM "SniesReport" sr
WHERE sr.status IN ('completed', 'approved', 'published');
```

### 3. Vista de Compatibilidad con Reportes Legacy

```sql
CREATE OR REPLACE VIEW "ReportCompatibilityView" AS
SELECT 
    sr.id,
    sr.reportCode as codigo_reporte,
    sr.reportType as tipo_reporte,
    sr.academicYear as año_academico,
    sr.academicPeriod as periodo_academico,
    sr.startDate as fecha_inicio,
    sr.endDate as fecha_fin,
    sr.status as estado,
    sr.qualityIndicators as indicadores_calidad,
    sr.statisticalData as datos_estadisticos,
    sr.createdAt as fecha_creacion,
    sr.approvedAt as fecha_aprobacion,
    ug.name as generado_por,
    ua.name as aprobado_por
FROM "SniesReport" sr
LEFT JOIN "User" ug ON ug.id = sr.generatedBy
LEFT JOIN "User" ua ON ua.id = sr.approvedBy;
```

## Funciones de Exportación

### 1. Función de Exportación a JSON

```sql
CREATE OR REPLACE FUNCTION export_snies_report_json(p_report_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_report JSONB;
BEGIN
    SELECT jsonb_build_object(
        'reportInfo', jsonb_build_object(
            'id', sr.id,
            'code', sr.reportCode,
            'type', sr.reportType,
            'title', sr.title,
            'academicYear', sr.academicYear,
            'academicPeriod', sr.academicPeriod,
            'startDate', sr.startDate,
            'endDate', sr.endDate,
            'generatedAt', sr.createdAt,
            'approvedAt', sr.approvedAt,
            'status', sr.status
        ),
        'qualityIndicators', sr.qualityIndicators,
        'statisticalData', sr.statisticalData,
        'aggregatedMetrics', sr.aggregatedMetrics,
        'reportLines', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'lineType', srl.lineType,
                    'lineCategory', srl.lineCategory,
                    'data', srl.lineData,
                    'metrics', srl.calculatedMetrics
                ) ORDER BY srl.sortOrder
            )
            FROM "SniesReportLine" srl
            WHERE srl.reportId = sr.id
        )
    ) INTO v_report
    FROM "SniesReport" sr
    WHERE sr.id = p_report_id;
    
    RETURN v_report;
END;
$$ LANGUAGE plpgsql;
```

## Casos de Uso Principales

1. **Generación Automática de Reportes**: Crear reportes consolidados por período académico
2. **Validación de Datos**: Verificar consistencia e integridad de la información
3. **Exportación Oficial**: Generar archivos en formatos requeridos por el SNIES
4. **Seguimiento de Indicadores**: Monitorear tendencias y métricas de calidad
5. **Aprobación y Publicación**: Flujo de trabajo para validación institucional
6. **Trazabilidad**: Historial completo de reportes y cambios

## Integración con Sistema Existente

### Relaciones con Otras Tablas
- **EvaluationDetail**: Fuente de datos de evaluaciones
- **SocialProjection**: Fuente de datos de proyección social
- **Placement**: Fuente de datos de prácticas
- **Term**: Períodos académicos
- **User**: Usuarios del sistema (generadores, aprobadores)

### Compatibilidad
- Vistas de compatibilidad con nombres legacy
- Funciones de migración de datos históricos
- APIs de exportación en múltiples formatos

## Próximos Pasos

1. ✅ **Diseño de SniesReport completado**
2. 🔄 **Generar migraciones Prisma y SQL**
3. 🔄 **Implementar funciones de cálculo específicas**
4. 🔄 **Crear APIs de exportación**
5. 🔄 **Desarrollar interfaz de usuario para gestión de reportes**