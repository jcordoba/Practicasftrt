-- =====================================================
-- FASE 3: TRIGGERS Y VALIDACIONES
-- Sistema de Prácticas Profesionales FTR - Refactoring
-- =====================================================
-- Base de datos: practicasftr
-- Fecha: $(date)
-- Propósito: Implementar triggers, validaciones y auditoría automática
-- SEGURO: Solo agrega funcionalidad, no modifica datos existentes

\echo '⚡ INICIANDO FASE 3: TRIGGERS Y VALIDACIONES'
\echo ''

-- =====================================================
-- 1. TRIGGER PARA AUDITORÍA DE PLACEMENT
-- =====================================================

\echo '📜 1. Creando trigger de auditoría para Placement...'

-- Función para auditar cambios en Placement
CREATE OR REPLACE FUNCTION audit_placement_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Para INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO "AssignmentHistory" (
            "placementId",
            "changeType",
            "newCenterId",
            "newPastorId",
            reason,
            "changedBy",
            metadata
        ) VALUES (
            NEW.id,
            'CREATED',
            NEW."centerId",
            NEW."pastorId",
            'Placement inicial creado',
            NEW."assignedBy",
            jsonb_build_object(
                'termId', NEW."termId",
                'studentId', NEW."studentId",
                'startDate', NEW."startDate",
                'endDate', NEW."endDate"
            )
        );
        RETURN NEW;
    END IF;
    
    -- Para UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Solo auditar si cambió el centro o pastor
        IF OLD."centerId" != NEW."centerId" OR OLD."pastorId" != NEW."pastorId" THEN
            INSERT INTO "AssignmentHistory" (
                "placementId",
                "changeType",
                "previousCenterId",
                "newCenterId",
                "previousPastorId",
                "newPastorId",
                reason,
                "changedBy",
                metadata
            ) VALUES (
                NEW.id,
                CASE 
                    WHEN OLD."centerId" != NEW."centerId" AND OLD."pastorId" != NEW."pastorId" THEN 'TRANSFERRED'
                    WHEN OLD."centerId" != NEW."centerId" THEN 'CENTER_CHANGED'
                    WHEN OLD."pastorId" != NEW."pastorId" THEN 'PASTOR_CHANGED'
                END,
                OLD."centerId",
                NEW."centerId",
                OLD."pastorId",
                NEW."pastorId",
                'Cambio automático detectado',
                NEW."assignedBy",
                jsonb_build_object(
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'updated_at', NEW."updatedAt"
                )
            );
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_audit_placement ON "Placement";
CREATE TRIGGER trigger_audit_placement
    AFTER INSERT OR UPDATE ON "Placement"
    FOR EACH ROW
    EXECUTE FUNCTION audit_placement_changes();

\echo '✅ Trigger de auditoría para Placement creado'
\echo ''

-- =====================================================
-- 2. VALIDACIONES TEMPORALES PARA EVALUACIONES
-- =====================================================

\echo '⏰ 2. Creando validaciones temporales para evaluaciones...'

-- Función para validar fechas de evaluación
CREATE OR REPLACE FUNCTION validate_evaluation_timing()
RETURNS TRIGGER AS $$
DECLARE
    assignment_start DATE;
    assignment_end DATE;
    cut_start_date DATE;
    cut_end_date DATE;
    assignment_duration INTEGER;
