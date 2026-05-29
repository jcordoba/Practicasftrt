-- Consultas específicas solicitadas por el usuario
-- Para ejecutar antes de cualquier cambio en la base de datos

-- Verificar integridad actual 
SELECT  
  'Assignments sin centro válido' as problema, 
  COUNT(*) as cantidad 
FROM "Assignment" a 
LEFT JOIN "Congregation" c ON a.centro_id = c.id 
WHERE c.id IS NULL; 

-- Verificar usuarios sin roles 
SELECT  
  'Usuarios sin roles activos' as problema,
  COUNT(*) as cantidad 
FROM "User" u 
WHERE NOT EXISTS ( 
  SELECT 1 FROM "UserRole" ur  
  WHERE ur."userId" = u.id AND ur.estado = 'ACTIVO' 
);

-- Información adicional útil
SELECT 'Total Assignments' as info, COUNT(*) as valor FROM "Assignment"
UNION ALL
SELECT 'Total Users' as info, COUNT(*) as valor FROM "User"
UNION ALL
SELECT 'Total Congregations' as info, COUNT(*) as valor FROM "Congregation"
UNION ALL
SELECT 'Total UserRoles Activos' as info, COUNT(*) as valor FROM "UserRole" WHERE estado = 'ACTIVO';