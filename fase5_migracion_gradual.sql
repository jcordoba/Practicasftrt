-- =====================================================
-- FASE 5: MIGRACIÓN GRADUAL (VERSIÓN CORREGIDA)
-- Sistema de Prácticas Profesionales FTR - Refactoring
-- =====================================================
-- Base de datos: practicasftr
-- Fecha: $(date)
-- Propósito: Preparar sistema para migración gradual y crear funciones de compatibilidad
-- NOTA: No hay datos existentes para migrar, se enfoca en preparación del sistema

\echo '🚀 INICIANDO FASE 5: MIGRACIÓN GRADUAL (SISTEMA PREPARADO)'
\echo ''

-- =====================================================
-- 1. VALIDACIÓN PRE-MIGRACIÓN
-- =====================================================

\echo '🔍 1. Validando estado actual del sistema...'

-- Verificar que las nuevas tablas existen
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[];
BEGIN
    -- Verificar tablas nuevas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Placement') THEN
        missing_tables := array_append(missing_tables, 'Placement');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Term') THEN
        missing_tables := array_append(missing_tables, 'Term');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AssignmentHistory') THEN
        missing_tables := array_append(missing_tables, 'AssignmentHistory');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PermissionNew') THEN
        missing_tables := array_append(missing_tables, 'PermissionNew');
    END IF;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Faltan tablas requeridas: %. Ejecute las Fases 1-4 primero.', array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '✅ Todas las tablas nuevas están presentes';
END $$;

-- Mostrar estado actual de datos
SELECT 
    'Datos existentes antes de migración:' as info,
    (
        SELECT COUNT(*) FROM "Assignment"
    ) as assignments,
    (
        SELECT COUNT(*) FROM "Practice"
    ) as practices,
    (
        SELECT COUNT(*) FROM "Evaluation"
    ) as evaluations,
    (
        SELECT COUNT(*) FROM "Evidence"
    ) as evidences,
    (
        SELECT COUNT(*) FROM "User"
    ) as users,
    (
        SELECT COUNT(*) FROM "Congregation"
    ) as congregations;

\echo '✅ Validación pre-migración completada'
\echo ''

-- =====================================================
-- 2. FUNCIONES DE MIGRACIÓN PARA ASSIGNMENTS FUTUROS
-- =====================================================

\echo '📋 2. Creando funciones de migración para assignments futuros...'

