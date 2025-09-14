-- =====================================================
-- POST-MIGRATION SQL: Constraints, Índices, Vistas y Triggers
-- Migración: 2025-08-18_evaldetail_socialprojection_snies
-- =====================================================

-- =====================================================
-- 1. CONSTRAINTS ADICIONALES
-- =====================================================

-- EvaluationDetail: Restricciones de negocio
ALTER TABLE "EvaluationDetail" 
ADD CONSTRAINT "chk_evaluation_period" CHECK ("evaluationPeriod" IN (1, 2));

ALTER TABLE "EvaluationDetail" 
ADD CONSTRAINT "chk_final_grade_range" CHECK ("finalGrade" >= 0.0 AND "finalGrade" <= 5.0);

ALTER TABLE "EvaluationDetail" 
ADD CONSTRAINT "chk_attendance_hours" CHECK ("attendedHours" <= "totalHours");

ALTER TABLE "EvaluationDetail" 
ADD CONSTRAINT "chk_sabbaths_attended" CHECK ("sabbathsAttended" <= "sabbathsPlanned");

ALTER TABLE "EvaluationDetail" 
ADD CONSTRAINT "chk_evaluation_status" CHECK ("status" IN ('draft', 'submitted', 'approved', 'rejected'));

-- SocialProjection: Restricciones de negocio
ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_projection_dates" CHECK ("endDate" > "startDate");

ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_registration_deadline" CHECK ("registrationDeadline" IS NULL OR "registrationDeadline" <= "startDate");

ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_budget_positive" CHECK ("budget" >= 0.00);

ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_overall_rating" CHECK ("overallRating" IS NULL OR ("overallRating" >= 0.0 AND "overallRating" <= 5.0));

ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_activity_type" CHECK ("activityType" IN ('social_projection', 'cultural_event', 'academic_activity', 'volunteering'));

ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_target_audience" CHECK ("targetAudience" IN ('students', 'community', 'mixed', 'internal'));

ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_projection_status" CHECK ("status" IN ('planning', 'open_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled', 'postponed'));

ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_participants_range" CHECK ("maxParticipants" IS NULL OR "maxParticipants" >= "minParticipants");

ALTER TABLE "SocialProjection" 
ADD CONSTRAINT "chk_current_participants" CHECK ("currentParticipants" >= 0);

-- SocialProjectionParticipant: Restricciones de negocio
ALTER TABLE "SocialProjectionParticipant" 
ADD CONSTRAINT "chk_participant_type" CHECK ("participantType" IN ('student', 'teacher', 'staff', 'external'));

ALTER TABLE "SocialProjectionParticipant" 
ADD CONSTRAINT "chk_participant_role" CHECK ("role" IN ('participant', 'organizer', 'facilitator', 'volunteer'));

ALTER TABLE "SocialProjectionParticipant" 
ADD CONSTRAINT "chk_attendance_status" CHECK ("attendanceStatus" IN ('registered', 'confirmed', 'attended', 'absent', 'cancelled'));

ALTER TABLE "SocialProjectionParticipant" 
ADD CONSTRAINT "chk_participation_hours" CHECK ("participationHours" >= 0.00);

ALTER TABLE "SocialProjectionParticipant" 
ADD CONSTRAINT "chk_participation_grade" CHECK ("participationGrade" IS NULL OR ("participationGrade" >= 0.0 AND "participationGrade" <= 5.0));

-- SniesReport: Restricciones de negocio
ALTER TABLE "SniesReport" 
ADD CONSTRAINT "chk_report_type" CHECK ("reportType" IN ('academic_quality', 'social_projection', 'practice_centers', 'students', 'consolidated'));

ALTER TABLE "SniesReport" 
ADD CONSTRAINT "chk_report_period" CHECK ("reportPeriod" IN ('semester', 'annual', 'custom'));

ALTER TABLE "SniesReport" 
ADD CONSTRAINT "chk_report_dates" CHECK ("endDate" > "startDate");

ALTER TABLE "SniesReport" 
ADD CONSTRAINT "chk_report_status" CHECK ("status" IN ('draft', 'processing', 'completed', 'approved', 'published', 'archived'));

ALTER TABLE "SniesReport" 
ADD CONSTRAINT "chk_approval_flow" CHECK (("approvedBy" IS NULL AND "approvedAt" IS NULL) OR ("approvedBy" IS NOT NULL AND "approvedAt" IS NOT NULL));

