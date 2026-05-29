SELECT u.id, u.email, r.nombre 
FROM "User" u 
LEFT JOIN "UserRole" ur ON u.id = ur."userId" 
LEFT JOIN "Role" r ON ur."roleId" = r.id 
WHERE r.nombre = 'ESTUDIANTE' 
LIMIT 5;
