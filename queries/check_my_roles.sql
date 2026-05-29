-- Verificar todos los usuarios y sus roles
SELECT 
    u.email, 
    u.nombre, 
    r.nombre as rol_nombre,
    r.descripcion as rol_descripcion,
    ur.estado as rol_estado
FROM "User" u 
LEFT JOIN "UserRole" ur ON u.id = ur."userId" 
LEFT JOIN "Role" r ON ur."roleId" = r.id 
ORDER BY u.email, r.nombre;

-- Ver roles disponibles
SELECT * FROM "Role" ORDER BY nombre;

-- Roles requeridos para crear prácticas
SELECT '⚠️ Para crear prácticas, necesitas uno de estos roles:' as mensaje;
SELECT nombre, descripcion FROM "Role" 
WHERE nombre IN ('COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO');
