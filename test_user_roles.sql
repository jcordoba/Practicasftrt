SELECT r.id, r.nombre as role_name, ur."userId" 
FROM "Role" r 
JOIN "UserRole" ur ON r.id = ur."roleId" 
WHERE ur."userId" = 'user_admin_unac';