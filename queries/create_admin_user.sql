-- Create the admin user with hashed password
-- Password: admin123 (hashed using bcrypt)
INSERT INTO "User" (id, email, password, nombre, estado, fecha_creacion, fecha_actualizacion) VALUES 
('user_admin_unac', 'admin@unac.edu.co', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'Administrador UNAC', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;