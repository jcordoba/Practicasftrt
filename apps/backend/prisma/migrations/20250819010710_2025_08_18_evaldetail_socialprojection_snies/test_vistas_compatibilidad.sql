-- =====================================================
-- PRUEBAS DE VISTAS DE COMPATIBILIDAD
-- Migración: 2025-08-18_evaldetail_socialprojection_snies
-- Fecha: 2025-01-19
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== INICIANDO PRUEBAS DE VISTAS DE COMPATIBILIDAD ===';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '========================================================';
END
$$;

-- =====================================================
-- 1. VERIFICAR EXISTENCIA DE VISTAS
-- =====================================================

DO $$
DECLARE
    view_count INTEGER;
    expected_views TEXT[] := ARRAY['EvaluationView', 'SocialProjectionSummary', 'StudentProjectionParticipation'];
    current_view TEXT;
    column_count INTEGER;
BEGIN
    RAISE NOTICE '=== 1. VERIFICANDO EXISTENCIA DE VISTAS ===';
    
    FOREACH current_view IN ARRAY expected_views
    LOOP
        SELECT COUNT(*) INTO view_count
        FROM information_schema.views v
        WHERE v.table_schema = 'public' AND v.table_name = current_view;
        
        IF view_count = 0 THEN
            RAISE EXCEPTION 'FALLO: Vista % no encontrada', current_view;
        ELSE
            -- Contar columnas de la vista
            SELECT COUNT(*) INTO column_count
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = current_view;
            
            RAISE NOTICE '✓ Vista % existe con % columnas', current_view, column_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Todas las vistas existen correctamente';
END
$$;

-- =====================================================
-- 2. PROBAR VISTA EvaluationView
-- =====================================================

DO $$
DECLARE
    record_count INTEGER;
    sample_record RECORD;
BEGIN
    RAISE NOTICE '=== 2. PROBANDO VISTA EvaluationView ===';
    
    -- Verificar que la vista se puede consultar sin errores
    BEGIN
        SELECT COUNT(*) INTO record_count FROM "EvaluationView";
        RAISE NOTICE '✓ Vista EvaluationView consultable: % registros totales', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'FALLO: Error al consultar EvaluationView: %', SQLERRM;
    END;
    
    -- Si hay datos, mostrar estructura de un registro
    IF record_count > 0 THEN
        SELECT * INTO sample_record FROM "EvaluationView" LIMIT 1;
        RAISE NOTICE '✓ Estructura de EvaluationView verificada con datos reales';
    ELSE
        RAISE NOTICE '⚠ Vista EvaluationView está vacía (sin datos de prueba)';
    END IF;
    
    RAISE NOTICE '✓ RESULTADO: Vista EvaluationView funciona correctamente';
END
$$;

-- =====================================================
-- 3. PROBAR VISTA SocialProjectionSummary
-- =====================================================

DO $$
DECLARE
    record_count INTEGER;
    sample_record RECORD;
BEGIN
    RAISE NOTICE '=== 3. PROBANDO VISTA SocialProjectionSummary ===';
    
    -- Verificar que la vista se puede consultar sin errores
    BEGIN
        SELECT COUNT(*) INTO record_count FROM "SocialProjectionSummary";
        RAISE NOTICE '✓ Vista SocialProjectionSummary consultable: % registros totales', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'FALLO: Error al consultar SocialProjectionSummary: %', SQLERRM;
    END;
    
    -- Si hay datos, mostrar estructura de un registro
    IF record_count > 0 THEN
        SELECT * INTO sample_record FROM "SocialProjectionSummary" LIMIT 1;
        RAISE NOTICE '✓ Estructura de SocialProjectionSummary verificada con datos reales';
    ELSE
        RAISE NOTICE '⚠ Vista SocialProjectionSummary está vacía (sin datos de prueba)';
    END IF;
    
    RAISE NOTICE '✓ RESULTADO: Vista SocialProjectionSummary funciona correctamente';
END
$$;

-- =====================================================
-- 4. PROBAR VISTA StudentProjectionParticipation
-- =====================================================

DO $$
DECLARE
    record_count INTEGER;
    sample_record RECORD;
BEGIN
    RAISE NOTICE '=== 4. PROBANDO VISTA StudentProjectionParticipation ===';
    
    -- Verificar que la vista se puede consultar sin errores
    BEGIN
        SELECT COUNT(*) INTO record_count FROM "StudentProjectionParticipation";
        RAISE NOTICE '✓ Vista StudentProjectionParticipation consultable: % registros totales', record_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'FALLO: Error al consultar StudentProjectionParticipation: %', SQLERRM;
    END;
    
    -- Si hay datos, mostrar estructura de un registro
    IF record_count > 0 THEN
        SELECT * INTO sample_record FROM "StudentProjectionParticipation" LIMIT 1;
        RAISE NOTICE '✓ Estructura de StudentProjectionParticipation verificada con datos reales';
    ELSE
        RAISE NOTICE '⚠ Vista StudentProjectionParticipation está vacía (sin datos de prueba)';
    END IF;
    
    RAISE NOTICE '✓ RESULTADO: Vista StudentProjectionParticipation funciona correctamente';
