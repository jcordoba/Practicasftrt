-- =====================================================
-- FASE 1: CREACIÓN DE NUEVAS TABLAS
-- Sistema de Prácticas Profesionales FTR - Refactoring
-- =====================================================
-- Base de datos: practicasftr
-- Fecha: $(date)
-- Propósito: Crear nuevas tablas sin afectar las existentes
-- SEGURO: Solo crea nuevas estructuras, no modifica datos existentes

\echo '🚀 INICIANDO FASE 1: CREACIÓN DE NUEVAS TABLAS'
\echo ''

-- =====================================================
-- 1. TABLA PLACEMENT (Nueva estructura centralizada)
-- =====================================================

\echo '📋 1. Creando tabla Placement...'

CREATE TABLE IF NOT EXISTS "Placement" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "studentId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "pastorId" TEXT NOT NULL,
    "programId" TEXT,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraint crítica: Un estudiante solo puede tener un placement por término
    CONSTRAINT "unique_student_term" UNIQUE ("studentId", "termId"),
    
    -- Referencias
    CONSTRAINT "fk_placement_student" FOREIGN KEY ("studentId") REFERENCES "Estudiante"(id),
    CONSTRAINT "fk_placement_center" FOREIGN KEY ("centerId") REFERENCES "Congregation"(id),
    CONSTRAINT "fk_placement_pastor" FOREIGN KEY ("pastorId") REFERENCES "User"(id),
    CONSTRAINT "fk_placement_program" FOREIGN KEY ("programId") REFERENCES "Program"(id),
    CONSTRAINT "fk_placement_assigned_by" FOREIGN KEY ("assignedBy") REFERENCES "User"(id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS "idx_placement_student" ON "Placement"("studentId");
CREATE INDEX IF NOT EXISTS "idx_placement_center" ON "Placement"("centerId");
CREATE INDEX IF NOT EXISTS "idx_placement_pastor" ON "Placement"("pastorId");
CREATE INDEX IF NOT EXISTS "idx_placement_term" ON "Placement"("termId");
CREATE INDEX IF NOT EXISTS "idx_placement_status" ON "Placement"(status);

\echo '✅ Tabla Placement creada exitosamente'
\echo ''

-- =====================================================
-- 2. TABLA TERM (Períodos académicos)
-- =====================================================

\echo '📅 2. Creando tabla Term...'

CREATE TABLE IF NOT EXISTS "Term" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "academicYear" INTEGER NOT NULL,
    period INTEGER NOT NULL, -- 1=Primer semestre, 2=Segundo semestre, etc.
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraint: No puede haber períodos duplicados en el mismo año
    CONSTRAINT "unique_year_period" UNIQUE ("academicYear", period)
);

-- Índices
CREATE INDEX IF NOT EXISTS "idx_term_year" ON "Term"("academicYear");
CREATE INDEX IF NOT EXISTS "idx_term_period" ON "Term"(period);
CREATE INDEX IF NOT EXISTS "idx_term_status" ON "Term"(status);

\echo '✅ Tabla Term creada exitosamente'
\echo ''

-- =====================================================
-- 3. TABLA ASSIGNMENTHISTORY (Auditoría de cambios)
-- =====================================================

\echo '📜 3. Creando tabla AssignmentHistory...'

