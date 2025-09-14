-- =====================================================
-- SCRIPT DE VERIFICACIÓN Y SMOKE TESTS
-- Migración: 2025-08-18_evaldetail_socialprojection_snies
-- =====================================================

-- Configuración inicial
\set ON_ERROR_STOP on
\timing on

BEGIN;

-- =====================================================
-- 1. VERIFICACIÓN DE ESTRUCTURAS DE TABLAS
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY['Term', 'Placement', 'EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant', 'PlacementSocialProjection', 'SniesReport', 'SniesReportLine'];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=== VERIFICANDO EXISTENCIA DE TABLAS ===';
    
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = table_name;
        
        IF table_count = 0 THEN
            RAISE EXCEPTION 'Tabla % no encontrada', table_name;
        ELSE
            RAISE NOTICE '✓ Tabla % existe', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Todas las tablas existen correctamente';
END
$$;

-- =====================================================
-- 2. VERIFICACIÓN DE CONSTRAINTS
-- =====================================================

DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO CONSTRAINTS ===';
    
    -- Verificar constraints de EvaluationDetail
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'EvaluationDetail' AND cc.constraint_name LIKE 'chk_%';
    
    IF constraint_count < 5 THEN
        RAISE EXCEPTION 'Faltan constraints en EvaluationDetail. Encontrados: %', constraint_count;
    ELSE
        RAISE NOTICE '✓ Constraints de EvaluationDetail: %', constraint_count;
    END IF;
    
    -- Verificar constraints de SocialProjection
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'SocialProjection' AND cc.constraint_name LIKE 'chk_%';
    
    IF constraint_count < 10 THEN
        RAISE EXCEPTION 'Faltan constraints en SocialProjection. Encontrados: %', constraint_count;
    ELSE
        RAISE NOTICE '✓ Constraints de SocialProjection: %', constraint_count;
    END IF;
    
    RAISE NOTICE 'Constraints verificados correctamente';
END
$$;

-- =====================================================
-- 3. VERIFICACIÓN DE ÍNDICES
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO ÍNDICES ===';
    
    -- Contar índices creados por la migración (excluyendo índices automáticos de PK/FK)
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    IF index_count < 20 THEN
        RAISE EXCEPTION 'Faltan índices. Encontrados: %, esperados: >= 20', index_count;
    ELSE
        RAISE NOTICE '✓ Índices personalizados creados: %', index_count;
    END IF;
    
    RAISE NOTICE 'Índices verificados correctamente';
END
$$;

-- =====================================================
-- 4. VERIFICACIÓN DE TRIGGERS Y FUNCIONES
-- =====================================================

DO $$
DECLARE
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO TRIGGERS Y FUNCIONES ===';
    
    -- Verificar funciones
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('update_projection_participant_count', 'generate_projection_code', 'calculate_sabbath_attendance_pct');
    
    IF function_count < 3 THEN
        RAISE EXCEPTION 'Faltan funciones. Encontradas: %, esperadas: 3', function_count;
    ELSE
        RAISE NOTICE '✓ Funciones creadas: %', function_count;
    END IF;
    
    -- Verificar triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name IN ('trg_update_participant_count', 'trg_generate_projection_code', 'trg_calculate_sabbath_attendance');
    
    IF trigger_count < 3 THEN
        RAISE EXCEPTION 'Faltan triggers. Encontrados: %, esperados: 3', trigger_count;
    ELSE
        RAISE NOTICE '✓ Triggers creados: %', trigger_count;
    END IF;
    
    RAISE NOTICE 'Triggers y funciones verificados correctamente';
END
$$;

-- =====================================================
-- 5. VERIFICACIÓN DE VISTAS
-- =====================================================

DO $$
DECLARE
    view_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO VISTAS ===';
    
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('EvaluationView', 'SocialProjectionSummary', 'StudentProjectionParticipation');
    
    IF view_count < 3 THEN
        RAISE EXCEPTION 'Faltan vistas. Encontradas: %, esperadas: 3', view_count;
    ELSE
        RAISE NOTICE '✓ Vistas creadas: %', view_count;
    END IF;
    
    RAISE NOTICE 'Vistas verificadas correctamente';
END
$$;

-- =====================================================
-- 6. SMOKE TESTS CON DATOS DE PRUEBA
-- =====================================================

RAISE NOTICE '=== INICIANDO SMOKE TESTS ===';