-- SniesReportLine: Restricciones de negocio
ALTER TABLE "SniesReportLine" 
ADD CONSTRAINT "chk_line_type" CHECK ("lineType" IN ('summary', 'program', 'center', 'student', 'evaluation', 'activity'));

-- =====================================================
-- 2. ÍNDICES DE RENDIMIENTO
-- =====================================================

-- EvaluationDetail: Índices de consulta frecuente
CREATE INDEX "idx_evaluationdetail_term_period" ON "EvaluationDetail"("termId", "evaluationPeriod");
CREATE INDEX "idx_evaluationdetail_evaluator" ON "EvaluationDetail"("evaluatedBy");
CREATE INDEX "idx_evaluationdetail_status" ON "EvaluationDetail"("status");
CREATE INDEX "idx_evaluationdetail_created_at" ON "EvaluationDetail"("createdAt");
CREATE INDEX "idx_evaluationdetail_final_grade" ON "EvaluationDetail"("finalGrade");

-- SocialProjection: Índices de consulta frecuente
CREATE INDEX "idx_socialprojection_organizer" ON "SocialProjection"("organizerId");
CREATE INDEX "idx_socialprojection_dates" ON "SocialProjection"("startDate", "endDate");
CREATE INDEX "idx_socialprojection_status" ON "SocialProjection"("status");
CREATE INDEX "idx_socialprojection_activity_type" ON "SocialProjection"("activityType");
CREATE INDEX "idx_socialprojection_city" ON "SocialProjection"("city");
CREATE INDEX "idx_socialprojection_target_audience" ON "SocialProjection"("targetAudience");

-- SocialProjectionParticipant: Índices de consulta frecuente
CREATE INDEX "idx_projection_participant_type" ON "SocialProjectionParticipant"("participantType");
CREATE INDEX "idx_projection_participant_status" ON "SocialProjectionParticipant"("attendanceStatus");
CREATE INDEX "idx_projection_participant_registration" ON "SocialProjectionParticipant"("registrationDate");

-- Placement: Índices de consulta frecuente
CREATE INDEX "idx_placement_student" ON "Placement"("studentId");
CREATE INDEX "idx_placement_tutor" ON "Placement"("tutorId");
CREATE INDEX "idx_placement_teacher" ON "Placement"("teacherId");
CREATE INDEX "idx_placement_center" ON "Placement"("centerId");
CREATE INDEX "idx_placement_program" ON "Placement"("programId");
CREATE INDEX "idx_placement_term" ON "Placement"("termId");
CREATE INDEX "idx_placement_status" ON "Placement"("status");
CREATE INDEX "idx_placement_dates" ON "Placement"("startDate", "endDate");

-- Term: Índices de consulta frecuente
CREATE INDEX "idx_term_academic_year" ON "Term"("academicYear");
CREATE INDEX "idx_term_academic_period" ON "Term"("academicYear", "academicPeriod");
CREATE INDEX "idx_term_status" ON "Term"("status");
CREATE INDEX "idx_term_dates" ON "Term"("startDate", "endDate");

-- SniesReport: Índices de consulta frecuente
CREATE INDEX "idx_sniesreport_type" ON "SniesReport"("reportType");
CREATE INDEX "idx_sniesreport_period" ON "SniesReport"("academicYear", "academicPeriod");
CREATE INDEX "idx_sniesreport_status" ON "SniesReport"("status");
CREATE INDEX "idx_sniesreport_generator" ON "SniesReport"("generatedBy");
CREATE INDEX "idx_sniesreport_dates" ON "SniesReport"("startDate", "endDate");

-- SniesReportLine: Índices de consulta frecuente
CREATE INDEX "idx_sniesreportline_type" ON "SniesReportLine"("lineType");
CREATE INDEX "idx_sniesreportline_category" ON "SniesReportLine"("lineCategory");
CREATE INDEX "idx_sniesreportline_sort" ON "SniesReportLine"("reportId", "sortOrder");
CREATE INDEX "idx_sniesreportline_group" ON "SniesReportLine"("groupKey");