CREATE TABLE IF NOT EXISTS "AssignmentHistory" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "placementId" TEXT NOT NULL,
    "changeType" TEXT NOT NULL, -- 'CREATED', 'UPDATED', 'TRANSFERRED', 'CANCELLED'
    "previousCenterId" TEXT,
    "newCenterId" TEXT,
    "previousPastorId" TEXT,
    "newPastorId" TEXT,
    reason TEXT,
    "changedBy" TEXT NOT NULL,
    "changeDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB, -- Para información adicional
    
    -- Referencias
    CONSTRAINT "fk_history_placement" FOREIGN KEY ("placementId") REFERENCES "Placement"(id),
    CONSTRAINT "fk_history_changed_by" FOREIGN KEY ("changedBy") REFERENCES "User"(id),
    CONSTRAINT "fk_history_prev_center" FOREIGN KEY ("previousCenterId") REFERENCES "Congregation"(id),
    CONSTRAINT "fk_history_new_center" FOREIGN KEY ("newCenterId") REFERENCES "Congregation"(id),
    CONSTRAINT "fk_history_prev_pastor" FOREIGN KEY ("previousPastorId") REFERENCES "User"(id),
    CONSTRAINT "fk_history_new_pastor" FOREIGN KEY ("newPastorId") REFERENCES "User"(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS "idx_history_placement" ON "AssignmentHistory"("placementId");
CREATE INDEX IF NOT EXISTS "idx_history_change_type" ON "AssignmentHistory"("changeType");
CREATE INDEX IF NOT EXISTS "idx_history_change_date" ON "AssignmentHistory"("changeDate");
CREATE INDEX IF NOT EXISTS "idx_history_changed_by" ON "AssignmentHistory"("changedBy");

\echo '✅ Tabla AssignmentHistory creada exitosamente'
\echo ''

-- =====================================================
-- 4. NUEVAS TABLAS RBAC MEJORADAS
-- =====================================================

\echo '🔐 4. Creando tablas RBAC mejoradas...'

-- Tabla de permisos granulares
CREATE TABLE IF NOT EXISTS "PermissionNew" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    module TEXT NOT NULL, -- 'USERS', 'CENTERS', 'PRACTICES', 'EVALUATIONS', etc.
    action TEXT NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', etc.
    resource TEXT, -- Recurso específico si aplica
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de asignación de permisos a roles
CREATE TABLE IF NOT EXISTS "RolePermissionNew" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Un rol no puede tener el mismo permiso duplicado
    CONSTRAINT "unique_role_permission" UNIQUE ("roleId", "permissionId"),
    
    -- Referencias
    CONSTRAINT "fk_role_perm_role" FOREIGN KEY ("roleId") REFERENCES "Role"(id),
    CONSTRAINT "fk_role_perm_permission" FOREIGN KEY ("permissionId") REFERENCES "PermissionNew"(id),
    CONSTRAINT "fk_role_perm_granted_by" FOREIGN KEY ("grantedBy") REFERENCES "User"(id)
);

-- Índices RBAC
CREATE INDEX IF NOT EXISTS "idx_permission_module" ON "PermissionNew"(module);
CREATE INDEX IF NOT EXISTS "idx_permission_action" ON "PermissionNew"(action);
CREATE INDEX IF NOT EXISTS "idx_role_permission_role" ON "RolePermissionNew"("roleId");
CREATE INDEX IF NOT EXISTS "idx_role_permission_permission" ON "RolePermissionNew"("permissionId");

\echo '✅ Tablas RBAC mejoradas creadas exitosamente'
\echo ''

-- =====================================================
-- 5. TABLA DE AUDITORÍA DE SEGURIDAD
-- =====================================================

\echo '🔍 5. Creando tabla SecurityLog...'

CREATE TABLE IF NOT EXISTS "SecurityLog" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    success BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    metadata JSONB,
    "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Referencias
    CONSTRAINT "fk_security_log_user" FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS "idx_security_log_user" ON "SecurityLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_security_log_action" ON "SecurityLog"(action);
CREATE INDEX IF NOT EXISTS "idx_security_log_timestamp" ON "SecurityLog"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_security_log_success" ON "SecurityLog"(success);
CREATE INDEX IF NOT EXISTS "idx_security_log_resource" ON "SecurityLog"(resource);

\echo '✅ Tabla SecurityLog creada exitosamente'
\echo ''

-- =====================================================
-- 6. VERIFICACIÓN DE CREACIÓN
-- =====================================================

\echo '🔍 6. Verificando tablas creadas...'

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('Placement', 'Term', 'AssignmentHistory', 'PermissionNew', 'RolePermissionNew', 'SecurityLog')
ORDER BY tablename;

\echo ''
\echo '✅ FASE 1 COMPLETADA EXITOSAMENTE'
\echo '📋 Nuevas tablas creadas sin afectar datos existentes'
\echo '🔄 Listo para Fase 2: Migración de datos'
\echo ''