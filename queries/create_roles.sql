-- Create the required roles
INSERT INTO "Role" (id, nombre, descripcion, estado, fecha_creacion, fecha_actualizacion) VALUES 
('role_estudiante', 'ESTUDIANTE', 'Estudiante de la universidad', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_pastor_tutor', 'PASTOR_TUTOR', 'Pastor tutor', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_docente', 'DOCENTE', 'Docente', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_coordinador_practicas', 'COORDINADOR_PRACTICAS', 'Coordinador de prácticas', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_decano', 'DECANO', 'Decano', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_administrador_tecnico', 'ADMINISTRADOR_TECNICO', 'Administrador técnico', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;