-- =====================================================
-- 3. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar el conteo de participantes en SocialProjection
CREATE OR REPLACE FUNCTION update_projection_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "SocialProjection" 
        SET "currentParticipants" = (
            SELECT COUNT(*) 
            FROM "SocialProjectionParticipant" 
            WHERE "projectionId" = NEW."projectionId" 
            AND "attendanceStatus" NOT IN ('cancelled', 'absent')
        )
        WHERE "id" = NEW."projectionId";
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE "SocialProjection" 
        SET "currentParticipants" = (
            SELECT COUNT(*) 
            FROM "SocialProjectionParticipant" 
            WHERE "projectionId" = NEW."projectionId" 
            AND "attendanceStatus" NOT IN ('cancelled', 'absent')
        )
        WHERE "id" = NEW."projectionId";
        
        -- Si cambió de proyección, actualizar ambas
        IF OLD."projectionId" != NEW."projectionId" THEN
            UPDATE "SocialProjection" 
            SET "currentParticipants" = (
                SELECT COUNT(*) 
                FROM "SocialProjectionParticipant" 
                WHERE "projectionId" = OLD."projectionId" 
                AND "attendanceStatus" NOT IN ('cancelled', 'absent')
            )
            WHERE "id" = OLD."projectionId";
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "SocialProjection" 
        SET "currentParticipants" = (
            SELECT COUNT(*) 
            FROM "SocialProjectionParticipant" 
            WHERE "projectionId" = OLD."projectionId" 
            AND "attendanceStatus" NOT IN ('cancelled', 'absent')
        )
        WHERE "id" = OLD."projectionId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar conteo de participantes
CREATE TRIGGER trg_update_participant_count
    AFTER INSERT OR UPDATE OR DELETE ON "SocialProjectionParticipant"
    FOR EACH ROW EXECUTE FUNCTION update_projection_participant_count();

-- Función para generar código único de proyección social
CREATE OR REPLACE FUNCTION generate_projection_code()
RETURNS TRIGGER AS $$
DECLARE
    year_code TEXT;
    sequence_num INTEGER;
    new_code TEXT;
