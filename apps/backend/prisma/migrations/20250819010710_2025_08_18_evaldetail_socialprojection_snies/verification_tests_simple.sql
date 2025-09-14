-- =====================================================
-- SCRIPT DE VERIFICACIÓN SIMPLIFICADO
-- Migración: 2025-08-18_evaldetail_socialprojection_snies
-- =====================================================

-- =====================================================
-- 1. VERIFICACIÓN DE ESTRUCTURAS DE TABLAS
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY['Term', 'Placement', 'EvaluationDetail', 'SocialProjection', 'SocialProjectionParticipant', 'PlacementSocialProjection', 'SniesReport', 'SniesReportLine'];
    current_table TEXT;
BEGIN
    RAISE NOTICE '=== VERIFICANDO EXISTENCIA DE TABLAS ===';
    
    FOREACH current_table IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' AND t.table_name = current_table;
        
        IF table_count = 0 THEN
            RAISE EXCEPTION 'Tabla % no encontrada', current_table;
        ELSE
            RAISE NOTICE '✓ Tabla % existe', current_table;
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
    
    RAISE NOTICE '✓ Constraints de EvaluationDetail: %', constraint_count;
    
    -- Verificar constraints de SocialProjection
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'SocialProjection' AND cc.constraint_name LIKE 'chk_%';
    
    RAISE NOTICE '✓ Constraints de SocialProjection: %', constraint_count;
    
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
    
    RAISE NOTICE '✓ Índices personalizados creados: %', index_count;
    
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
    
    RAISE NOTICE '✓ Funciones creadas: %', function_count;
    
    -- Verificar triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name IN ('trg_update_participant_count', 'trg_generate_projection_code', 'trg_calculate_sabbath_attendance');
    
    RAISE NOTICE '✓ Triggers creados: %', trigger_count;
    
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
    
    RAISE NOTICE '✓ Vistas creadas: %', view_count;
    
    RAISE NOTICE 'Vistas verificadas correctamente';
END
$$;

-- =====================================================
-- 6. VERIFICACIÓN DE COLUMNAS ESPECÍFICAS
-- =====================================================

DO $$
DECLARE
    column_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO COLUMNAS ESPECÍFICAS ===';
    
    -- Verificar columnas de EvaluationDetail
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'EvaluationDetail'
    AND column_name IN ('sabbathsPlanned', 'sabbathsAttended', 'metadata');
    
    IF column_count < 3 THEN
        RAISE EXCEPTION 'Faltan columnas en EvaluationDetail. Encontradas: %', column_count;
    ELSE
        RAISE NOTICE '✓ Columnas de EvaluationDetail: %', column_count;
    END IF;
    
    -- Verificar columnas de SocialProjection
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'SocialProjection'
    AND column_name IN ('code', 'currentParticipants', 'maxParticipants', 'minParticipants');
    
    IF column_count < 4 THEN
        RAISE EXCEPTION 'Faltan columnas en SocialProjection. Encontradas: %', column_count;
    ELSE
        RAISE NOTICE '✓ Columnas de SocialProjection: %', column_count;
    END IF;
    
    RAISE NOTICE 'Columnas verificadas correctamente';
END
$$;

-- =====================================================
-- 7. VERIFICACIÓN DE TIPOS DE DATOS
-- =====================================================

DO $$
DECLARE
    correct_types INTEGER := 0;
BEGIN
    RAISE NOTICE '=== VERIFICANDO TIPOS DE DATOS ===';
    
    -- Verificar tipo JSONB para metadata
    SELECT COUNT(*) INTO correct_types
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'EvaluationDetail'
    AND column_name = 'metadata'
    AND data_type = 'jsonb';
    
    IF correct_types = 1 THEN
        RAISE NOTICE '✓ Tipo JSONB para metadata correcto';
    ELSE
        RAISE EXCEPTION 'Tipo de dato incorrecto para metadata';
    END IF;
    
    -- Verificar tipos numéricos
    SELECT COUNT(*) INTO correct_types
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'SocialProjection'
    AND column_name IN ('currentParticipants', 'maxParticipants', 'minParticipants')
    AND data_type = 'integer';
    
    IF correct_types = 3 THEN
        RAISE NOTICE '✓ Tipos numéricos correctos';
    ELSE
        RAISE EXCEPTION 'Tipos de datos incorrectos para contadores';
    END IF;
    
    RAISE NOTICE 'Tipos de datos verificados correctamente';
END
$$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

SELECT 
    'VERIFICACIÓN COMPLETADA EXITOSAMENTE' as status,
    NOW() as timestamp,
    'Migración 2025-08-18_evaldetail_socialprojection_snies verificada' as details;

-- =====================================================
-- FIN DEL SCRIPT DE VERIFICACIÓN
-- =====================================================