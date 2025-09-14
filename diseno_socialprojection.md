# SocialProjection - Diseño de Estructura para Actividades de Proyección Social

## Contexto y Requisitos

La tabla `SocialProjection` debe cubrir los requisitos oficiales del sistema SION Prácticas FTR para:

1. **Actividades de Proyección Social**: Registro y seguimiento de actividades comunitarias
2. **Eventos Culturales**: Gestión de eventos y actividades culturales institucionales
3. **Participación Estudiantil**: Control de participación de estudiantes en prácticas
4. **Reportes Institucionales**: Datos para informes de proyección social y cultural

## Análisis de Requisitos Institucionales

### Tipos de Actividades
- **Proyección Social**: Actividades comunitarias, brigadas de salud, campañas sociales
- **Eventos Culturales**: Festivales, concursos, presentaciones artísticas
- **Actividades Académicas**: Conferencias, seminarios, talleres
- **Voluntariado**: Actividades de servicio comunitario

### Datos Requeridos
- Información básica del evento/actividad
- Participantes (estudiantes, docentes, externos)
- Ubicación y fechas
- Recursos utilizados
- Resultados e impacto
- Evidencias y documentación
- Evaluación y seguimiento

## Estructura Propuesta

```sql
CREATE TABLE "SocialProjection" (
    -- Identificación
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                TEXT NOT NULL UNIQUE, -- Código único del evento/actividad
    
    -- Información básica
    title               TEXT NOT NULL,
    description         TEXT NOT NULL,
    activityType        TEXT NOT NULL, -- 'social_projection', 'cultural_event', 'academic_activity', 'volunteering'
    category            TEXT NOT NULL, -- 'health_brigade', 'festival', 'conference', 'community_service', etc.
    
    -- Programación
    startDate           TIMESTAMP NOT NULL,
    endDate             TIMESTAMP NOT NULL,
    registrationDeadline TIMESTAMP,
    
    -- Ubicación
    location            TEXT NOT NULL,
    address             TEXT,
    city                TEXT NOT NULL,
    department          TEXT NOT NULL,
    coordinates         JSONB, -- {"lat": 0.0, "lng": 0.0}
    
    -- Organización
    organizerId         UUID NOT NULL REFERENCES "User"(id), -- Responsable principal
    organizingUnit      TEXT NOT NULL, -- Unidad académica organizadora
    collaborators       JSONB DEFAULT '[]', -- Lista de colaboradores internos/externos
    
    -- Participación
    targetAudience      TEXT NOT NULL, -- 'students', 'community', 'mixed', 'internal'
    maxParticipants     INTEGER,
    minParticipants     INTEGER DEFAULT 1,
    currentParticipants INTEGER DEFAULT 0,
    
    -- Recursos y presupuesto
    budget              DECIMAL(12,2) DEFAULT 0.00,
    resources           JSONB DEFAULT '{}', -- Recursos necesarios/utilizados
    sponsors            JSONB DEFAULT '[]', -- Patrocinadores/aliados
    
    -- Estado y flujo
    status              TEXT NOT NULL DEFAULT 'planning', 
    -- 'planning', 'approved', 'published', 'registration_open', 'registration_closed', 
    -- 'in_progress', 'completed', 'cancelled', 'postponed'
    
    -- Resultados e impacto
    objectives          TEXT[], -- Objetivos planteados
    achievements        TEXT[], -- Logros alcanzados
    beneficiaries       INTEGER DEFAULT 0, -- Número de beneficiarios
    impactMetrics       JSONB DEFAULT '{}', -- Métricas de impacto
    
    -- Evaluación
    evaluationCriteria  JSONB DEFAULT '{}', -- Criterios de evaluación
    overallRating       DECIMAL(3,2), -- Calificación general (1.0 - 5.0)
    feedback            TEXT, -- Retroalimentación general
    
    -- Evidencias y documentación
    evidenceFiles       JSONB DEFAULT '[]', -- Archivos de evidencia
    photos              JSONB DEFAULT '[]', -- Fotos del evento
    reports             JSONB DEFAULT '[]', -- Informes generados
    
    -- Auditoría
    createdBy           UUID NOT NULL REFERENCES "User"(id),
    createdAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedBy           UUID REFERENCES "User"(id),
    updatedAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Metadatos adicionales
    metadata            JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (endDate >= startDate),
    CONSTRAINT valid_registration_deadline CHECK (registrationDeadline IS NULL OR registrationDeadline <= startDate),
    CONSTRAINT valid_participants CHECK (maxParticipants IS NULL OR maxParticipants >= minParticipants),
    CONSTRAINT valid_current_participants CHECK (currentParticipants >= 0),
    CONSTRAINT valid_budget CHECK (budget >= 0),
    CONSTRAINT valid_beneficiaries CHECK (beneficiaries >= 0),
    CONSTRAINT valid_rating CHECK (overallRating IS NULL OR (overallRating >= 1.0 AND overallRating <= 5.0)),
    CONSTRAINT valid_activity_type CHECK (activityType IN ('social_projection', 'cultural_event', 'academic_activity', 'volunteering')),
    CONSTRAINT valid_target_audience CHECK (targetAudience IN ('students', 'community', 'mixed', 'internal')),
    CONSTRAINT valid_status CHECK (status IN ('planning', 'approved', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled', 'postponed'))
);
```

