-- =====================================================
-- FASE 2: POBLACIÓN INICIAL Y CONFIGURACIÓN RBAC
-- Sistema de Prácticas Profesionales FTR - Refactoring
-- =====================================================
-- Base de datos: practicasftr
-- Fecha: $(date)
-- Propósito: Poblar nuevas tablas con datos iniciales y configurar RBAC
-- SEGURO: Solo inserta datos, no modifica estructura existentes

\echo '🔄 INICIANDO FASE 2: POBLACIÓN INICIAL'
\echo ''

-- =====================================================
-- 1. CREAR TÉRMINOS ACADÉMICOS BÁSICOS
-- =====================================================

\echo '📅 1. Creando términos académicos básicos...'

-- Insertar términos para 2024 y 2025
INSERT INTO "Term" (id, name, "startDate", "endDate", "academicYear", period, status)
VALUES 
    ('term-2024-1', '2024 - Primer Semestre', '2024-01-15 00:00:00', '2024-06-30 23:59:59', 2024, 1, 'COMPLETED'),
    ('term-2024-2', '2024 - Segundo Semestre', '2024-07-15 00:00:00', '2024-12-15 23:59:59', 2024, 2, 'COMPLETED'),
    ('term-2025-1', '2025 - Primer Semestre', '2025-01-15 00:00:00', '2025-06-30 23:59:59', 2025, 1, 'ACTIVE'),
    ('term-2025-2', '2025 - Segundo Semestre', '2025-07-15 00:00:00', '2025-12-15 23:59:59', 2025, 2, 'PLANNED')
ON CONFLICT ("academicYear", period) DO NOTHING;

\echo '✅ Términos académicos creados'
\echo ''

-- =====================================================
-- 2. CREAR PERMISOS GRANULARES
-- =====================================================

\echo '🔐 2. Creando permisos granulares...'

-- Permisos por módulo
INSERT INTO "PermissionNew" (name, description, module, action, resource)
VALUES 
    -- MÓDULO USUARIOS
    ('users.create', 'Crear nuevos usuarios', 'USERS', 'CREATE', 'user'),
    ('users.read', 'Ver información de usuarios', 'USERS', 'READ', 'user'),
    ('users.update', 'Actualizar información de usuarios', 'USERS', 'UPDATE', 'user'),
    ('users.delete', 'Eliminar usuarios', 'USERS', 'DELETE', 'user'),
    ('users.manage_roles', 'Gestionar roles de usuarios', 'USERS', 'MANAGE', 'user_roles'),
    
    -- MÓDULO CENTROS
    ('centers.create', 'Crear nuevos centros', 'CENTERS', 'CREATE', 'center'),
    ('centers.read', 'Ver información de centros', 'CENTERS', 'READ', 'center'),
    ('centers.update', 'Actualizar información de centros', 'CENTERS', 'UPDATE', 'center'),
    ('centers.delete', 'Eliminar centros', 'CENTERS', 'DELETE', 'center'),
    
    -- MÓDULO PRÁCTICAS
    ('practices.create', 'Crear nuevas prácticas', 'PRACTICES', 'CREATE', 'practice'),
    ('practices.read', 'Ver información de prácticas', 'PRACTICES', 'READ', 'practice'),
    ('practices.update', 'Actualizar información de prácticas', 'PRACTICES', 'UPDATE', 'practice'),
    ('practices.delete', 'Eliminar prácticas', 'PRACTICES', 'DELETE', 'practice'),
    ('practices.assign', 'Asignar estudiantes a centros', 'PRACTICES', 'ASSIGN', 'assignment'),
    ('practices.transfer', 'Transferir estudiantes entre centros', 'PRACTICES', 'TRANSFER', 'assignment'),
    
    -- MÓDULO EVALUACIONES
    ('evaluations.create', 'Crear evaluaciones', 'EVALUATIONS', 'CREATE', 'evaluation'),
    ('evaluations.read', 'Ver evaluaciones', 'EVALUATIONS', 'READ', 'evaluation'),
    ('evaluations.update', 'Actualizar evaluaciones', 'EVALUATIONS', 'UPDATE', 'evaluation'),
    ('evaluations.approve', 'Aprobar evaluaciones', 'EVALUATIONS', 'APPROVE', 'evaluation'),
    
    -- MÓDULO EVIDENCIAS
    ('evidences.create', 'Subir evidencias', 'EVIDENCES', 'CREATE', 'evidence'),
    ('evidences.read', 'Ver evidencias', 'EVIDENCES', 'READ', 'evidence'),
    ('evidences.update', 'Actualizar evidencias', 'EVIDENCES', 'UPDATE', 'evidence'),
    ('evidences.approve', 'Aprobar evidencias', 'EVIDENCES', 'APPROVE', 'evidence'),
    
    -- MÓDULO REPORTES
    ('reports.generate', 'Generar reportes', 'REPORTS', 'GENERATE', 'report'),
    ('reports.export', 'Exportar reportes', 'REPORTS', 'EXPORT', 'report'),
    
    -- MÓDULO CONFIGURACIÓN
    ('config.read', 'Ver configuración del sistema', 'CONFIG', 'READ', 'config'),
    ('config.update', 'Actualizar configuración del sistema', 'CONFIG', 'UPDATE', 'config'),
    
    -- MÓDULO AUDITORÍA
    ('audit.read', 'Ver logs de auditoría', 'AUDIT', 'READ', 'audit_log'),
    ('audit.export', 'Exportar logs de auditoría', 'AUDIT', 'EXPORT', 'audit_log')