BEGIN
    -- Obtener fechas del assignment
    SELECT 
        a.fecha_inicio::DATE,
        COALESCE(
            (SELECT p."endDate"::DATE FROM "Practice" p WHERE p.id = a.practica_id),
            (a.fecha_inicio + INTERVAL '4 months')::DATE
        )
    INTO assignment_start, assignment_end
    FROM "Assignment" a
    WHERE a.id = NEW.asignacion_id;
    
    -- Si no encontramos el assignment, permitir (será validado por FK)
    IF assignment_start IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Calcular duración del assignment en días
    assignment_duration := assignment_end - assignment_start;
    
    -- Calcular ventanas de evaluación según el corte
    CASE NEW.corte
        WHEN 1 THEN
            -- Primer corte: 25% - 45% del período
            cut_start_date := assignment_start + (assignment_duration * 0.25)::INTEGER;
            cut_end_date := assignment_start + (assignment_duration * 0.45)::INTEGER;
        WHEN 2 THEN
            -- Segundo corte: 75% - 95% del período
            cut_start_date := assignment_start + (assignment_duration * 0.75)::INTEGER;
            cut_end_date := assignment_start + (assignment_duration * 0.95)::INTEGER;
        ELSE
            -- Para otros cortes, permitir cualquier fecha dentro del período
            cut_start_date := assignment_start;
            cut_end_date := assignment_end;
    END CASE;
    
    -- Validar que la fecha de evaluación esté en la ventana correcta
    IF NEW.fecha::DATE < cut_start_date OR NEW.fecha::DATE > cut_end_date THEN
        RAISE EXCEPTION 'La evaluación del corte % debe realizarse entre % y %, fecha proporcionada: %',
            NEW.corte, cut_start_date, cut_end_date, NEW.fecha::DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger de validación temporal
DROP TRIGGER IF EXISTS trigger_validate_evaluation_timing ON "Evaluation";
CREATE TRIGGER trigger_validate_evaluation_timing
    BEFORE INSERT OR UPDATE ON "Evaluation"
    FOR EACH ROW
    EXECUTE FUNCTION validate_evaluation_timing();

\echo '✅ Validaciones temporales para evaluaciones creadas'
\echo ''

-- =====================================================
-- 3. TRIGGER PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

\echo '🕒 3. Creando triggers para actualizar timestamps...'

-- Función genérica para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas nuevas que tienen updatedAt
DROP TRIGGER IF EXISTS trigger_update_placement_timestamp ON "Placement";
CREATE TRIGGER trigger_update_placement_timestamp
    BEFORE UPDATE ON "Placement"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_term_timestamp ON "Term";
CREATE TRIGGER trigger_update_term_timestamp
    BEFORE UPDATE ON "Term"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

\echo '✅ Triggers de timestamp creados'
\echo ''

-- =====================================================
-- 4. VALIDACIONES DE INTEGRIDAD DE NEGOCIO
-- =====================================================

\echo '🔒 4. Creando validaciones de integridad de negocio...'

-- Función para validar regla: un estudiante solo puede tener un placement activo por término
CREATE OR REPLACE FUNCTION validate_unique_student_term_placement()
RETURNS TRIGGER AS $$
DECLARE
    existing_count INTEGER;
BEGIN
    -- Solo validar para placements activos
    IF NEW.status != 'ACTIVE' THEN
        RETURN NEW;
    END IF;
    
    -- Contar placements activos existentes para el mismo estudiante y término
    SELECT COUNT(*)
    INTO existing_count
    FROM "Placement"
    WHERE "studentId" = NEW."studentId"
        AND "termId" = NEW."termId"
        AND status = 'ACTIVE'
        AND id != COALESCE(NEW.id, '');
    
    IF existing_count > 0 THEN
        RAISE EXCEPTION 'El estudiante % ya tiene un placement activo para el término %',
            NEW."studentId", NEW."termId";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger de validación
DROP TRIGGER IF EXISTS trigger_validate_unique_student_term ON "Placement";
CREATE TRIGGER trigger_validate_unique_student_term
    BEFORE INSERT OR UPDATE ON "Placement"
    FOR EACH ROW
    EXECUTE FUNCTION validate_unique_student_term_placement();

\echo '✅ Validaciones de integridad de negocio creadas'
\echo ''

-- =====================================================
-- 5. FUNCIÓN PARA TRANSFERENCIAS AUTOMÁTICAS
-- =====================================================

\echo '🔄 5. Creando función para transferencias automáticas...'

