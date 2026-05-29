-- Verificar el usuario admin y su contraseña hasheada
SELECT id, email, nombre, password, estado FROM "User" WHERE email = 'admin@sion.com';

-- Verificar si hay otros usuarios
SELECT id, email, nombre, estado FROM "User" LIMIT 5;