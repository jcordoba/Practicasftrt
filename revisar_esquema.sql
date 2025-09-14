-- Script para revisar el esquema actual de la base de datos

\echo 'Revisando estructura de tablas principales...'
\echo ''

\echo '=== TABLA Assignment ==='
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Assignment' AND table_schema = 'public'
ORDER BY ordinal_position;

\echo ''
\echo '=== TABLA User ==='
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' AND table_schema = 'public'
ORDER BY ordinal_position;

\echo ''
\echo '=== TABLA Evaluation ==='
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Evaluation' AND table_schema = 'public'
ORDER BY ordinal_position;

\echo ''
\echo '=== TABLA Evidence ==='
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Evidence' AND table_schema = 'public'
ORDER BY ordinal_position;

\echo ''
\echo '=== TABLA Congregation (Centro) ==='
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Congregation' AND table_schema = 'public'
ORDER BY ordinal_position;

\echo ''
\echo '=== TABLA Practice ==='
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Practice' AND table_schema = 'public'
ORDER BY ordinal_position;