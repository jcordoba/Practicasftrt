-- Script para verificar y actualizar roles de usuario

-- 1. Ver todos los usuarios y sus roles
SELECT 
    u.id,
    u.email,
    u.name,
    ur.rol as role
FROM "User" u
LEFT JOIN "UserRole" ur ON u.id = ur."userId"
ORDER BY u.email;

-- 2. Ver todos los roles disponibles
SELECT DISTINCT rol FROM "UserRole";

-- 3. OPCIONAL: Actualizar rol de un usuario específico
-- Reemplaza 'tu-email@ejemplo.com' con tu email real
-- Descomenta las siguientes líneas y ejecuta si necesitas agregar el rol

/*
-- Primero, obtén el ID de tu usuario
-- Luego inserta el rol COORDINADOR_PRACTICAS

INSERT INTO "UserRole" ("userId", rol, "createdAt", "updatedAt")
SELECT 
    u.id,
    'COORDINADOR_PRACTICAS',
    NOW(),
    NOW()
FROM "User" u
WHERE u.email = 'tu-email@ejemplo.com'
AND NOT EXISTS (
    SELECT 1 FROM "UserRole" ur 
    WHERE ur."userId" = u.id 
    AND ur.rol = 'COORDINADOR_PRACTICAS'
);
*/

-- 4. ALTERNATIVA: Actualizar el rol existente de un usuario
/*
UPDATE "UserRole"
SET rol = 'COORDINADOR_PRACTICAS',
    "updatedAt" = NOW()
WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'tu-email@ejemplo.com'
);
*/
