-- Insertar los roles necesarios
INSERT INTO "Role" (id, nombre, descripcion, estado, fecha_creacion, fecha_actualizacion) VALUES 
('COORDINADOR_PRACTICAS', 'COORDINADOR_PRACTICAS', 'Coordinador de Prácticas', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ADMINISTRADOR_TECNICO', 'ADMINISTRADOR_TECNICO', 'Administrador Técnico', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ESTUDIANTE', 'ESTUDIANTE', 'Estudiante', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DOCENTE', 'DOCENTE', 'Docente', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PASTOR', 'PASTOR', 'Pastor', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Asignar rol de COORDINADOR_PRACTICAS al usuario admin
INSERT INTO "UserRole" (id, "userId", "roleId", estado, fecha_asignacion, fecha_creacion, fecha_actualizacion) VALUES 
('admin_coord_role', 'admin_001', 'COORDINADOR_PRACTICAS', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Verificar que se crearon correctamente
SELECT * FROM "Role";
SELECT * FROM "UserRole";
SELECT u.email, u.nombre, r.nombre as role_name FROM "User" u JOIN "UserRole" ur ON u.id = ur."userId" JOIN "Role" r ON ur."roleId" = r.id WHERE u.email = 'admin@sion.com';