ON CONFLICT (name) DO NOTHING;

\echo '✅ Permisos granulares creados'
\echo ''

-- =====================================================
-- 3. ASIGNAR PERMISOS A ROLES EXISTENTES
-- =====================================================

\echo '👥 3. Asignando permisos a roles existentes...'

-- Obtener el ID del usuario administrador para las asignaciones
DO $$
DECLARE
    admin_user_id TEXT;
    student_role_id TEXT;
    pastor_role_id TEXT;
    teacher_role_id TEXT;
    coordinator_role_id TEXT;
    dean_role_id TEXT;
    admin_role_id TEXT;
BEGIN
    -- Obtener usuario administrador
    SELECT id INTO admin_user_id FROM "User" WHERE email LIKE '%admin%' OR id = (SELECT MIN(id) FROM "User") LIMIT 1;
    
    -- Si no hay usuario admin, usar el primer usuario disponible
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM "User" LIMIT 1;
    END IF;
    
    -- Obtener IDs de roles
    SELECT id INTO student_role_id FROM "Role" WHERE LOWER(nombre) LIKE '%estudiante%' OR LOWER(nombre) LIKE '%student%' LIMIT 1;
    SELECT id INTO pastor_role_id FROM "Role" WHERE LOWER(nombre) LIKE '%pastor%' OR LOWER(nombre) LIKE '%tutor%' LIMIT 1;
    SELECT id INTO teacher_role_id FROM "Role" WHERE LOWER(nombre) LIKE '%docente%' OR LOWER(nombre) LIKE '%teacher%' LIMIT 1;
    SELECT id INTO coordinator_role_id FROM "Role" WHERE LOWER(nombre) LIKE '%coordinador%' OR LOWER(nombre) LIKE '%coordinator%' LIMIT 1;
    SELECT id INTO dean_role_id FROM "Role" WHERE LOWER(nombre) LIKE '%decano%' OR LOWER(nombre) LIKE '%dean%' LIMIT 1;
    SELECT id INTO admin_role_id FROM "Role" WHERE LOWER(nombre) LIKE '%admin%' OR LOWER(nombre) LIKE '%administrador%' LIMIT 1;
    
    -- PERMISOS PARA ESTUDIANTE
    IF student_role_id IS NOT NULL THEN
        INSERT INTO "RolePermissionNew" ("roleId", "permissionId", "grantedBy")
        SELECT student_role_id, p.id, admin_user_id
        FROM "PermissionNew" p
        WHERE p.name IN (
            'practices.read',
            'evaluations.read',
            'evidences.create',
            'evidences.read',
            'evidences.update'
        )
        ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    END IF;
    
    -- PERMISOS PARA PASTOR TUTOR
    IF pastor_role_id IS NOT NULL THEN
        INSERT INTO "RolePermissionNew" ("roleId", "permissionId", "grantedBy")
        SELECT pastor_role_id, p.id, admin_user_id
        FROM "PermissionNew" p
        WHERE p.name IN (
            'practices.read',
            'evaluations.create',
            'evaluations.read',
            'evaluations.update',
            'evidences.read',
            'evidences.approve',
            'reports.generate'
        )
        ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    END IF;
    
    -- PERMISOS PARA DOCENTE
    IF teacher_role_id IS NOT NULL THEN
        INSERT INTO "RolePermissionNew" ("roleId", "permissionId", "grantedBy")
        SELECT teacher_role_id, p.id, admin_user_id
        FROM "PermissionNew" p
        WHERE p.name IN (
            'practices.read',
            'practices.update',
            'evaluations.create',
            'evaluations.read',
            'evaluations.update',
            'evaluations.approve',
            'evidences.read',
            'evidences.approve',
            'reports.generate',
            'reports.export'
        )
        ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    END IF;
    
    -- PERMISOS PARA COORDINADOR
    IF coordinator_role_id IS NOT NULL THEN
        INSERT INTO "RolePermissionNew" ("roleId", "permissionId", "grantedBy")
        SELECT coordinator_role_id, p.id, admin_user_id
        FROM "PermissionNew" p
        WHERE p.name IN (
            'users.create',
            'users.read',
            'users.update',
            'centers.read',
            'practices.create',
            'practices.read',
            'practices.update',
            'practices.assign',
            'practices.transfer',
            'evaluations.read',
            'evaluations.approve',
            'evidences.read',
            'evidences.approve',
            'reports.generate',
            'reports.export'
        )
        ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    END IF;
    
    -- PERMISOS PARA DECANO
    IF dean_role_id IS NOT NULL THEN
        INSERT INTO "RolePermissionNew" ("roleId", "permissionId", "grantedBy")
        SELECT dean_role_id, p.id, admin_user_id
        FROM "PermissionNew" p
        WHERE p.name IN (
            'users.read',
            'users.update',
            'users.manage_roles',
            'centers.read',
            'practices.read',
            'practices.assign',
            'practices.transfer',
            'evaluations.read',
            'evaluations.approve',
            'evidences.read',
            'evidences.approve',
            'reports.generate',
            'reports.export',
            'audit.read'
        )
        ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    END IF;
    
    -- PERMISOS PARA ADMINISTRADOR (TODOS)
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO "RolePermissionNew" ("roleId", "permissionId", "grantedBy")
        SELECT admin_role_id, p.id, admin_user_id
        FROM "PermissionNew" p
        ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    END IF;
    
