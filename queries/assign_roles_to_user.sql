-- Assign roles to the admin user
INSERT INTO "UserRole" (id, "userId", "roleId", estado, fecha_asignacion, fecha_creacion, fecha_actualizacion) VALUES 
('user_role_admin_tecnico', 'user_admin_unac', 'role_administrador_tecnico', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user_role_coordinador', 'user_admin_unac', 'role_coordinador_practicas', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;