BEGIN
    -- Obtener año de la fecha de inicio
    year_code := EXTRACT(YEAR FROM NEW."startDate")::TEXT;
    
    -- Obtener el siguiente número de secuencia para el año
    SELECT COALESCE(MAX(CAST(SUBSTRING("code" FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM "SocialProjection"
    WHERE "code" LIKE 'SP-' || year_code || '-%';
    
    -- Generar el código
    new_code := 'SP-' || year_code || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    -- Asignar el código generado
    NEW."code" := new_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código automáticamente
CREATE TRIGGER trg_generate_projection_code
    BEFORE INSERT ON "SocialProjection"
    FOR EACH ROW 
    WHEN (NEW."code" IS NULL OR NEW."code" = '')
    EXECUTE FUNCTION generate_projection_code();

-- Función para calcular porcentaje de asistencia a sábados
CREATE OR REPLACE FUNCTION calculate_sabbath_attendance_pct()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular porcentaje de asistencia a sábados
    IF NEW."sabbathsPlanned" > 0 THEN
        NEW."metadata" := jsonb_set(
            COALESCE(NEW."metadata", '{}')::jsonb,
            '{sabbathAttendancePct}',
            to_jsonb(ROUND((NEW."sabbathsAttended"::NUMERIC / NEW."sabbathsPlanned"::NUMERIC) * 100, 2))
        );
    ELSE
        NEW."metadata" := jsonb_set(
            COALESCE(NEW."metadata", '{}')::jsonb,
            '{sabbathAttendancePct}',
            '0'::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular porcentaje de asistencia
CREATE TRIGGER trg_calculate_sabbath_attendance
    BEFORE INSERT OR UPDATE ON "EvaluationDetail"
    FOR EACH ROW 
    WHEN (NEW."sabbathsPlanned" IS NOT NULL AND NEW."sabbathsAttended" IS NOT NULL)
    EXECUTE FUNCTION calculate_sabbath_attendance_pct();

-- =====================================================
-- 4. VISTAS DE COMPATIBILIDAD Y CONSULTA
-- =====================================================

-- Vista de compatibilidad EvaluationView (nombres legacy)
CREATE OR REPLACE VIEW "EvaluationView" AS
SELECT 
    ed."id",
    ed."placementId" as "assignmentId", -- Mapeo legacy
    ed."termId",
    ed."evaluationPeriod" as "period",
    ed."evaluationDate" as "date",
    ed."evaluationType" as "type",
    ed."evaluatedBy" as "evaluatorId",
    ed."evaluationDimensions" as "dimensions",
    ed."attendanceRecord" as "attendance",
    ed."totalHours",
    ed."attendedHours",
    ed."sabbathsPlanned",
    ed."sabbathsAttended",
    (ed."metadata"->>'sabbathAttendancePct')::NUMERIC as "sabbathAttendancePct",
    ed."finalGrade" as "grade",
    ed."gradeCalculationMethod" as "gradeMethod",
    ed."observations",
    ed."evidenceFiles" as "evidence",
    ed."status",
    ed."createdBy",
    ed."createdAt",
    ed."updatedBy",
    ed."updatedAt",
    ed."metadata"
FROM "EvaluationDetail" ed;

-- Vista resumen de proyecciones sociales
CREATE OR REPLACE VIEW "SocialProjectionSummary" AS
SELECT 
    sp."id",
    sp."code",
    sp."title",
    sp."activityType",
    sp."category",
    sp."startDate",
    sp."endDate",
    sp."location",
    sp."city",
    sp."department",
    sp."organizerId",
    u."nombre" as "organizerName",
    sp."organizingUnit",
    sp."targetAudience",
    sp."maxParticipants",
    sp."minParticipants",
    sp."currentParticipants",
    sp."budget",
    sp."status",
    sp."beneficiaries",
    sp."overallRating",
    sp."createdAt",
    sp."updatedAt",
    -- Estadísticas calculadas
    CASE 
        WHEN sp."maxParticipants" IS NOT NULL THEN 
            ROUND((sp."currentParticipants"::NUMERIC / sp."maxParticipants"::NUMERIC) * 100, 2)
        ELSE NULL
    END as "occupancyPercentage",
    
    CASE 
        WHEN sp."startDate" > CURRENT_TIMESTAMP THEN 'upcoming'
        WHEN sp."endDate" < CURRENT_TIMESTAMP THEN 'past'
        ELSE 'current'
    END as "timeStatus"
FROM "SocialProjection" sp
JOIN "User" u ON sp."organizerId" = u."id";

-- Vista de participación de estudiantes en proyecciones sociales
CREATE OR REPLACE VIEW "StudentProjectionParticipation" AS
SELECT 
    spp."id",
    spp."projectionId",
    sp."code" as "projectionCode",
    sp."title" as "projectionTitle",
    sp."activityType",
    sp."startDate",
    sp."endDate",
    spp."participantId",
    CASE 
        WHEN spp."participantId" IS NOT NULL THEN u."nombre"
        ELSE spp."externalName"
    END as "participantName",
    spp."participantType",
    spp."role",
    spp."registrationDate",
    spp."attendanceStatus",
    spp."participationHours",
    spp."participationGrade",
    spp."certificate",
    spp."certificateCode",
    spp."createdAt"
FROM "SocialProjectionParticipant" spp
JOIN "SocialProjection" sp ON spp."projectionId" = sp."id"
LEFT JOIN "User" u ON spp."participantId" = u."id";

-- =====================================================
-- 5. COMENTARIOS EN TABLAS Y COLUMNAS
-- =====================================================

-- Comentarios en tablas
COMMENT ON TABLE "Term" IS 'Períodos académicos (semestres/términos)';
COMMENT ON TABLE "Placement" IS 'Asignaciones de estudiantes a centros de práctica';
COMMENT ON TABLE "EvaluationDetail" IS 'Evaluaciones detalladas de prácticas por cortes';
COMMENT ON TABLE "SocialProjection" IS 'Actividades de proyección social';
COMMENT ON TABLE "SocialProjectionParticipant" IS 'Participantes en actividades de proyección social';
COMMENT ON TABLE "PlacementSocialProjection" IS 'Vinculación entre prácticas y proyección social';
COMMENT ON TABLE "SniesReport" IS 'Reportes consolidados para SNIES';
COMMENT ON TABLE "SniesReportLine" IS 'Líneas de detalle de reportes SNIES';

-- Comentarios en columnas clave
COMMENT ON COLUMN "EvaluationDetail"."evaluationPeriod" IS 'Período de evaluación: 1=Corte 1, 2=Corte 2';
COMMENT ON COLUMN "EvaluationDetail"."evaluationDimensions" IS 'Dimensiones de evaluación en formato JSONB';
COMMENT ON COLUMN "EvaluationDetail"."sabbathsPlanned" IS 'Número de sábados planificados para asistencia';
COMMENT ON COLUMN "EvaluationDetail"."sabbathsAttended" IS 'Número de sábados efectivamente asistidos';
COMMENT ON COLUMN "SocialProjection"."code" IS 'Código único generado automáticamente (SP-YYYY-NNNN)';
COMMENT ON COLUMN "SocialProjection"."currentParticipants" IS 'Conteo automático de participantes activos';

-- =====================================================
-- FIN DEL SCRIPT POST-MIGRACIÓN
-- =====================================================

-- Verificación final
SELECT 'Post-migration script executed successfully' as status;