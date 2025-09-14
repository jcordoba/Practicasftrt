-- Script de validación pre-refactoring corregido
-- Basado en el esquema real de la base de datos

\echo '=== VALIDACIÓN PRE-REFACTORING ==='
\echo 'Identificando datos que necesitan limpieza antes de los cambios'
\echo ''

-- 1. VERIFICAR INTEGRIDAD DE ASSIGNMENTS
\echo '1. Verificando integridad de Assignments...'

-- Assignments sin centro válido
SELECT 
  'Assignments sin centro válido' as problema,
  COUNT(*) as cantidad
FROM "Assignment" a
LEFT JOIN "Congregation" c ON a.centro_id = c.id
WHERE c.id IS NULL;

-- Assignments sin estudiante válido
SELECT 
  'Assignments sin estudiante válido' as problema,
  COUNT(*) as cantidad
FROM "Assignment" a
LEFT JOIN "Estudiante" e ON a.estudiante_id = e.id
WHERE e.id IS NULL;

-- Assignments sin práctica válida
SELECT 
  'Assignments sin práctica válida' as problema,
  COUNT(*) as cantidad
FROM "Assignment" a
LEFT JOIN "Practice" p ON a.practica_id = p.id
WHERE p.id IS NULL;

\echo ''
\echo '2. Verificando integridad de Users y Roles...'

-- Usuarios sin roles activos
SELECT 
  'Usuarios sin roles activos' as problema,
  COUNT(*) as cantidad
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "UserRole" ur 
  WHERE ur."userId" = u.id AND ur.estado = 'ACTIVO'
);

-- Roles sin permisos asignados
SELECT 
  'Roles sin permisos asignados' as problema,
  COUNT(*) as cantidad
FROM "Role" r
WHERE NOT EXISTS (
  SELECT 1 FROM "RolePermission" rp 
  WHERE rp."roleId" = r.id
);

-- UserRoles con referencias inválidas
SELECT 
  'UserRoles con usuario inválido' as problema,
  COUNT(*) as cantidad
FROM "UserRole" ur
LEFT JOIN "User" u ON ur."userId" = u.id
WHERE u.id IS NULL;

SELECT 
  'UserRoles con rol inválido' as problema,
  COUNT(*) as cantidad
FROM "UserRole" ur
LEFT JOIN "Role" r ON ur."roleId" = r.id
WHERE r.id IS NULL;

\echo ''
\echo '3. Verificando integridad de Practices...'

-- Practices con estudiante inválido
SELECT 
  'Practices con estudiante inválido' as problema,
  COUNT(*) as cantidad
FROM "Practice" p
LEFT JOIN "Estudiante" e ON p."studentId" = e.id
WHERE e.id IS NULL;

-- Practices con tutor inválido
SELECT 
  'Practices con tutor inválido' as problema,
  COUNT(*) as cantidad
FROM "Practice" p
LEFT JOIN "User" u ON p."tutorId" = u.id
WHERE u.id IS NULL;

-- Practices con teacher inválido
SELECT 
  'Practices con teacher inválido' as problema,
  COUNT(*) as cantidad
FROM "Practice" p
LEFT JOIN "Docente" d ON p."teacherId" = d.id
WHERE d.id IS NULL;

\echo ''
\echo '4. Verificando integridad de Evaluations...'

-- Evaluations con asignación inválida
SELECT 
  'Evaluations con asignación inválida' as problema,
  COUNT(*) as cantidad
FROM "Evaluation" ev
LEFT JOIN "Assignment" a ON ev.asignacion_id = a.id
WHERE a.id IS NULL;

\echo ''
\echo '5. Verificando integridad de Evidences...'

-- Evidences con asignación inválida
SELECT 
  'Evidences con asignación inválida' as problema,
  COUNT(*) as cantidad
FROM "Evidence" ev
LEFT JOIN "Assignment" a ON ev.asignacion_id = a.id
WHERE a.id IS NULL;

\echo ''
\echo '6. VERIFICANDO REGLAS DE NEGOCIO CRÍTICAS...'

-- Estudiantes con múltiples assignments en diferentes centros (CRÍTICO)
SELECT 
  'Estudiantes con assignments en diferentes centros' as problema_critico,
  COUNT(DISTINCT estudiante_id) as estudiantes_afectados
FROM (
  SELECT 
    estudiante_id,
    COUNT(DISTINCT centro_id) as centros_diferentes
  FROM "Assignment" 
  WHERE estado = 'ACTIVO'
  GROUP BY estudiante_id
  HAVING COUNT(DISTINCT centro_id) > 1
) subq;

\echo ''
\echo '7. ESTADÍSTICAS GENERALES DEL SISTEMA...'

-- Conteos generales
SELECT 'Total Users' as tabla, COUNT(*) as registros FROM "User"
UNION ALL
SELECT 'Total Assignments' as tabla, COUNT(*) as registros FROM "Assignment"
UNION ALL
SELECT 'Total Practices' as tabla, COUNT(*) as registros FROM "Practice"
UNION ALL
SELECT 'Total Evaluations' as tabla, COUNT(*) as registros FROM "Evaluation"
UNION ALL
SELECT 'Total Evidences' as tabla, COUNT(*) as registros FROM "Evidence"
UNION ALL
SELECT 'Total Congregations' as tabla, COUNT(*) as registros FROM "Congregation"
UNION ALL
SELECT 'Total Roles' as tabla, COUNT(*) as registros FROM "Role"
UNION ALL
SELECT 'Total UserRoles' as tabla, COUNT(*) as registros FROM "UserRole";

\echo ''
\echo '=== FIN DE VALIDACIÓN ==='
\echo 'Revise los resultados antes de proceder con el refactoring.'
\echo 'Cualquier problema identificado debe ser corregido primero.'