## Tabla de Participación

```sql
CREATE TABLE "SocialProjectionParticipant" (
    -- Identificación
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projectionId        UUID NOT NULL REFERENCES "SocialProjection"(id) ON DELETE CASCADE,
    
    -- Participante
    participantId       UUID REFERENCES "User"(id), -- NULL para participantes externos
    participantType     TEXT NOT NULL, -- 'student', 'teacher', 'staff', 'external'
    
    -- Información del participante externo
    externalName        TEXT, -- Para participantes externos
    externalEmail       TEXT,
    externalPhone       TEXT,
    externalOrganization TEXT,
    
    -- Participación
    role                TEXT NOT NULL, -- 'participant', 'organizer', 'facilitator', 'volunteer'
    registrationDate    TIMESTAMP NOT NULL DEFAULT NOW(),
    attendanceStatus    TEXT DEFAULT 'registered', -- 'registered', 'confirmed', 'attended', 'absent', 'cancelled'
    
    -- Evaluación de participación
    participationHours  DECIMAL(5,2) DEFAULT 0.00,
    participationGrade  DECIMAL(3,2), -- Calificación de participación (1.0 - 5.0)
    certificate         BOOLEAN DEFAULT FALSE, -- ¿Recibió certificado?
    certificateCode     TEXT, -- Código del certificado
    
    -- Auditoría
    createdBy           UUID NOT NULL REFERENCES "User"(id),
    createdAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedBy           UUID REFERENCES "User"(id),
    updatedAt           TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Metadatos
    metadata            JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT valid_participant_type CHECK (participantType IN ('student', 'teacher', 'staff', 'external')),
    CONSTRAINT valid_role CHECK (role IN ('participant', 'organizer', 'facilitator', 'volunteer')),
    CONSTRAINT valid_attendance_status CHECK (attendanceStatus IN ('registered', 'confirmed', 'attended', 'absent', 'cancelled')),
    CONSTRAINT valid_participation_hours CHECK (participationHours >= 0),
    CONSTRAINT valid_participation_grade CHECK (participationGrade IS NULL OR (participationGrade >= 1.0 AND participationGrade <= 5.0)),
    CONSTRAINT external_participant_info CHECK (
        (participantType = 'external' AND externalName IS NOT NULL) OR 
        (participantType != 'external' AND participantId IS NOT NULL)
    )
);
```

## Índices de Rendimiento

```sql
-- Índices principales
CREATE INDEX idx_socialprojection_dates ON "SocialProjection"(startDate, endDate);
CREATE INDEX idx_socialprojection_status ON "SocialProjection"(status);
CREATE INDEX idx_socialprojection_type ON "SocialProjection"(activityType);
CREATE INDEX idx_socialprojection_organizer ON "SocialProjection"(organizerId);
CREATE INDEX idx_socialprojection_location ON "SocialProjection"(city, department);

-- Índices para participantes
CREATE INDEX idx_projection_participant_projection ON "SocialProjectionParticipant"(projectionId);
CREATE INDEX idx_projection_participant_user ON "SocialProjectionParticipant"(participantId);
CREATE INDEX idx_projection_participant_type ON "SocialProjectionParticipant"(participantType);
CREATE INDEX idx_projection_participant_attendance ON "SocialProjectionParticipant"(attendanceStatus);

-- Índice único para evitar participaciones duplicadas
CREATE UNIQUE INDEX uq_projection_participant 
ON "SocialProjectionParticipant"(projectionId, participantId)
WHERE participantId IS NOT NULL;
```

## Triggers y Funciones

