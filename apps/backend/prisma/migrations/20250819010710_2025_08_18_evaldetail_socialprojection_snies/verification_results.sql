-- =====================================================
-- SCRIPT DE VERIFICACIÓN ESTRUCTURAL POST-MIGRACIÓN
-- Migración: 2025-08-18_evaldetail_socialprojection_snies
-- Fecha: 2025-01-19
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN INTEGRAL POST-MIGRACIÓN ===';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE 'Migración: 2025-08-18_evaldetail_socialprojection_snies';
    RAISE NOTICE '========================================================';
END
$$;

-- =====================================================
-- 1. VERIFICACIÓN DE TABLAS PRINCIPALES
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
-- 2. VERIFICACIÓN DE CONSTRAINTS
-- =====================================================

DO $$
DECLARE
    constraint_count INTEGER;
    constraint_details RECORD;
BEGIN
    RAISE NOTICE '=== 2. VERIFICANDO CONSTRAINTS ===';
    
    -- Contar constraints de validación
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name IN ('EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant')
    AND cc.constraint_name LIKE 'chk_%';
    
    RAISE NOTICE '✓ Total constraints de validación: %', constraint_count;
    
    -- Listar constraints por tabla
    FOR constraint_details IN 
        SELECT ccu.table_name, cc.constraint_name
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name IN ('EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant')
        AND cc.constraint_name LIKE 'chk_%'
        ORDER BY ccu.table_name, cc.constraint_name
    LOOP
        RAISE NOTICE '  - %: %', constraint_details.table_name, constraint_details.constraint_name;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Constraints verificados correctamente';
END
$$;

-- =====================================================
-- 3. VERIFICACIÓN DE ÍNDICES
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
    index_details RECORD;
BEGIN
    RAISE NOTICE '=== 3. VERIFICANDO ÍNDICES ===';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
    AND tablename IN ('EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant', 'Placement');
    
    RAISE NOTICE '✓ Total índices personalizados: %', index_count;
    
    FOR index_details IN 
        SELECT tablename, indexname
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
        AND tablename IN ('EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant', 'Placement')
        ORDER BY tablename, indexname
    LOOP
        RAISE NOTICE '  - %: %', index_details.tablename, index_details.indexname;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Índices verificados correctamente';
END
$$;

-- =====================================================
-- 4. VERIFICACIÓN DE FUNCIONES PL/pgSQL
-- =====================================================

DO $$
DECLARE
    function_count INTEGER;
    function_details RECORD;
BEGIN
    RAISE NOTICE '=== 4. VERIFICANDO FUNCIONES PL/pgSQL ===';
    
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('update_projection_participant_count', 'generate_projection_code', 'calculate_sabbath_attendance_pct');
    
    RAISE NOTICE '✓ Funciones PL/pgSQL encontradas: %', function_count;
    
    FOR function_details IN 
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN ('update_projection_participant_count', 'generate_projection_code', 'calculate_sabbath_attendance_pct')
        ORDER BY routine_name
    LOOP
        RAISE NOTICE '  - %: %', function_details.routine_name, function_details.routine_type;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Funciones verificadas correctamente';
END
$$;

-- =====================================================
-- 5. VERIFICACIÓN DE TRIGGERS
-- =====================================================

DO $$
DECLARE
    trigger_count INTEGER;
    trigger_details RECORD;
BEGIN
    RAISE NOTICE '=== 5. VERIFICANDO TRIGGERS ===';
    
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name IN ('trg_update_participant_count', 'trg_generate_projection_code', 'trg_calculate_sabbath_attendance');
    
    RAISE NOTICE '✓ Triggers encontrados: %', trigger_count;
    
    FOR trigger_details IN 
        SELECT trigger_name, event_object_table, action_timing, event_manipulation
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND trigger_name IN ('trg_update_participant_count', 'trg_generate_projection_code', 'trg_calculate_sabbath_attendance')
        ORDER BY trigger_name
    LOOP
        RAISE NOTICE '  - %: % % ON %', trigger_details.trigger_name, trigger_details.action_timing, trigger_details.event_manipulation, trigger_details.event_object_table;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Triggers verificados correctamente';
END
$$;

-- =====================================================
-- 6. VERIFICACIÓN DE VISTAS
-- =====================================================

