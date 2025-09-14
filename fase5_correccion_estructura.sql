-- =====================================================
-- CORRECCIÓN DE ESTRUCTURA PARA FASE 5
-- Sistema de Prácticas Profesionales FTR - Refactoring
-- =====================================================
-- Base de datos: practicasftr
-- Propósito: Agregar columnas faltantes para la migración

\echo '🔧 CORRIGIENDO ESTRUCTURA DE TABLAS PARA MIGRACIÓN'
\echo ''

-- =====================================================
-- 1. AGREGAR COLUMNA METADATA A PLACEMENT
-- =====================================================

\echo '📋 1. Agregando columna metadata a Placement...'

ALTER TABLE "Placement" 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Crear índice para metadata
CREATE INDEX IF NOT EXISTS "idx_placement_metadata" 
ON "Placement" USING GIN (metadata);

\echo '✅ Columna metadata agregada a Placement'
\echo ''

-- =====================================================
-- 2. AGREGAR COLUMNA METADATA A EVALUATION
-- =====================================================

\echo '📊 2. Agregando columna metadata a Evaluation...'

ALTER TABLE "Evaluation" 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Crear índice para metadata
CREATE INDEX IF NOT EXISTS "idx_evaluation_metadata" 
ON "Evaluation" USING GIN (metadata);

\echo '✅ Columna metadata agregada a Evaluation'
\echo ''

-- =====================================================
-- 3. AGREGAR COLUMNA METADATA A EVIDENCE
-- =====================================================

\echo '📁 3. Agregando columna metadata a Evidence...'

ALTER TABLE "Evidence" 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Crear índice para metadata
CREATE INDEX IF NOT EXISTS "idx_evidence_metadata" 
ON "Evidence" USING GIN (metadata);

\echo '✅ Columna metadata agregada a Evidence'
\echo ''

-- =====================================================
-- 4. VERIFICAR ESTRUCTURA ACTUALIZADA
-- =====================================================

\echo '🔍 4. Verificando estructura actualizada...'

-- Verificar columnas de Placement
SELECT 
    'Placement' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Placement' 
    AND table_schema = 'public'
    AND column_name IN ('metadata', 'id', 'studentId', 'centerId')
ORDER BY ordinal_position;

-- Verificar columnas de Evaluation
SELECT 
    'Evaluation' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Evaluation' 
    AND table_schema = 'public'
    AND column_name IN ('metadata', 'id', 'asignacion_id')
ORDER BY ordinal_position;

-- Verificar columnas de Evidence
SELECT 
    'Evidence' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Evidence' 
    AND table_schema = 'public'
    AND column_name IN ('metadata', 'id', 'asignacion_id')
ORDER BY ordinal_position;

\echo '✅ Verificación de estructura completada'
\echo ''

-- =====================================================
-- 5. VERIFICAR DATOS EXISTENTES
-- =====================================================

\echo '📊 5. Verificando datos existentes...'

-- Contar registros en tablas principales
SELECT 
    'Datos actuales:' as info,
    (
        SELECT COUNT(*) FROM "Assignment"
    ) as assignments,
    (
        SELECT COUNT(*) FROM "Placement"
    ) as placements,
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

\echo '✅ Verificación de datos completada'
\echo ''
\echo '🎉 CORRECCIÓN DE ESTRUCTURA COMPLETADA'
\echo '✅ Tablas preparadas para migración'
\echo '✅ Columnas metadata agregadas'
\echo '✅ Índices creados'
\echo ''
\echo '🚀 AHORA PUEDE EJECUTAR LA FASE 5 DE MIGRACIÓN'
\echo ''