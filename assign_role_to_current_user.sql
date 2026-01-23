-- Script para asignar el rol COORDINADOR_PRACTICAS a tu usuario actual
-- IMPORTANTE: Reemplaza 'TU_EMAIL_AQUI' con el email del usuario que estás usando para crear prácticas

-- Paso 1: Verificar tu usuario actual
SELECT 
    u.id as user_id,
    u.email, 
    u.nombre,
    u.estado
FROM "User" u 
WHERE u.email = 'TU_EMAIL_AQUI';  -- CAMBIA ESTO POR TU EMAIL

-- Paso 2: Verificar si ya tienes roles asignados
SELECT 
    u.email, 
    r.nombre as rol_actual
FROM "User" u 
LEFT JOIN "UserRole" ur ON u.id = ur."userId" 
LEFT JOIN "Role" r ON ur."roleId" = r.id 
WHERE u.email = 'TU_EMAIL_AQUI';  -- CAMBIA ESTO POR TU EMAIL

-- Paso 3: Obtener el ID del rol COORDINADOR_PRACTICAS
SELECT id as role_id, nombre, descripcion 
FROM "Role" 
WHERE nombre = 'COORDINADOR_PRACTICAS';

-- Paso 4: Asignar el rol COORDINADOR_PRACTICAS (ejecuta esto solo si no lo tienes)
-- DESCOMENTA LAS SIGUIENTES LÍNEAS Y EJECUTA:

/*
INSERT INTO "UserRole" ("userId", "roleId", estado, fecha_creacion, fecha_actualizacion, fecha_asignacion)
SELECT 
    u.id,
    r.id,
    'ACTIVO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
CROSS JOIN "Role" r
WHERE u.email = 'TU_EMAIL_AQUI'  -- CAMBIA ESTO POR TU EMAIL
AND r.nombre = 'COORDINADOR_PRACTICAS'
AND NOT EXISTS (
    SELECT 1 FROM "UserRole" ur2 
    WHERE ur2."userId" = u.id 
    AND ur2."roleId" = r.id
);
*/

-- Paso 5: Verificar que el rol fue asignado correctamente
SELECT 
    u.email, 
    u.nombre,
    r.nombre as rol_asignado,
    ur.estado as rol_estado,
    ur.fecha_asignacion
FROM "User" u 
JOIN "UserRole" ur ON u.id = ur."userId" 
JOIN "Role" r ON ur."roleId" = r.id 
WHERE u.email = 'TU_EMAIL_AQUI';  -- CAMBIA ESTO POR TU EMAIL
