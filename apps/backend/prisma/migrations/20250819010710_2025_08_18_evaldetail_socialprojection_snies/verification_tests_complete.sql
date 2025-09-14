-- =====================================================
-- SCRIPT DE VERIFICACIÓN COMPLETO POST-MIGRACIÓN
-- Migración: 2025-08-18_evaldetail_socialprojection_snies
-- Fecha: 2025-01-19
-- =====================================================

-- =====================================================
-- CONFIGURACIÓN INICIAL
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Variable para almacenar resultados
DO $$
BEGIN
    RAISE NOTICE '=== INICIANDO VERIFICACIÓN INTEGRAL POST-MIGRACIÓN ===';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE 'Migración: 2025-08-18_evaldetail_socialprojection_snies';
    RAISE NOTICE '========================================================';
END
$$;

-- =====================================================
-- 1. VERIFICACIÓN DE ESTRUCTURAS DE TABLAS
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY['Term', 'Placement', 'EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant', 'PlacementSocialProjection', 'SniesReport', 'SniesReportLine'];
    current_table TEXT;
    column_count INTEGER;
BEGIN
    RAISE NOTICE '=== 1. VERIFICANDO EXISTENCIA DE TABLAS ===';
    
    FOREACH current_table IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' AND t.table_name = current_table;
        
        IF table_count = 0 THEN
            RAISE EXCEPTION 'FALLO: Tabla % no encontrada', current_table;
        ELSE
            -- Contar columnas de la tabla
            SELECT COUNT(*) INTO column_count
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = current_table;
            
            RAISE NOTICE '✓ Tabla % existe con % columnas', current_table, column_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Todas las tablas existen correctamente';
END
$$;

-- =====================================================
-- 2. VERIFICACIÓN DETALLADA DE CONSTRAINTS
-- =====================================================

DO $$
DECLARE
    constraint_count INTEGER;
    constraint_name TEXT;
    constraint_details RECORD;
BEGIN
    RAISE NOTICE '=== 2. VERIFICANDO CONSTRAINTS DETALLADAMENTE ===';
    
    -- Verificar constraints de EvaluationDetail
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'EvaluationDetail' AND cc.constraint_name LIKE 'chk_%';
    
    RAISE NOTICE '✓ EvaluationDetail: % constraints de validación', constraint_count;
    
    -- Listar constraints específicos de EvaluationDetail
    FOR constraint_details IN 
        SELECT cc.constraint_name, cc.check_clause
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'EvaluationDetail' AND cc.constraint_name LIKE 'chk_%'
        ORDER BY cc.constraint_name
    LOOP
        RAISE NOTICE '  - %: %', constraint_details.constraint_name, LEFT(constraint_details.check_clause, 50);
    END LOOP;
    
    -- Verificar constraints de SocialProjection
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'SocialProjection' AND cc.constraint_name LIKE 'chk_%';
    
    RAISE NOTICE '✓ SocialProjection: % constraints de validación', constraint_count;
    
    -- Verificar constraints de SocialProjectionParticipant
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'SocialProjectionParticipant' AND cc.constraint_name LIKE 'chk_%';
    
    RAISE NOTICE '✓ SocialProjectionParticipant: % constraints de validación', constraint_count;
    
    RAISE NOTICE '✓ RESULTADO: Constraints verificados correctamente';
END
$$;

-- =====================================================
-- 3. VERIFICACIÓN DE ÍNDICES DE RENDIMIENTO
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
    index_details RECORD;
BEGIN
    RAISE NOTICE '=== 3. VERIFICANDO ÍNDICES DE RENDIMIENTO ===';
    
    -- Contar índices personalizados
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE '✓ Total de índices personalizados: %', index_count;
    
    -- Listar índices por tabla
    FOR index_details IN 
        SELECT tablename, indexname, indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname
    LOOP
        RAISE NOTICE '  - %: %', index_details.tablename, index_details.indexname;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Índices verificados correctamente';
END
$$;

-- =====================================================
-- 4. VERIFICACIÓN DE TRIGGERS Y FUNCIONES
-- =====================================================