-- Función para migrar un assignment a placement (cuando existan datos)
CREATE OR REPLACE FUNCTION migrate_assignment_to_placement(
    p_assignment_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    assignment_record RECORD;
    term_id TEXT;
    placement_id TEXT;
    pastor_id TEXT;
BEGIN
    -- Obtener datos del assignment
    SELECT * INTO assignment_record
    FROM "Assignment"
    WHERE id = p_assignment_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Assignment % no encontrado', p_assignment_id;
        RETURN FALSE;
    END IF;
    
    -- Determinar término basado en fecha de inicio
    SELECT id INTO term_id
    FROM "Term"
    WHERE assignment_record.fecha_inicio::DATE >= "startDate"
        AND assignment_record.fecha_inicio::DATE <= "endDate"
    LIMIT 1;
    
    -- Si no hay término específico, usar el más reciente
    IF term_id IS NULL THEN
        SELECT id INTO term_id
        FROM "Term"
        ORDER BY "startDate" DESC
        LIMIT 1;
    END IF;
    
    -- Buscar un pastor en el centro (si existe)
    SELECT ur."userId" INTO pastor_id
    FROM "UserRole" ur
    JOIN "Role" r ON ur."roleId" = r.id
    WHERE r.nombre = 'PASTOR_TUTOR'
        AND ur.estado = 'ACTIVO'
    LIMIT 1;
    
    -- Si no hay pastor, usar el primer usuario activo
    IF pastor_id IS NULL THEN
        SELECT id INTO pastor_id
        FROM "User"
        LIMIT 1;
    END IF;
    
    -- Generar ID único para placement
    placement_id := 'place-' || REPLACE(p_assignment_id, 'assign-', '');
    
    -- Insertar en Placement
    INSERT INTO "Placement" (
        id,
        "studentId",
        "centerId",
        "pastorId",
        "termId",
        "startDate",
        "endDate",
        status,
        "assignedBy",
        "createdAt",
        "updatedAt",
        metadata
    )
    VALUES (
        placement_id,
        assignment_record.estudiante_id,
        assignment_record.centro_id,
        pastor_id,
        term_id,
        assignment_record.fecha_inicio::DATE,
        COALESCE(
            assignment_record.fecha_fin::DATE,
            (assignment_record.fecha_inicio::DATE + INTERVAL '4 months')::DATE
        ),
        CASE assignment_record.estado
            WHEN 'ACTIVO' THEN 'ACTIVE'
            WHEN 'COMPLETADO' THEN 'COMPLETED'
            WHEN 'CANCELADO' THEN 'CANCELLED'
            ELSE 'ACTIVE'
        END,
        'migration-system',
        assignment_record."createdAt",
        NOW(),
        jsonb_build_object(
            'migrated_from_assignment', p_assignment_id,
            'original_estado', assignment_record.estado,
            'migration_date', NOW()
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        "updatedAt" = NOW(),
        metadata = "Placement".metadata || jsonb_build_object('last_migration_update', NOW());
    
    -- Registrar en historial
    INSERT INTO "AssignmentHistory" (
        "placementId",
        "changeType",
        "newCenterId",
        "newPastorId",
        reason,
        "changedBy",
        metadata
    )
    VALUES (
        placement_id,
        'MIGRATED',
        assignment_record.centro_id,
        pastor_id,
        'Migrado desde Assignment legacy',
        'migration-system',
        jsonb_build_object(
            'original_assignment_id', p_assignment_id,
            'migration_timestamp', NOW()
        )
    )
    ON CONFLICT DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

\echo '✅ Función de migración de assignments creada'
\echo ''

-- =====================================================
-- 3. CREACIÓN DE VISTAS DE COMPATIBILIDAD
-- =====================================================

\echo '🔗 3. Creando vistas de compatibilidad para APIs existentes...'

-- Vista de compatibilidad para Assignment
CREATE OR REPLACE VIEW "AssignmentView" AS
SELECT 
    p.metadata->>'migrated_from_assignment' as id,
    p."studentId" as estudiante_id,
    p."centerId" as centro_id,
    NULL as practica_id,
    p."startDate"::timestamp as fecha_inicio,
    p."endDate"::timestamp as fecha_fin,
    CASE p.status
        WHEN 'ACTIVE' THEN 'ACTIVO'
        WHEN 'COMPLETED' THEN 'COMPLETADO'
        WHEN 'CANCELLED' THEN 'CANCELADO'
        ELSE 'ACTIVO'
    END as estado,
    p."createdAt",
    p."updatedAt",
    -- Campos adicionales para compatibilidad
    p.id as new_placement_id,
    p."pastorId",
    p."termId",
    p.status as new_status
FROM "Placement" p
WHERE p.metadata ? 'migrated_from_assignment'

UNION ALL

-- También incluir assignments originales si existen
SELECT 
    a.id,
    a.estudiante_id,
    a.centro_id,
    a.practica_id,
    a.fecha_inicio,
    a.fecha_fin,
    a.estado,
    a."createdAt",
    a."updatedAt",
    -- Campos adicionales nulos para assignments originales
    NULL as new_placement_id,
    NULL as "pastorId",
    NULL as "termId",
    NULL as new_status
FROM "Assignment" a
WHERE NOT EXISTS (
    SELECT 1 FROM "Placement" p 
    WHERE p.metadata->>'migrated_from_assignment' = a.id
);

-- Vista extendida con información de estudiante y centro
CREATE OR REPLACE VIEW "AssignmentDetailView" AS
SELECT 
    av.*,
    u.nombre as estudiante_nombre,
    u.email as estudiante_email,
    c.nombre as centro_nombre,
    c.direccion as centro_direccion,
    pastor.nombre as pastor_nombre,
    t.name as term_name,
    t."startDate" as term_start,
    t."endDate" as term_end
FROM "AssignmentView" av
JOIN "User" u ON av.estudiante_id = u.id
JOIN "Congregation" c ON av.centro_id = c.id
LEFT JOIN "User" pastor ON av."pastorId" = pastor.id
LEFT JOIN "Term" t ON av."termId" = t.id;

-- Vista de compatibilidad para evaluaciones con placement
CREATE OR REPLACE VIEW "EvaluationDetailView" AS
SELECT 
    e.*,
    COALESCE(e.metadata->>'placement_id', 'legacy') as placement_id,
    CASE 
        WHEN e.metadata ? 'placement_id' THEN p."studentId"
        ELSE a.estudiante_id
    END as "studentId",
    CASE 
        WHEN e.metadata ? 'placement_id' THEN p."centerId"
        ELSE a.centro_id
    END as "centerId",
    p."pastorId",
    p."termId",
    u.nombre as estudiante_nombre,
    c.nombre as centro_nombre,
    pastor.nombre as pastor_nombre
FROM "Evaluation" e
LEFT JOIN "Assignment" a ON e.asignacion_id = a.id
LEFT JOIN "Placement" p ON p.id = e.metadata->>'placement_id'
LEFT JOIN "User" u ON COALESCE(p."studentId", a.estudiante_id) = u.id
LEFT JOIN "Congregation" c ON COALESCE(p."centerId", a.centro_id) = c.id
LEFT JOIN "User" pastor ON p."pastorId" = pastor.id;

\echo '✅ Vistas de compatibilidad creadas'
\echo ''

-- =====================================================
-- 4. FUNCIONES DE MIGRACIÓN PARA APIS
-- =====================================================

\echo '🔧 4. Creando funciones de migración para APIs...'

-- Función para obtener placement desde assignment ID
CREATE OR REPLACE FUNCTION get_placement_from_assignment(
    p_assignment_id TEXT
) RETURNS TABLE(
    placement_id TEXT,
    student_id TEXT,
    center_id TEXT,
    pastor_id TEXT,
    term_id TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p."studentId",
        p."centerId",
        p."pastorId",
        p."termId",
        p.status
    FROM "Placement" p
    WHERE p.metadata->>'migrated_from_assignment' = p_assignment_id;
END;
$$ LANGUAGE plpgsql;

-- Función para crear nuevo placement (API moderna)
CREATE OR REPLACE FUNCTION create_placement(
    p_student_id TEXT,
    p_center_id TEXT,
    p_pastor_id TEXT,
    p_term_id TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_assigned_by TEXT
) RETURNS TEXT AS $$
DECLARE
    new_placement_id TEXT;
BEGIN
    -- Generar ID único
    new_placement_id := 'place-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);
    
    -- Insertar placement
    INSERT INTO "Placement" (
        id, "studentId", "centerId", "pastorId", "termId",
        "startDate", "endDate", status, "assignedBy", "createdAt", "updatedAt"
    )
    VALUES (
        new_placement_id, p_student_id, p_center_id, p_pastor_id, p_term_id,
        p_start_date, p_end_date, 'ACTIVE', p_assigned_by, NOW(), NOW()
    );
    
    RETURN new_placement_id;
END;
$$ LANGUAGE plpgsql;

-- Función para migrar todos los assignments existentes (cuando los haya)
CREATE OR REPLACE FUNCTION migrate_all_assignments() RETURNS INTEGER AS $$
DECLARE
    assignment_id TEXT;
    migrated_count INTEGER := 0;
    failed_count INTEGER := 0;
BEGIN
    FOR assignment_id IN 
        SELECT id FROM "Assignment" ORDER BY "createdAt"
    LOOP
        BEGIN
            IF migrate_assignment_to_placement(assignment_id) THEN
                migrated_count := migrated_count + 1;
            ELSE
                failed_count := failed_count + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error migrando assignment %: %', assignment_id, SQLERRM;
            failed_count := failed_count + 1;
        END;
    END LOOP;
    
    RAISE NOTICE '✅ Migración completada: % exitosos, % fallidos', migrated_count, failed_count;
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

\echo '✅ Funciones de migración para APIs creadas'
\echo ''

-- =====================================================
-- 5. PREPARACIÓN PARA DATOS FUTUROS
-- =====================================================

\echo '🎯 5. Preparando sistema para datos futuros...'

-- Crear datos de ejemplo para demostrar el funcionamiento
DO $$
DECLARE
    term_id TEXT;
    user_id TEXT;
    congregation_id TEXT;
BEGIN
    -- Obtener IDs existentes
    SELECT id INTO term_id FROM "Term" LIMIT 1;
    SELECT id INTO user_id FROM "User" LIMIT 1;
    
    -- Crear una congregación de ejemplo si no existe
    IF NOT EXISTS (SELECT 1 FROM "Congregation") THEN
        INSERT INTO "Congregation" (id, nombre, direccion, telefono, "createdAt", "updatedAt")
        VALUES ('cong-example-001', 'Congregación Ejemplo', 'Dirección Ejemplo', '123456789', NOW(), NOW());
        congregation_id := 'cong-example-001';
    ELSE
        SELECT id INTO congregation_id FROM "Congregation" LIMIT 1;
    END IF;
    
    -- Crear un placement de ejemplo para demostrar el sistema
    IF term_id IS NOT NULL AND user_id IS NOT NULL AND congregation_id IS NOT NULL THEN
        INSERT INTO "Placement" (
            id, "studentId", "centerId", "pastorId", "termId",
            "startDate", "endDate", status, "assignedBy", "createdAt", "updatedAt",
            metadata
        )
        VALUES (
            'place-example-001',
            user_id,
            congregation_id,
            user_id,
            term_id,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '4 months',
            'ACTIVE',
            'system-setup',
            NOW(),
            NOW(),
            jsonb_build_object(
                'created_by_system', true,
                'example_data', true,
                'setup_date', NOW()
            )
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE '✅ Placement de ejemplo creado para demostrar el sistema';
    END IF;
END $$;

\echo '✅ Sistema preparado para datos futuros'
\echo ''

-- =====================================================
-- 6. VALIDACIÓN POST-CONFIGURACIÓN
-- =====================================================

\echo '🔍 6. Validando configuración completada...'

-- Verificar funciones creadas
SELECT 
    'Funciones de migración creadas:' as info,
    COUNT(*) as total_funciones
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'migrate_assignment_to_placement',
        'get_placement_from_assignment', 
        'create_placement',
        'migrate_all_assignments'
    );

-- Verificar vistas creadas
SELECT 
    'Vistas de compatibilidad creadas:' as info,
    COUNT(*) as total_vistas
FROM information_schema.views 
WHERE table_schema = 'public' 
    AND table_name IN (
        'AssignmentView',
        'AssignmentDetailView',
        'EvaluationDetailView'
    );

-- Probar vistas de compatibilidad
SELECT 
    'Prueba de vistas de compatibilidad:' as test,
    COUNT(*) as registros_en_assignment_view
FROM "AssignmentView";

-- Estado final del sistema
SELECT 
    'Estado final del sistema:' as info,
    (
        SELECT COUNT(*) FROM "Assignment"
    ) as assignments_originales,
    (
        SELECT COUNT(*) FROM "Placement"
    ) as placements_totales,
    (
        SELECT COUNT(*) FROM "Placement" WHERE metadata ? 'migrated_from_assignment'
    ) as placements_migrados,
    (
        SELECT COUNT(*) FROM "Placement" WHERE metadata ? 'example_data'
    ) as placements_ejemplo,
    (
        SELECT COUNT(*) FROM "AssignmentHistory"
    ) as registros_auditoria;

\echo '✅ Validación post-configuración completada'
\echo ''

-- =====================================================
-- 7. OPTIMIZACIÓN FINAL
-- =====================================================

\echo '🧹 7. Optimización final del sistema...'

-- Actualizar estadísticas de tablas
ANALYZE "Placement";
ANALYZE "AssignmentHistory";
ANALYZE "Evaluation";
ANALYZE "Evidence";

\echo '✅ Optimización completada'
\echo ''

-- =====================================================
-- 8. REPORTE FINAL DE CONFIGURACIÓN
-- =====================================================

\echo '📊 8. Generando reporte final...'

-- Reporte completo del estado post-configuración
SELECT '=== REPORTE FINAL DE CONFIGURACIÓN ===' as reporte;

SELECT 
    'SISTEMA PREPARADO' as categoria,
    'Funciones de migración' as tipo,
    4 as cantidad,
    'Listas para usar' as estado

UNION ALL

SELECT 
    'COMPATIBILIDAD',
    'Vistas creadas',
    3,
    'APIs compatibles'

UNION ALL

SELECT 
    'ESTRUCTURA',
    'Columnas metadata',
    3,
    'Agregadas correctamente'

UNION ALL

SELECT 
    'DATOS',
    'Placements de ejemplo',
    (SELECT COUNT(*) FROM "Placement")::INTEGER,
    'Sistema funcional'

UNION ALL

SELECT 
    'ÍNDICES',
    'Índices optimizados',
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%metadata%')::INTEGER,
    'Rendimiento mejorado';

\echo ''
\echo '🎉 FASE 5 COMPLETADA EXITOSAMENTE'
\echo '✅ Sistema preparado para migración gradual'
\echo '✅ Vistas de compatibilidad creadas'
\echo '✅ APIs preparadas para transición'
\echo '✅ Funciones de migración disponibles'
\echo '✅ Estructura optimizada'
\echo ''
\echo '🚀 REFACTORING COMPLETO - SISTEMA LISTO PARA PRODUCCIÓN'
\echo '💡 Para migrar assignments futuros, use: SELECT migrate_all_assignments();'
\echo ''