-- Función para transferir estudiante (actualiza placement y registra en historial)
CREATE OR REPLACE FUNCTION transfer_student(
    p_placement_id TEXT,
    p_new_center_id TEXT,
    p_new_pastor_id TEXT,
    p_reason TEXT,
    p_transferred_by TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    old_center_id TEXT;
    old_pastor_id TEXT;
    student_id TEXT;
    term_id TEXT;
BEGIN
    -- Obtener datos actuales del placement
    SELECT "centerId", "pastorId", "studentId", "termId"
    INTO old_center_id, old_pastor_id, student_id, term_id
    FROM "Placement"
    WHERE id = p_placement_id AND status = 'ACTIVE';
    
    -- Verificar que el placement existe y está activo
    IF old_center_id IS NULL THEN
        RAISE EXCEPTION 'Placement % no encontrado o no está activo', p_placement_id;
    END IF;
    
    -- Verificar que el nuevo centro existe
    IF NOT EXISTS (SELECT 1 FROM "Congregation" WHERE id = p_new_center_id) THEN
        RAISE EXCEPTION 'Centro % no existe', p_new_center_id;
    END IF;
    
    -- Verificar que el nuevo pastor existe
    IF NOT EXISTS (SELECT 1 FROM "User" WHERE id = p_new_pastor_id) THEN
        RAISE EXCEPTION 'Pastor % no existe', p_new_pastor_id;
    END IF;
    
    -- Actualizar el placement
    UPDATE "Placement"
    SET 
        "centerId" = p_new_center_id,
        "pastorId" = p_new_pastor_id,
        "assignedBy" = p_transferred_by,
        "updatedAt" = NOW()
    WHERE id = p_placement_id;
    
    -- El trigger de auditoría se encargará de registrar el cambio en AssignmentHistory
    
    -- Registrar en log de seguridad
    PERFORM log_security_event(
        p_transferred_by,
        'TRANSFER_STUDENT',
        'placement',
        p_placement_id,
        NULL,
        NULL,
        TRUE,
        NULL,
        jsonb_build_object(
            'student_id', student_id,
            'term_id', term_id,
            'old_center_id', old_center_id,
            'new_center_id', p_new_center_id,
            'old_pastor_id', old_pastor_id,
            'new_pastor_id', p_new_pastor_id,
            'reason', p_reason
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

\echo '✅ Función de transferencias automáticas creada'
\echo ''

-- =====================================================
-- 6. ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

\echo '🚀 6. Creando índices adicionales para optimización...'

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS "idx_assignment_student_status" ON "Assignment"(estudiante_id, estado);
CREATE INDEX IF NOT EXISTS "idx_assignment_center_status" ON "Assignment"(centro_id, estado);
CREATE INDEX IF NOT EXISTS "idx_evaluation_assignment_cut" ON "Evaluation"(asignacion_id, corte);
CREATE INDEX IF NOT EXISTS "idx_evidence_assignment_status" ON "Evidence"(asignacion_id, estado);
CREATE INDEX IF NOT EXISTS "idx_user_role_active" ON "UserRole"("userId", estado);

-- Índices para las nuevas tablas
CREATE INDEX IF NOT EXISTS "idx_placement_student_term_status" ON "Placement"("studentId", "termId", status);
CREATE INDEX IF NOT EXISTS "idx_assignment_history_placement_date" ON "AssignmentHistory"("placementId", "changeDate");
CREATE INDEX IF NOT EXISTS "idx_security_log_user_action_timestamp" ON "SecurityLog"("userId", action, "timestamp");

\echo '✅ Índices adicionales creados'
\echo ''

-- =====================================================
-- 7. VERIFICACIÓN DE TRIGGERS Y FUNCIONES
-- =====================================================

\echo '🔍 7. Verificando triggers y funciones creadas...'

-- Listar triggers creados
SELECT 
    schemaname,
    tablename,
    triggername,
    tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
    AND triggername LIKE 'trigger_%'
ORDER BY tablename, triggername;

-- Listar funciones creadas
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'audit_placement_changes',
        'validate_evaluation_timing',
        'update_updated_at_column',
        'validate_unique_student_term_placement',
        'transfer_student',
        'check_user_permission',
        'log_security_event'
    )
ORDER BY p.proname;

\echo ''
\echo '✅ FASE 3 COMPLETADA EXITOSAMENTE'
\echo '⚡ Triggers y validaciones implementados'
\echo '🔒 Integridad de negocio garantizada'
\echo '📜 Auditoría automática activada'
\echo '🔄 Listo para Fase 4: Pruebas y validación'
\echo ''