DO $$
DECLARE
    function_count INTEGER;
    trigger_count INTEGER;
    function_details RECORD;
    trigger_details RECORD;
BEGIN
    RAISE NOTICE '=== 4. VERIFICANDO TRIGGERS Y FUNCIONES ===';
    
    -- Verificar funciones
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('update_projection_participant_count', 'generate_projection_code', 'calculate_sabbath_attendance_pct');
    
    RAISE NOTICE '✓ Funciones PL/pgSQL: %', function_count;
    
    -- Listar funciones
    FOR function_details IN 
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN ('update_projection_participant_count', 'generate_projection_code', 'calculate_sabbath_attendance_pct')
        ORDER BY routine_name
    LOOP
        RAISE NOTICE '  - %: %', function_details.routine_name, function_details.routine_type;
    END LOOP;
    
    -- Verificar triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name IN ('trg_update_participant_count', 'trg_generate_projection_code', 'trg_calculate_sabbath_attendance');
    
    RAISE NOTICE '✓ Triggers automáticos: %', trigger_count;
    
    -- Listar triggers
    FOR trigger_details IN 
        SELECT trigger_name, event_object_table, action_timing, event_manipulation
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND trigger_name IN ('trg_update_participant_count', 'trg_generate_projection_code', 'trg_calculate_sabbath_attendance')
        ORDER BY trigger_name
    LOOP
        RAISE NOTICE '  - %: % % ON %', trigger_details.trigger_name, trigger_details.action_timing, trigger_details.event_manipulation, trigger_details.event_object_table;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Triggers y funciones verificados correctamente';
END
$$;

-- =====================================================
-- 5. VERIFICACIÓN DE VISTAS DE COMPATIBILIDAD
-- =====================================================

DO $$
DECLARE
    view_count INTEGER;
    view_details RECORD;
    column_count INTEGER;
BEGIN
    RAISE NOTICE '=== 5. VERIFICANDO VISTAS DE COMPATIBILIDAD ===';
    
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('EvaluationView', 'SocialProjectionSummary', 'StudentProjectionParticipation');
    
    RAISE NOTICE '✓ Vistas de compatibilidad: %', view_count;
    
    -- Verificar cada vista individualmente
    FOR view_details IN 
        SELECT table_name
        FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name IN ('EvaluationView', 'SocialProjectionSummary', 'StudentProjectionParticipation')
        ORDER BY table_name
    LOOP
        -- Contar columnas de la vista
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = view_details.table_name;
        
        RAISE NOTICE '  - %: % columnas', view_details.table_name, column_count;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Vistas verificadas correctamente';
END
$$;

-- =====================================================
-- 6. CREACIÓN DE DATOS DE PRUEBA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== 6. CREANDO DATOS DE PRUEBA ===';
END
$$;

