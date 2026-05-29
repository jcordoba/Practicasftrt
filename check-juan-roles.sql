-- Verificar usuario Juan y sus roles
SELECT 
    u.id as user_id,
    u.nombre,
    u.email,
    r.nombre as rol
FROM "User" u
LEFT JOIN "UserRole" ur ON u.id = ur."userId"
LEFT JOIN "Role" r ON ur."roleId" = r.id
WHERE u.nombre ILIKE '%juan%'
ORDER BY u.nombre, r.nombre;