END $$;

\echo '✅ Permisos asignados a roles'
\echo ''

-- =====================================================
-- 4. CREAR FUNCIÓN DE VALIDACIÓN DE PERMISOS
-- =====================================================

\echo '🔧 4. Creando función de validación de permisos...'

CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id TEXT,
    p_permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Verificar si el usuario tiene el permiso a través de sus roles activos
    SELECT EXISTS(
        SELECT 1
        FROM "UserRole" ur
        JOIN "RolePermissionNew" rp ON ur."roleId" = rp."roleId"
        JOIN "PermissionNew" p ON rp."permissionId" = p.id
        WHERE ur."userId" = p_user_id
            AND ur.estado = 'ACTIVO'
            AND p.name = p_permission_name
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

\echo '✅ Función de validación de permisos creada'
\echo ''

-- =====================================================
-- 5. CREAR FUNCIÓN DE LOGGING DE SEGURIDAD
-- =====================================================

\echo '📝 5. Creando función de logging de seguridad...'

CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id TEXT,
    p_action TEXT,
    p_resource TEXT DEFAULT NULL,
    p_resource_id TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO "SecurityLog" (
        "userId",
        action,
        resource,
        "resourceId",
        "ipAddress",
        "userAgent",
        success,
        "errorMessage",
        metadata
    ) VALUES (
        p_user_id,
        p_action,
        p_resource,
        p_resource_id,
        p_ip_address,
        p_user_agent,
        p_success,
        p_error_message,
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

\echo '✅ Función de logging de seguridad creada'
\echo ''

-- =====================================================
-- 6. VERIFICACIÓN DE POBLACIÓN
-- =====================================================

\echo '🔍 6. Verificando población de datos...'

-- Verificar términos
SELECT 'Términos creados' as tabla, COUNT(*) as registros FROM "Term";

-- Verificar permisos
SELECT 'Permisos creados' as tabla, COUNT(*) as registros FROM "PermissionNew";

-- Verificar asignaciones de permisos
SELECT 'Asignaciones de permisos' as tabla, COUNT(*) as registros FROM "RolePermissionNew";

-- Verificar permisos por rol
SELECT 
    r.nombre as rol,
    COUNT(rp.id) as permisos_asignados
FROM "Role" r
LEFT JOIN "RolePermissionNew" rp ON r.id = rp."roleId"
GROUP BY r.id, r.nombre
ORDER BY r.nombre;

\echo ''
\echo '✅ FASE 2 COMPLETADA EXITOSAMENTE'
\echo '🔐 RBAC operacional configurado'
\echo '📅 Términos académicos disponibles'
\echo '🔄 Listo para Fase 3: Triggers y validaciones'
\echo ''