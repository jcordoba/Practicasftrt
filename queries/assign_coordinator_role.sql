-- Asignar rol COORDINADOR_PRACTICAS al usuario admin@unac.edu.co

-- Paso 1: Verificar el usuario actual y sus roles
SELECT 
    u.id,
    u.email,
    u.name,
    ur.rol as current_role
FROM "User" u
LEFT JOIN "UserRole" ur ON u.id = ur."userId"
WHERE u.email = 'admin@unac.edu.co';

-- Paso 2: Insertar el rol COORDINADOR_PRACTICAS si no existe
INSERT INTO "UserRole" ("userId", rol, "createdAt", "updatedAt")
SELECT 
    u.id,
    'COORDINADOR_PRACTICAS',
    NOW(),
    NOW()
FROM "User" u
WHERE u.email = 'admin@unac.edu.co'
AND NOT EXISTS (
    SELECT 1 FROM "UserRole" ur 
    WHERE ur."userId" = u.id 
    AND ur.rol = 'COORDINADOR_PRACTICAS'
);

-- Paso 3: Verificar que el rol se asignó correctamente
SELECT 
    u.id,
    u.email,
    u.name,
    ur.rol as role
FROM "User" u
LEFT JOIN "UserRole" ur ON u.id = ur."userId"
WHERE u.email = 'admin@unac.edu.co'
ORDER BY ur.rol;
