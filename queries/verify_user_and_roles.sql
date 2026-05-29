-- Verify the user and their roles
SELECT 
    u.email, 
    u.nombre as user_name,
    r.nombre as role_name,
    r.descripcion as role_description
FROM "User" u 
JOIN "UserRole" ur ON u.id = ur."userId" 
JOIN "Role" r ON ur."roleId" = r.id 
WHERE u.email = 'admin@unac.edu.co';