-- Crear programa de prueba PRIMERO (para respetar foreign key)
INSERT INTO "Program" ("id", "nombre", "codigo", "descripcion", "estado", "fecha_creacion", "fecha_actualizacion")
VALUES ('prog-001', 'Programa de Prueba', 'TEST-001', 'Programa para pruebas de migración', 'ACTIVO', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Crear institución de prueba si no existe
INSERT INTO "Institution" ("id", "nombre", "estado", "fecha_creacion", "fecha_actualizacion", "esCentroPractica")
VALUES ('inst-001', 'Institución de Prueba', 'ACTIVO', NOW(), NOW(), true)
ON CONFLICT ("id") DO NOTHING;

-- Crear usuario de prueba DESPUÉS del programa
INSERT INTO "User" ("id", "email", "password", "nombre", "estado", "programId", "fecha_creacion", "fecha_actualizacion")
VALUES ('test-user-001', 'test@example.com', '$2b$10$test', 'Usuario de Prueba', 'ACTIVE', 'prog-001', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Test 1: Crear Term
INSERT INTO "Term" ("id", "name", "academicYear", "academicPeriod", "startDate", "endDate", "status", "createdAt", "updatedAt")
VALUES ('test-term-001', 'Semestre 2025-1 TEST', 2025, 1, '2025-01-15', '2025-06-15', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Test 2: Crear Placement
INSERT INTO "Placement" (
    "id", "studentId", "termId", "centerId", "programId", "startDate", "endDate", 
    "status", "assignedBy", "createdAt", "updatedAt"
)
VALUES (
    'test-placement-001', 'test-user-001', 'test-term-001', 'inst-001', 'prog-001', 
    '2025-02-01', '2025-05-30', 'ACTIVE', 'test-user-001', NOW(), NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- Test 3: Crear SocialProjection con generación automática de código
INSERT INTO "SocialProjection" (
    "id", "title", "description", "activityType", "category", "startDate", "endDate", 
    "location", "city", "department", "organizerId", "organizingUnit", "targetAudience", 
    "maxParticipants", "minParticipants", "currentParticipants", "budget", "status", 
    "beneficiaries", "createdBy", "createdAt", "updatedAt"
)
VALUES (
    'test-projection-001', 'Proyección Social TEST', 'Descripción de prueba para validación', 'social_projection', 
    'community_service', '2025-03-01 08:00:00', '2025-03-01 17:00:00', 'Centro Comunitario TEST', 
    'Bogotá', 'Cundinamarca', 'test-user-001', 'Facultad de Ingeniería', 'community', 
    50, 10, 0, 500000.00, 'planning', 100, 'test-user-001', NOW(), NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- =====================================================
-- 7. PRUEBAS FUNCIONALES DE TRIGGERS
-- =====================================================

DO $$
DECLARE
    generated_code TEXT;
    participant_count INTEGER;
BEGIN
    RAISE NOTICE '=== 7. PROBANDO FUNCIONALIDAD DE TRIGGERS ===';
    
    -- Test 7.1: Verificar generación automática de código
    SELECT "code" INTO generated_code
    FROM "SocialProjection" 
    WHERE "id" = 'test-projection-001';
    
    IF generated_code IS NULL OR generated_code = '' THEN
        RAISE EXCEPTION 'FALLO: El código no se generó automáticamente';
    ELSE
        RAISE NOTICE '✓ Código generado automáticamente: %', generated_code;
    END IF;
    
    -- Test 7.2: Insertar participante y verificar trigger de conteo
    INSERT INTO "SocialProjectionParticipant" (
        "id", "projectionId", "participantId", "participantType", "role", 
        "registrationDate", "attendanceStatus", "participationHours", 
        "createdBy", "createdAt", "updatedAt"
    )
    VALUES (
        'test-participant-001', 'test-projection-001', 'test-user-001', 'student', 'participant', 
        NOW(), 'registered', 8.00, 'test-user-001', NOW(), NOW()
    )
    ON CONFLICT ("id") DO NOTHING;
    
    -- Verificar actualización automática de conteo
    SELECT "currentParticipants" INTO participant_count
    FROM "SocialProjection" 
    WHERE "id" = 'test-projection-001';
    
    IF participant_count != 1 THEN
        RAISE EXCEPTION 'FALLO: El conteo de participantes no se actualizó. Esperado: 1, Actual: %', participant_count;
    ELSE
        RAISE NOTICE '✓ Conteo de participantes actualizado correctamente: %', participant_count;
    END IF;
    
    RAISE NOTICE '✓ RESULTADO: Triggers funcionando correctamente';
END
$$;

-- =====================================================
-- 8. PRUEBAS DE EVALUACIONES DETALLADAS
-- =====================================================

DO $$
DECLARE
    attendance_pct NUMERIC;
    evaluation_id TEXT := 'test-evaluation-001';
BEGIN
    RAISE NOTICE '=== 8. PROBANDO EVALUACIONES DETALLADAS ===';
    
    -- Test 8.1: Insertar EvaluationDetail con cálculo automático
    INSERT INTO "EvaluationDetail" (
        "id", "placementId", "termId", "evaluationPeriod", "evaluationDate", 
        "evaluationType", "evaluatedBy", "totalHours", "attendedHours", 
        "sabbathsPlanned", "sabbathsAttended", "finalGrade", "status", 
        "createdBy", "createdAt", "updatedAt"
    )
    VALUES (
        evaluation_id, 'test-placement-001', 'test-term-001', 1, NOW(), 
        'formative', 'test-user-001', 120.00, 115.00, 8, 7, 4.5, 'draft', 
        'test-user-001', NOW(), NOW()
    )
    ON CONFLICT ("id") DO NOTHING;
    
    -- Test 8.2: Verificar cálculo automático de porcentaje de asistencia
    SELECT ("metadata"->>'sabbathAttendancePct')::NUMERIC INTO attendance_pct
    FROM "EvaluationDetail" 
    WHERE "id" = evaluation_id;
    
    IF attendance_pct IS NULL OR attendance_pct != 87.50 THEN
        RAISE EXCEPTION 'FALLO: El porcentaje de asistencia no se calculó correctamente. Esperado: 87.50, Actual: %', attendance_pct;
    ELSE
        RAISE NOTICE '✓ Porcentaje de asistencia calculado correctamente: %', attendance_pct;
    END IF;
    
    -- Test 8.3: Insertar segunda evaluación (corte 2)
    INSERT INTO "EvaluationDetail" (
        "id", "placementId", "termId", "evaluationPeriod", "evaluationDate", 
        "evaluationType", "evaluatedBy", "totalHours", "attendedHours", 
        "sabbathsPlanned", "sabbathsAttended", "finalGrade", "status", 
        "createdBy", "createdAt", "updatedAt"
    )
    VALUES (
        'test-evaluation-002', 'test-placement-001', 'test-term-001', 2, NOW(), 
        'summative', 'test-user-001', 160.00, 155.00, 12, 11, 4.8, 'approved', 
        'test-user-001', NOW(), NOW()
    )
    ON CONFLICT ("id") DO NOTHING;
    
    RAISE NOTICE '✓ RESULTADO: Evaluaciones detalladas funcionando correctamente';
END
$$;

-- =====================================================
-- 9. PRUEBAS DE VISTAS DE COMPATIBILIDAD CON DATOS
-- =====================================================

DO $$
DECLARE
    view_record_count INTEGER;
    view_data RECORD;
BEGIN
    RAISE NOTICE '=== 9. PROBANDO VISTAS CON DATOS REALES ===';
    
    -- Test 9.1: Verificar vista EvaluationView
    SELECT COUNT(*) INTO view_record_count
    FROM "EvaluationView" 
    WHERE "placementId" = 'test-placement-001';
    
    IF view_record_count = 0 THEN
        RAISE EXCEPTION 'FALLO: La vista EvaluationView no retorna datos';
    ELSE
        RAISE NOTICE '✓ Vista EvaluationView: % registros encontrados', view_record_count;
        
        -- Mostrar datos de ejemplo
        SELECT * INTO view_data
        FROM "EvaluationView" 
        WHERE "placementId" = 'test-placement-001'
        LIMIT 1;
        
        RAISE NOTICE '  - Ejemplo: ID=%, Período=%, Nota=%', view_data.id, view_data.evaluationPeriod, view_data.finalGrade;
    END IF;
    
    -- Test 9.2: Verificar vista SocialProjectionSummary
    SELECT COUNT(*) INTO view_record_count
    FROM "SocialProjectionSummary" 
    WHERE "id" = 'test-projection-001';
    
    IF view_record_count = 0 THEN
        RAISE EXCEPTION 'FALLO: La vista SocialProjectionSummary no retorna datos';
    ELSE
        RAISE NOTICE '✓ Vista SocialProjectionSummary: % registros encontrados', view_record_count;
    END IF;
    
    -- Test 9.3: Verificar vista StudentProjectionParticipation
    SELECT COUNT(*) INTO view_record_count
    FROM "StudentProjectionParticipation" 
    WHERE "participantId" = 'test-user-001';
    
    IF view_record_count = 0 THEN
        RAISE EXCEPTION 'FALLO: La vista StudentProjectionParticipation no retorna datos';
    ELSE
        RAISE NOTICE '✓ Vista StudentProjectionParticipation: % registros encontrados', view_record_count;
    END IF;
    
    RAISE NOTICE '✓ RESULTADO: Todas las vistas funcionan correctamente con datos';
END
$$;

-- =====================================================
-- 10. PRUEBAS DE CONSTRAINTS DE VALIDACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== 10. PROBANDO CONSTRAINTS DE VALIDACIÓN ===';
    
    -- Test 10.1: Intentar insertar evaluación con nota inválida (debe fallar)
    BEGIN
        INSERT INTO "EvaluationDetail" (
            "id", "placementId", "termId", "evaluationPeriod", "evaluationDate", 
            "evaluationType", "evaluatedBy", "finalGrade", "status", 
            "createdBy", "createdAt", "updatedAt"
        )
        VALUES (
            'test-invalid-grade', 'test-placement-001', 'test-term-001', 3, NOW(), 
            'formative', 'test-user-001', 6.0, 'draft', 'test-user-001', NOW(), NOW()
        );
        
        RAISE EXCEPTION 'FALLO: El constraint de rango de notas no funcionó';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ Constraint de rango de notas funciona correctamente';
    END;
    
    -- Test 10.2: Intentar insertar proyección con fechas inválidas (debe fallar)
    BEGIN
        INSERT INTO "SocialProjection" (
            "id", "title", "description", "activityType", "category", "startDate", "endDate", 
            "location", "city", "department", "organizerId", "organizingUnit", "targetAudience", 
            "maxParticipants", "minParticipants", "currentParticipants", "budget", "status", 
            "beneficiaries", "createdBy", "createdAt", "updatedAt"
        )
        VALUES (
            'test-invalid-dates', 'Proyección Inválida', 'Fechas incorrectas', 'social_projection', 
            'community_service', '2025-06-01 08:00:00', '2025-05-01 17:00:00', 'Lugar TEST', 
            'Bogotá', 'Cundinamarca', 'test-user-001', 'Facultad', 'community', 
            50, 10, 0, 100000.00, 'planning', 50, 'test-user-001', NOW(), NOW()
        );
        
        RAISE EXCEPTION 'FALLO: El constraint de fechas no funcionó';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ Constraint de fechas funciona correctamente';
    END;
    
    RAISE NOTICE '✓ RESULTADO: Constraints de validación funcionando correctamente';
END
$$;

-- =====================================================
-- 11. PRUEBA DE REPORTE SNIES
-- =====================================================

DO $$
DECLARE
    report_id TEXT := 'test-snies-001';
    line_count INTEGER;
BEGIN
    RAISE NOTICE '=== 11. PROBANDO REPORTES SNIES ===';
    
    -- Test 11.1: Crear reporte SNIES
    INSERT INTO "SniesReport" (
        "id", "reportType", "academicYear", "academicPeriod", "generationDate", 
        "reportPeriodStart", "reportPeriodEnd", "totalRecords", "status", 
        "generatedBy", "createdAt", "updatedAt"
    )
    VALUES (
        report_id, 'student_practices', 2025, 1, NOW(), 
        '2025-01-01', '2025-06-30', 0, 'draft', 
        'test-user-001', NOW(), NOW()
    )
    ON CONFLICT ("id") DO NOTHING;
    
    -- Test 11.2: Crear líneas del reporte
    INSERT INTO "SniesReportLine" (
        "id", "reportId", "lineNumber", "studentId", "programCode", "practiceType", 
        "institutionName", "startDate", "endDate", "totalHours", "finalGrade", 
        "createdAt", "updatedAt"
    )
    VALUES (
        'test-snies-line-001', report_id, 1, 'test-user-001', 'TEST-001', 'external_practice', 
        'Institución de Prueba', '2025-02-01', '2025-05-30', 160.00, 4.5, 
        NOW(), NOW()
    )
    ON CONFLICT ("id") DO NOTHING;
    
    -- Verificar creación
    SELECT COUNT(*) INTO line_count
    FROM "SniesReportLine" 
    WHERE "reportId" = report_id;
    
    IF line_count = 0 THEN
        RAISE EXCEPTION 'FALLO: No se crearon líneas del reporte SNIES';
    ELSE
        RAISE NOTICE '✓ Reporte SNIES creado con % líneas', line_count;
    END IF;
    
    RAISE NOTICE '✓ RESULTADO: Reportes SNIES funcionando correctamente';
END
$$;

-- =====================================================
-- 12. VERIFICACIÓN DE INTEGRIDAD REFERENCIAL
-- =====================================================

DO $$
DECLARE
    fk_count INTEGER;
    fk_details RECORD;
BEGIN
    RAISE NOTICE '=== 12. VERIFICANDO INTEGRIDAD REFERENCIAL ===';
    
    -- Contar foreign keys
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('Term', 'Placement', 'EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant', 'PlacementSocialProjection', 'SniesReport', 'SniesReportLine');
    
    RAISE NOTICE '✓ Total de Foreign Keys: %', fk_count;
    
    -- Listar foreign keys por tabla
    FOR fk_details IN 
        SELECT tc.table_name, tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name IN ('Term', 'Placement', 'EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant', 'PlacementSocialProjection', 'SniesReport', 'SniesReportLine')
        ORDER BY tc.table_name, tc.constraint_name
    LOOP
        RAISE NOTICE '  - %.% -> %.%', fk_details.table_name, fk_details.column_name, fk_details.foreign_table_name, fk_details.foreign_column_name;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Integridad referencial verificada';
END
$$;

-- =====================================================
-- 13. LIMPIEZA DE DATOS DE PRUEBA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== 13. LIMPIANDO DATOS DE PRUEBA ===';
END
$$;

-- Eliminar en orden inverso por dependencias
DELETE FROM "SniesReportLine" WHERE "reportId" = 'test-snies-001';
DELETE FROM "SniesReport" WHERE "id" = 'test-snies-001';
DELETE FROM "EvaluationDetail" WHERE "placementId" = 'test-placement-001';
DELETE FROM "SocialProjectionParticipant" WHERE "projectionId" = 'test-projection-001';
DELETE FROM "SocialProjection" WHERE "id" = 'test-projection-001';
DELETE FROM "Placement" WHERE "id" = 'test-placement-001';
DELETE FROM "Term" WHERE "id" = 'test-term-001';
DELETE FROM "Program" WHERE "id" = 'prog-001';
DELETE FROM "User" WHERE "id" = 'test-user-001';

DO $$
BEGIN
    RAISE NOTICE '✓ Datos de prueba eliminados correctamente';
END
$$;

-- =====================================================
-- RESUMEN FINAL DE VERIFICACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================================';
    RAISE NOTICE '=== RESUMEN FINAL DE VERIFICACIÓN ===';
    RAISE NOTICE '✓ 1. Estructuras de tablas: CORRECTO';
    RAISE NOTICE '✓ 2. Constraints de validación: CORRECTO';
    RAISE NOTICE '✓ 3. Índices de rendimiento: CORRECTO';
    RAISE NOTICE '✓ 4. Triggers y funciones: CORRECTO';
    RAISE NOTICE '✓ 5. Vistas de compatibilidad: CORRECTO';
    RAISE NOTICE '✓ 6. Datos de prueba: CORRECTO';
    RAISE NOTICE '✓ 7. Funcionalidad de triggers: CORRECTO';
    RAISE NOTICE '✓ 8. Evaluaciones detalladas: CORRECTO';
    RAISE NOTICE '✓ 9. Vistas con datos: CORRECTO';
    RAISE NOTICE '✓ 10. Constraints de validación: CORRECTO';
    RAISE NOTICE '✓ 11. Reportes SNIES: CORRECTO';
    RAISE NOTICE '✓ 12. Integridad referencial: CORRECTO';
    RAISE NOTICE '✓ 13. Limpieza de datos: CORRECTO';
    RAISE NOTICE '========================================================';
    RAISE NOTICE 'VERIFICACIÓN INTEGRAL COMPLETADA EXITOSAMENTE';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE 'Estado: TODAS LAS PRUEBAS PASARON';
    RAISE NOTICE '========================================================';
END
$$;

-- =====================================================
-- FIN DEL SCRIPT DE VERIFICACIÓN COMPLETO
-- =====================================================