END
$$;

-- =====================================================
-- 5. VERIFICAR COLUMNAS ESPECÍFICAS DE LAS VISTAS
-- =====================================================

DO $$
DECLARE
    column_exists BOOLEAN;
    view_column_pairs TEXT[][] := ARRAY[
        ['EvaluationView', 'id'],
        ['EvaluationView', 'assignmentId'],
        ['EvaluationView', 'period'],
        ['EvaluationView', 'grade'],
        ['SocialProjectionSummary', 'id'],
        ['SocialProjectionSummary', 'title'],
        ['SocialProjectionSummary', 'currentParticipants'],
        ['SocialProjectionSummary', 'status'],
        ['StudentProjectionParticipation', 'participantId'],
        ['StudentProjectionParticipation', 'projectionTitle'],
        ['StudentProjectionParticipation', 'participationHours']
    ];
    pair TEXT[];
BEGIN
    RAISE NOTICE '=== 5. VERIFICANDO COLUMNAS ESPECÍFICAS DE VISTAS ===';
    
    FOREACH pair SLICE 1 IN ARRAY view_column_pairs
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
            RAISE EXCEPTION 'FALLO: Columna %.% no encontrada en vista', pair[1], pair[2];
        END IF;
    END LOOP;
    
    RAISE NOTICE '✓ RESULTADO: Columnas de vistas verificadas correctamente';
END
$$;

-- =====================================================
-- 6. PROBAR CONSULTAS TÍPICAS EN LAS VISTAS
-- =====================================================

DO $$
DECLARE
    query_result INTEGER;
BEGIN
    RAISE NOTICE '=== 6. PROBANDO CONSULTAS TÍPICAS ===';
    
    -- Consulta típica 1: Evaluaciones por período
    BEGIN
        SELECT COUNT(*) INTO query_result 
        FROM "EvaluationView" 
        WHERE "period" = 1;
        RAISE NOTICE '✓ Consulta evaluaciones período 1: % registros', query_result;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'FALLO: Error en consulta evaluaciones por período: %', SQLERRM;
    END;
    
    -- Consulta típica 2: Proyecciones por estado
    BEGIN
        SELECT COUNT(*) INTO query_result 
        FROM "SocialProjectionSummary" 
        WHERE "status" = 'planning';
        RAISE NOTICE '✓ Consulta proyecciones en planning: % registros', query_result;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'FALLO: Error en consulta proyecciones por estado: %', SQLERRM;
    END;
    
    -- Consulta típica 3: Participaciones con horas
    BEGIN
        SELECT COUNT(*) INTO query_result 
        FROM "StudentProjectionParticipation" 
        WHERE "participationHours" > 0;
        RAISE NOTICE '✓ Consulta participaciones con horas: % registros', query_result;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'FALLO: Error en consulta participaciones con horas: %', SQLERRM;
    END;
    
    RAISE NOTICE '✓ RESULTADO: Consultas típicas funcionan correctamente';
END
$$;

-- =====================================================
-- 7. VERIFICAR RENDIMIENTO DE VISTAS
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
    record_count INTEGER;
BEGIN
    RAISE NOTICE '=== 7. VERIFICANDO RENDIMIENTO DE VISTAS ===';
    
    -- Test de rendimiento EvaluationView
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO record_count FROM "EvaluationView";
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '✓ EvaluationView: % registros en %', record_count, execution_time;
    
    -- Test de rendimiento SocialProjectionSummary
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO record_count FROM "SocialProjectionSummary";
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '✓ SocialProjectionSummary: % registros en %', record_count, execution_time;
    
    -- Test de rendimiento StudentProjectionParticipation
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO record_count FROM "StudentProjectionParticipation";
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '✓ StudentProjectionParticipation: % registros en %', record_count, execution_time;
    
    RAISE NOTICE '✓ RESULTADO: Rendimiento de vistas verificado';
END
$$;

-- =====================================================
-- RESUMEN FINAL DE PRUEBAS DE VISTAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================================';
    RAISE NOTICE '=== RESUMEN FINAL DE PRUEBAS DE VISTAS ===';
    RAISE NOTICE '✓ 1. Existencia de vistas: VERIFICADO';
    RAISE NOTICE '✓ 2. Vista EvaluationView: FUNCIONAL';
    RAISE NOTICE '✓ 3. Vista SocialProjectionSummary: FUNCIONAL';
    RAISE NOTICE '✓ 4. Vista StudentProjectionParticipation: FUNCIONAL';
    RAISE NOTICE '✓ 5. Columnas específicas: VERIFICADO';
    RAISE NOTICE '✓ 6. Consultas típicas: FUNCIONAL';
    RAISE NOTICE '✓ 7. Rendimiento: VERIFICADO';
    RAISE NOTICE '========================================================';
    RAISE NOTICE 'PRUEBAS DE VISTAS DE COMPATIBILIDAD COMPLETADAS EXITOSAMENTE';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE 'Estado: TODAS LAS VISTAS ESTÁN OPERATIVAS';
    RAISE NOTICE '========================================================';
END
$$;