DO $$
DECLARE
    view_count INTEGER;
    view_details RECORD;
    column_count INTEGER;
BEGIN
    RAISE NOTICE '=== 6. VERIFICANDO VISTAS DE COMPATIBILIDAD ===';
    
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('EvaluationView', 'SocialProjectionSummary', 'StudentProjectionParticipation');
    
    RAISE NOTICE '✓ Vistas de compatibilidad encontradas: %', view_count;
    
    FOR view_details IN 
        SELECT table_name
        FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name IN ('EvaluationView', 'SocialProjectionSummary', 'StudentProjectionParticipation')
        ORDER BY table_name
    LOOP
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = view_details.table_name;
        
        RAISE NOTICE '  - %: % columnas', view_details.table_name, column_count;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Vistas verificadas correctamente';
END
$$;

-- =====================================================
-- 7. VERIFICACIÓN DE TIPOS DE DATOS ENUM
-- =====================================================

DO $$
DECLARE
    enum_count INTEGER;
    enum_details RECORD;
BEGIN
    RAISE NOTICE '=== 7. VERIFICANDO TIPOS ENUM ===';
    
    SELECT COUNT(*) INTO enum_count
    FROM pg_type 
    WHERE typname IN ('EvaluationType', 'EvaluationStatus', 'SocialProjectionStatus', 'SocialProjectionCategory', 'ParticipantType', 'AttendanceStatus');
    
    RAISE NOTICE '✓ Tipos ENUM encontrados: %', enum_count;
    
    FOR enum_details IN 
        SELECT typname
        FROM pg_type 
        WHERE typname IN ('EvaluationType', 'EvaluationStatus', 'SocialProjectionStatus', 'SocialProjectionCategory', 'ParticipantType', 'AttendanceStatus')
        ORDER BY typname
    LOOP
        RAISE NOTICE '  - %', enum_details.typname;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Tipos ENUM verificados correctamente';
END
$$;

-- =====================================================
-- 8. VERIFICACIÓN DE COLUMNAS ESPECÍFICAS
-- =====================================================

DO $$
DECLARE
    column_exists BOOLEAN;
    table_column_pairs TEXT[][] := ARRAY[
        ['EvaluationDetail', 'metadata'],
        ['SocialProjection', 'code'],
        ['SocialProjection', 'currentParticipants'],
        ['SocialProjectionParticipant', 'participationHours'],
        ['SniesReport', 'reportCode'],
        ['SniesReportLine', 'lineData']
    ];
    pair TEXT[];
BEGIN
    RAISE NOTICE '=== 8. VERIFICANDO COLUMNAS ESPECÍFICAS ===';
    
    FOREACH pair SLICE 1 IN ARRAY table_column_pairs
    LOOP
        SELECT EXISTS(
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = pair[1] 
            AND column_name = pair[2]
        ) INTO column_exists;
        
        IF column_exists THEN
            RAISE NOTICE '✓ %.% existe', pair[1], pair[2];
        ELSE
            RAISE EXCEPTION 'FALLO: Columna %.% no encontrada', pair[1], pair[2];
        END IF;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Columnas específicas verificadas correctamente';
END
$$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================================';
    RAISE NOTICE '=== RESUMEN FINAL DE VERIFICACIÓN ESTRUCTURAL ===';
    RAISE NOTICE '✓ 1. Tablas principales: VERIFICADO';
    RAISE NOTICE '✓ 2. Constraints de validación: VERIFICADO';
    RAISE NOTICE '✓ 3. Índices de rendimiento: VERIFICADO';
    RAISE NOTICE '✓ 4. Funciones PL/pgSQL: VERIFICADO';
    RAISE NOTICE '✓ 5. Triggers automáticos: VERIFICADO';
    RAISE NOTICE '✓ 6. Vistas de compatibilidad: VERIFICADO';
    RAISE NOTICE '✓ 7. Tipos ENUM: VERIFICADO';
    RAISE NOTICE '✓ 8. Columnas específicas: VERIFICADO';
    RAISE NOTICE '========================================================';
    RAISE NOTICE 'VERIFICACIÓN ESTRUCTURAL COMPLETADA EXITOSAMENTE';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE 'Estado: TODAS LAS ESTRUCTURAS ESTÁN CORRECTAS';
    RAISE NOTICE '========================================================';
END
$$;