```sql
-- Función para actualizar contador de participantes
CREATE OR REPLACE FUNCTION update_projection_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "SocialProjection" 
    SET currentParticipants = (
        SELECT COUNT(*) 
        FROM "SocialProjectionParticipant" 
        WHERE projectionId = COALESCE(NEW.projectionId, OLD.projectionId)
        AND attendanceStatus NOT IN ('cancelled', 'absent')
    )
    WHERE id = COALESCE(NEW.projectionId, OLD.projectionId);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contador automáticamente
CREATE TRIGGER trg_update_participant_count
    AFTER INSERT OR UPDATE OR DELETE ON "SocialProjectionParticipant"
    FOR EACH ROW
    EXECUTE FUNCTION update_projection_participant_count();

-- Función para generar código único de actividad
CREATE OR REPLACE FUNCTION generate_projection_code(activity_type TEXT, start_date TIMESTAMP)
RETURNS TEXT AS $$
DECLARE
    type_prefix TEXT;
    year_suffix TEXT;
    sequence_num INTEGER;
    final_code TEXT;
BEGIN
    -- Determinar prefijo según tipo
    type_prefix := CASE activity_type
        WHEN 'social_projection' THEN 'PS'
        WHEN 'cultural_event' THEN 'EC'
        WHEN 'academic_activity' THEN 'AA'
        WHEN 'volunteering' THEN 'VL'
        ELSE 'GN'
    END;
    
    -- Obtener año
    year_suffix := EXTRACT(YEAR FROM start_date)::TEXT;
    
    -- Obtener siguiente número de secuencia
    SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM "SocialProjection"
    WHERE code LIKE type_prefix || year_suffix || '%';
    
    -- Generar código final
    final_code := type_prefix || year_suffix || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql;
```

## Vistas de Consulta

```sql
-- Vista resumen de actividades
CREATE OR REPLACE VIEW "SocialProjectionSummary" AS
SELECT 
    sp.id,
    sp.code,
    sp.title,
    sp.activityType,
    sp.category,
    sp.startDate,
    sp.endDate,
    sp.location,
    sp.city,
    sp.status,
    sp.currentParticipants,
    sp.maxParticipants,
    sp.beneficiaries,
    sp.overallRating,
    u.name as organizerName,
    sp.organizingUnit
FROM "SocialProjection" sp
JOIN "User" u ON u.id = sp.organizerId;

-- Vista de participación estudiantil
CREATE OR REPLACE VIEW "StudentProjectionParticipation" AS
SELECT 
    spp.id,
    sp.code as projectionCode,
    sp.title as projectionTitle,
    sp.activityType,
    sp.startDate,
    sp.endDate,
    u.id as studentId,
    u.name as studentName,
    u.email as studentEmail,
    spp.role,
    spp.attendanceStatus,
    spp.participationHours,
    spp.participationGrade,
    spp.certificate,
    spp.certificateCode
FROM "SocialProjectionParticipant" spp
JOIN "SocialProjection" sp ON sp.id = spp.projectionId
JOIN "User" u ON u.id = spp.participantId
WHERE spp.participantType = 'student';
```

## Integración con Sistema Existente

### Relación con Placement
```sql
-- Tabla para vincular actividades de proyección social con prácticas
CREATE TABLE "PlacementSocialProjection" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placementId     UUID NOT NULL REFERENCES "Placement"(id) ON DELETE CASCADE,
    projectionId    UUID NOT NULL REFERENCES "SocialProjection"(id) ON DELETE CASCADE,
    isRequired      BOOLEAN DEFAULT FALSE, -- ¿Es actividad obligatoria para la práctica?
    weight          DECIMAL(3,2) DEFAULT 0.00, -- Peso en la evaluación (0.00 - 1.00)
    
    createdBy       UUID NOT NULL REFERENCES "User"(id),
    createdAt       TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(placementId, projectionId)
);
```

## Casos de Uso Principales

1. **Registro de Actividad**: Crear nueva actividad de proyección social
2. **Gestión de Participantes**: Inscribir estudiantes y controlar asistencia
3. **Seguimiento de Impacto**: Registrar beneficiarios y métricas
4. **Generación de Certificados**: Emitir certificados de participación
5. **Reportes Institucionales**: Generar informes de proyección social
6. **Integración con Prácticas**: Vincular actividades con evaluación de prácticas

## Próximos Pasos

1. ✅ **Diseño de SocialProjection completado**
2. 🔄 **Continuar con diseño de SniesReport**
3. 🔄 **Generar migraciones Prisma y SQL**
4. 🔄 **Implementar funciones de negocio**