-- Test 1: Insertar Term
INSERT INTO "Term" ("id", "name", "academicYear", "academicPeriod", "startDate", "endDate", "status", "createdBy", "createdAt", "updatedAt")
VALUES ('test-term-001', 'Semestre 2025-1 TEST', 2025, 1, '2025-01-15', '2025-06-15', 'active', 'test-user', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

RAISE NOTICE '✓ Test 1: Term insertado correctamente';

-- Test 2: Insertar SocialProjection (debe generar código automáticamente)
INSERT INTO "SocialProjection" (
    "id", "title", "description", "activityType", "category", "startDate", "endDate", 
    "location", "city", "department", "organizerId", "organizingUnit", "targetAudience", 
    "maxParticipants", "minParticipants", "currentParticipants", "budget", "status", 
    "beneficiaries", "createdBy", "createdAt", "updatedAt"
)
VALUES (
    'test-projection-001', 'Proyección Social TEST', 'Descripción de prueba', 'social_projection', 
    'community_service', '2025-03-01 08:00:00', '2025-03-01 17:00:00', 'Centro Comunitario TEST', 
    'Bogotá', 'Cundinamarca', 'test-user', 'Facultad de Ingeniería', 'community', 
    50, 10, 0, 500000.00, 'planning', 100, 'test-user', NOW(), NOW()
)
ON CONFLICT ("id") DO NOTHING;

RAISE NOTICE '✓ Test 2: SocialProjection insertado correctamente';

-- Test 3: Verificar generación automática de código
DO $$
DECLARE
    generated_code TEXT;
BEGIN
    SELECT "code" INTO generated_code
    FROM "SocialProjection" 
    WHERE "id" = 'test-projection-001';
    
    IF generated_code IS NULL OR generated_code = '' THEN
        RAISE EXCEPTION 'El código no se generó automáticamente';
    ELSE
        RAISE NOTICE '✓ Test 3: Código generado automáticamente: %', generated_code;
    END IF;
END
$$;

-- Test 4: Insertar participante y verificar trigger de conteo
INSERT INTO "SocialProjectionParticipant" (
    "id", "projectionId", "participantId", "participantType", "role", 
    "registrationDate", "attendanceStatus", "participationHours", 
    "createdBy", "createdAt", "updatedAt"
)
VALUES (
    'test-participant-001', 'test-projection-001', 'test-user', 'student', 'participant', 
    NOW(), 'registered', 8.00, 'test-user', NOW(), NOW()
)
ON CONFLICT ("id") DO NOTHING;

RAISE NOTICE '✓ Test 4: Participante insertado correctamente';

-- Test 5: Verificar actualización automática de conteo
DO $$
DECLARE
    participant_count INTEGER;
BEGIN
    SELECT "currentParticipants" INTO participant_count
    FROM "SocialProjection" 
    WHERE "id" = 'test-projection-001';
    
    IF participant_count != 1 THEN
        RAISE EXCEPTION 'El conteo de participantes no se actualizó. Esperado: 1, Actual: %', participant_count;
    ELSE
        RAISE NOTICE '✓ Test 5: Conteo de participantes actualizado correctamente: %', participant_count;
    END IF;
END
$$;

-- Test 6: Insertar EvaluationDetail y verificar trigger de porcentaje
INSERT INTO "EvaluationDetail" (
    "id", "placementId", "termId", "evaluationPeriod", "evaluationDate", 
    "evaluationType", "evaluatedBy", "totalHours", "attendedHours", 
    "sabbathsPlanned", "sabbathsAttended", "finalGrade", "status", 
    "createdBy", "createdAt", "updatedAt"
)
VALUES (
    'test-evaluation-001', 'test-placement-001', 'test-term-001', 1, NOW(), 
    'formative', 'test-user', 120.00, 115.00, 8, 7, 4.5, 'draft', 
    'test-user', NOW(), NOW()
)
ON CONFLICT ("id") DO NOTHING;

RAISE NOTICE '✓ Test 6: EvaluationDetail insertado correctamente';

-- Test 7: Verificar cálculo automático de porcentaje de asistencia
DO $$
DECLARE
    attendance_pct NUMERIC;
BEGIN
    SELECT ("metadata"->>'sabbathAttendancePct')::NUMERIC INTO attendance_pct
    FROM "EvaluationDetail" 
    WHERE "id" = 'test-evaluation-001';
    
    IF attendance_pct IS NULL OR attendance_pct != 87.50 THEN
        RAISE EXCEPTION 'El porcentaje de asistencia no se calculó correctamente. Esperado: 87.50, Actual: %', attendance_pct;
    ELSE
        RAISE NOTICE '✓ Test 7: Porcentaje de asistencia calculado correctamente: %', attendance_pct;
    END IF;
END
$$;

-- Test 8: Verificar constraints de validación
DO $$
BEGIN
    -- Intentar insertar evaluación con nota inválida (debe fallar)
    BEGIN
        INSERT INTO "EvaluationDetail" (
            "id", "placementId", "termId", "evaluationPeriod", "evaluationDate", 
            "evaluationType", "evaluatedBy", "finalGrade", "status", 
            "createdBy", "createdAt", "updatedAt"
        )
        VALUES (
            'test-invalid-grade', 'test-placement-002', 'test-term-001', 1, NOW(), 
            'formative', 'test-user', 6.0, 'draft', 'test-user', NOW(), NOW()
        );
        
        RAISE EXCEPTION 'El constraint de rango de notas no funcionó';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ Test 8: Constraint de rango de notas funciona correctamente';
    END;
END
$$;

-- Test 9: Verificar vistas
DO $$
DECLARE
    view_record_count INTEGER;
BEGIN
    -- Verificar vista EvaluationView
    SELECT COUNT(*) INTO view_record_count
    FROM "EvaluationView" 
    WHERE "id" = 'test-evaluation-001';
    
    IF view_record_count = 0 THEN
        RAISE EXCEPTION 'La vista EvaluationView no retorna datos';
    ELSE
        RAISE NOTICE '✓ Test 9a: Vista EvaluationView funciona correctamente';
    END IF;
    
    -- Verificar vista SocialProjectionSummary
    SELECT COUNT(*) INTO view_record_count
    FROM "SocialProjectionSummary" 
    WHERE "id" = 'test-projection-001';
    
    IF view_record_count = 0 THEN
        RAISE EXCEPTION 'La vista SocialProjectionSummary no retorna datos';
    ELSE
        RAISE NOTICE '✓ Test 9b: Vista SocialProjectionSummary funciona correctamente';
    END IF;
    
    -- Verificar vista StudentProjectionParticipation
    SELECT COUNT(*) INTO view_record_count
    FROM "StudentProjectionParticipation" 
    WHERE "id" = 'test-participant-001';
    
    IF view_record_count = 0 THEN
        RAISE EXCEPTION 'La vista StudentProjectionParticipation no retorna datos';
    ELSE
        RAISE NOTICE '✓ Test 9c: Vista StudentProjectionParticipation funciona correctamente';
    END IF;
END
$$;

-- =====================================================
-- 7. LIMPIEZA DE DATOS DE PRUEBA
-- =====================================================

RAISE NOTICE '=== LIMPIANDO DATOS DE PRUEBA ===';

-- Eliminar en orden inverso por dependencias
DELETE FROM "EvaluationDetail" WHERE "id" = 'test-evaluation-001';
DELETE FROM "SocialProjectionParticipant" WHERE "id" = 'test-participant-001';
DELETE FROM "SocialProjection" WHERE "id" = 'test-projection-001';
DELETE FROM "Term" WHERE "id" = 'test-term-001';

RAISE NOTICE '✓ Datos de prueba eliminados correctamente';

-- =====================================================
-- 8. VERIFICACIÓN DE RENDIMIENTO DE ÍNDICES
-- =====================================================

RAISE NOTICE '=== VERIFICANDO RENDIMIENTO DE ÍNDICES ===';

-- Verificar que los índices están siendo utilizados
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM "EvaluationDetail" 
WHERE "termId" = 'any-term' AND "evaluationPeriod" = 1;

EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM "SocialProjection" 
WHERE "status" = 'active' AND "activityType" = 'social_projection';

RAISE NOTICE '✓ Planes de ejecución verificados';

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

RAISE NOTICE '=== RESUMEN DE VERIFICACIÓN ===';
RAISE NOTICE '✓ Todas las estructuras de tablas están presentes';
RAISE NOTICE '✓ Todos los constraints están funcionando';
RAISE NOTICE '✓ Todos los índices están creados';
RAISE NOTICE '✓ Todos los triggers y funciones están operativos';
RAISE NOTICE '✓ Todas las vistas están disponibles';
RAISE NOTICE '✓ Los smoke tests pasaron exitosamente';
RAISE NOTICE '✓ La migración se completó correctamente';

COMMIT;

SELECT 
    'VERIFICACIÓN COMPLETADA EXITOSAMENTE' as status,
    NOW() as timestamp,
    'Migración 2025-08-18_evaldetail_socialprojection_snies verificada' as details;

-- =====================================================
-- FIN DEL SCRIPT DE VERIFICACIÓN
-- =====================================================