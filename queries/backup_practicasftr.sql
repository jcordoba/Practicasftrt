--
-- PostgreSQL database dump
--

-- Dumped from database version 13.21 (Debian 13.21-1.pgdg120+1)
-- Dumped by pg_dump version 13.21 (Debian 13.21-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'ACTIVO',
    'TRASLADADO',
    'FINALIZADO'
);


ALTER TYPE public."AssignmentStatus" OWNER TO postgres;

--
-- Name: EvidenceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EvidenceStatus" AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA'
);


ALTER TYPE public."EvidenceStatus" OWNER TO postgres;

--
-- Name: PracticeStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PracticeStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public."PracticeStatus" OWNER TO postgres;

--
-- Name: audit_placement_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.audit_placement_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Para INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO "AssignmentHistory" (
            "placementId",
            "changeType",
            "newCenterId",
            "newPastorId",
            reason,
            "changedBy",
            metadata
        ) VALUES (
            NEW.id,
            'CREATED',
            NEW."centerId",
            NEW."pastorId",
            'Placement inicial creado',
            NEW."assignedBy",
            jsonb_build_object(
                'termId', NEW."termId",
                'studentId', NEW."studentId",
                'startDate', NEW."startDate",
                'endDate', NEW."endDate"
            )
        );
        RETURN NEW;
    END IF;
    
    -- Para UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Solo auditar si cambi?? el centro o pastor
        IF OLD."centerId" != NEW."centerId" OR OLD."pastorId" != NEW."pastorId" THEN
            INSERT INTO "AssignmentHistory" (
                "placementId",
                "changeType",
                "previousCenterId",
                "newCenterId",
                "previousPastorId",
                "newPastorId",
                reason,
                "changedBy",
                metadata
            ) VALUES (
                NEW.id,
                CASE 
                    WHEN OLD."centerId" != NEW."centerId" AND OLD."pastorId" != NEW."pastorId" THEN 'TRANSFERRED'
                    WHEN OLD."centerId" != NEW."centerId" THEN 'CENTER_CHANGED'
                    WHEN OLD."pastorId" != NEW."pastorId" THEN 'PASTOR_CHANGED'
                END,
                OLD."centerId",
                NEW."centerId",
                OLD."pastorId",
                NEW."pastorId",
                'Cambio autom??tico detectado',
                NEW."assignedBy",
                jsonb_build_object(
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'updated_at', NEW."updatedAt"
                )
            );
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.audit_placement_changes() OWNER TO postgres;

--
-- Name: check_user_permission(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_user_permission(p_user_id text, p_permission_name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Verificar si el usuario tiene el permiso a trav??s de sus roles activos
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
$$;


ALTER FUNCTION public.check_user_permission(p_user_id text, p_permission_name text) OWNER TO postgres;

--
-- Name: create_placement(text, text, text, text, date, date, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_placement(p_student_id text, p_center_id text, p_pastor_id text, p_term_id text, p_start_date date, p_end_date date, p_assigned_by text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_placement_id TEXT;
BEGIN
    -- Generar ID ??nico
    new_placement_id := 'place-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);
    
    -- Insertar placement
    INSERT INTO "Placement" (
        id, "studentId", "centerId", "pastorId", "termId",
        "startDate", "endDate", status, "assignedBy", "createdAt", "updatedAt"
    )
    VALUES (
        new_placement_id, p_student_id, p_center_id, p_pastor_id, p_term_id,
        p_start_date, p_end_date, 'ACTIVE', p_assigned_by, NOW(), NOW()
    );
    
    RETURN new_placement_id;
END;
$$;


ALTER FUNCTION public.create_placement(p_student_id text, p_center_id text, p_pastor_id text, p_term_id text, p_start_date date, p_end_date date, p_assigned_by text) OWNER TO postgres;

--
-- Name: get_placement_from_assignment(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_placement_from_assignment(p_assignment_id text) RETURNS TABLE(placement_id text, student_id text, center_id text, pastor_id text, term_id text, status text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p."studentId",
        p."centerId",
        p."pastorId",
        p."termId",
        p.status
    FROM "Placement" p
    WHERE p.metadata->>'migrated_from_assignment' = p_assignment_id;
END;
$$;


ALTER FUNCTION public.get_placement_from_assignment(p_assignment_id text) OWNER TO postgres;

--
-- Name: log_security_event(text, text, text, text, text, text, boolean, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_security_event(p_user_id text, p_action text, p_resource text DEFAULT NULL::text, p_resource_id text DEFAULT NULL::text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_success boolean DEFAULT true, p_error_message text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION public.log_security_event(p_user_id text, p_action text, p_resource text, p_resource_id text, p_ip_address text, p_user_agent text, p_success boolean, p_error_message text, p_metadata jsonb) OWNER TO postgres;

--
-- Name: migrate_all_assignments(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.migrate_all_assignments() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    assignment_id TEXT;
    migrated_count INTEGER := 0;
    failed_count INTEGER := 0;
BEGIN
    FOR assignment_id IN 
        SELECT id FROM "Assignment" ORDER BY "createdAt"
    LOOP
        BEGIN
            IF migrate_assignment_to_placement(assignment_id) THEN
                migrated_count := migrated_count + 1;
            ELSE
                failed_count := failed_count + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error migrando assignment %: %', assignment_id, SQLERRM;
            failed_count := failed_count + 1;
        END;
    END LOOP;
    
    RAISE NOTICE '??? Migraci??n completada: % exitosos, % fallidos', migrated_count, failed_count;
    RETURN migrated_count;
END;
$$;


ALTER FUNCTION public.migrate_all_assignments() OWNER TO postgres;

--
-- Name: migrate_assignment_to_placement(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.migrate_assignment_to_placement(p_assignment_id text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    assignment_record RECORD;
    term_id TEXT;
    placement_id TEXT;
    pastor_id TEXT;
BEGIN
    -- Obtener datos del assignment
    SELECT * INTO assignment_record
    FROM "Assignment"
    WHERE id = p_assignment_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Assignment % no encontrado', p_assignment_id;
        RETURN FALSE;
    END IF;
    
    -- Determinar t??rmino basado en fecha de inicio
    SELECT id INTO term_id
    FROM "Term"
    WHERE assignment_record.fecha_inicio::DATE >= "startDate"
        AND assignment_record.fecha_inicio::DATE <= "endDate"
    LIMIT 1;
    
    -- Si no hay t??rmino espec??fico, usar el m??s reciente
    IF term_id IS NULL THEN
        SELECT id INTO term_id
        FROM "Term"
        ORDER BY "startDate" DESC
        LIMIT 1;
    END IF;
    
    -- Buscar un pastor en el centro (si existe)
    SELECT ur."userId" INTO pastor_id
    FROM "UserRole" ur
    JOIN "Role" r ON ur."roleId" = r.id
    WHERE r.nombre = 'PASTOR_TUTOR'
        AND ur.estado = 'ACTIVO'
    LIMIT 1;
    
    -- Si no hay pastor, usar el primer usuario activo
    IF pastor_id IS NULL THEN
        SELECT id INTO pastor_id
        FROM "User"
        LIMIT 1;
    END IF;
    
    -- Generar ID ??nico para placement
    placement_id := 'place-' || REPLACE(p_assignment_id, 'assign-', '');
    
    -- Insertar en Placement
    INSERT INTO "Placement" (
        id,
        "studentId",
        "centerId",
        "pastorId",
        "termId",
        "startDate",
        "endDate",
        status,
        "assignedBy",
        "createdAt",
        "updatedAt",
        metadata
    )
    VALUES (
        placement_id,
        assignment_record.estudiante_id,
        assignment_record.centro_id,
        pastor_id,
        term_id,
        assignment_record.fecha_inicio::DATE,
        COALESCE(
            assignment_record.fecha_fin::DATE,
            (assignment_record.fecha_inicio::DATE + INTERVAL '4 months')::DATE
        ),
        CASE assignment_record.estado
            WHEN 'ACTIVO' THEN 'ACTIVE'
            WHEN 'COMPLETADO' THEN 'COMPLETED'
            WHEN 'CANCELADO' THEN 'CANCELLED'
            ELSE 'ACTIVE'
        END,
        'migration-system',
        assignment_record."createdAt",
        NOW(),
        jsonb_build_object(
            'migrated_from_assignment', p_assignment_id,
            'original_estado', assignment_record.estado,
            'migration_date', NOW()
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        "updatedAt" = NOW(),
        metadata = "Placement".metadata || jsonb_build_object('last_migration_update', NOW());
    
    -- Registrar en historial
    INSERT INTO "AssignmentHistory" (
        "placementId",
        "changeType",
        "newCenterId",
        "newPastorId",
        reason,
        "changedBy",
        metadata
    )
    VALUES (
        placement_id,
        'MIGRATED',
        assignment_record.centro_id,
        pastor_id,
        'Migrado desde Assignment legacy',
        'migration-system',
        jsonb_build_object(
            'original_assignment_id', p_assignment_id,
            'migration_timestamp', NOW()
        )
    )
    ON CONFLICT DO NOTHING;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.migrate_assignment_to_placement(p_assignment_id text) OWNER TO postgres;

--
-- Name: transfer_student(text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.transfer_student(p_placement_id text, p_new_center_id text, p_new_pastor_id text, p_reason text, p_transferred_by text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    old_center_id TEXT;
    old_pastor_id TEXT;
    student_id TEXT;
    term_id TEXT;
BEGIN
    -- Obtener datos actuales del placement
    SELECT "centerId", "pastorId", "studentId", "termId"
    INTO old_center_id, old_pastor_id, student_id, term_id
    FROM "Placement"
    WHERE id = p_placement_id AND status = 'ACTIVE';
    
    -- Verificar que el placement existe y est?? activo
    IF old_center_id IS NULL THEN
        RAISE EXCEPTION 'Placement % no encontrado o no est?? activo', p_placement_id;
    END IF;
    
    -- Verificar que el nuevo centro existe
    IF NOT EXISTS (SELECT 1 FROM "Congregation" WHERE id = p_new_center_id) THEN
        RAISE EXCEPTION 'Centro % no existe', p_new_center_id;
    END IF;
    
    -- Verificar que el nuevo pastor existe
    IF NOT EXISTS (SELECT 1 FROM "User" WHERE id = p_new_pastor_id) THEN
        RAISE EXCEPTION 'Pastor % no existe', p_new_pastor_id;
    END IF;
    
    -- Actualizar el placement
    UPDATE "Placement"
    SET 
        "centerId" = p_new_center_id,
        "pastorId" = p_new_pastor_id,
        "assignedBy" = p_transferred_by,
        "updatedAt" = NOW()
    WHERE id = p_placement_id;
    
    -- El trigger de auditor??a se encargar?? de registrar el cambio en AssignmentHistory
    
    -- Registrar en log de seguridad
    PERFORM log_security_event(
        p_transferred_by,
        'TRANSFER_STUDENT',
        'placement',
        p_placement_id,
        NULL,
        NULL,
        TRUE,
        NULL,
        jsonb_build_object(
            'student_id', student_id,
            'term_id', term_id,
            'old_center_id', old_center_id,
            'new_center_id', p_new_center_id,
            'old_pastor_id', old_pastor_id,
            'new_pastor_id', p_new_pastor_id,
            'reason', p_reason
        )
    );
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.transfer_student(p_placement_id text, p_new_center_id text, p_new_pastor_id text, p_reason text, p_transferred_by text) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: validate_evaluation_timing(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_evaluation_timing() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    assignment_start DATE;
    assignment_end DATE;
    cut_start_date DATE;
    cut_end_date DATE;
    assignment_duration INTEGER;
BEGIN
    -- Obtener fechas del assignment
    SELECT 
        a.fecha_inicio::DATE,
        COALESCE(
            (SELECT p."endDate"::DATE FROM "Practice" p WHERE p.id = a.practica_id),
            (a.fecha_inicio + INTERVAL '4 months')::DATE
        )
    INTO assignment_start, assignment_end
    FROM "Assignment" a
    WHERE a.id = NEW.asignacion_id;
    
    -- Si no encontramos el assignment, permitir (ser?? validado por FK)
    IF assignment_start IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Calcular duraci??n del assignment en d??as
    assignment_duration := assignment_end - assignment_start;
    
    -- Calcular ventanas de evaluaci??n seg??n el corte
    CASE NEW.corte
        WHEN 1 THEN
            -- Primer corte: 25% - 45% del per??odo
            cut_start_date := assignment_start + (assignment_duration * 0.25)::INTEGER;
            cut_end_date := assignment_start + (assignment_duration * 0.45)::INTEGER;
        WHEN 2 THEN
            -- Segundo corte: 75% - 95% del per??odo
            cut_start_date := assignment_start + (assignment_duration * 0.75)::INTEGER;
            cut_end_date := assignment_start + (assignment_duration * 0.95)::INTEGER;
        ELSE
            -- Para otros cortes, permitir cualquier fecha dentro del per??odo
            cut_start_date := assignment_start;
            cut_end_date := assignment_end;
    END CASE;
    
    -- Validar que la fecha de evaluaci??n est?? en la ventana correcta
    IF NEW.fecha::DATE < cut_start_date OR NEW.fecha::DATE > cut_end_date THEN
        RAISE EXCEPTION 'La evaluaci??n del corte % debe realizarse entre % y %, fecha proporcionada: %',
            NEW.corte, cut_start_date, cut_end_date, NEW.fecha::DATE;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_evaluation_timing() OWNER TO postgres;

--
-- Name: validate_unique_student_term_placement(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_unique_student_term_placement() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    existing_count INTEGER;
BEGIN
    -- Solo validar para placements activos
    IF NEW.status != 'ACTIVE' THEN
        RETURN NEW;
    END IF;
    
    -- Contar placements activos existentes para el mismo estudiante y t??rmino
    SELECT COUNT(*)
    INTO existing_count
    FROM "Placement"
    WHERE "studentId" = NEW."studentId"
        AND "termId" = NEW."termId"
        AND status = 'ACTIVE'
        AND id != COALESCE(NEW.id, '');
    
    IF existing_count > 0 THEN
        RAISE EXCEPTION 'El estudiante % ya tiene un placement activo para el t??rmino %',
            NEW."studentId", NEW."termId";
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_unique_student_term_placement() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Assignment" (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    practica_id text NOT NULL,
    centro_id text NOT NULL,
    "programId" text,
    fecha_inicio timestamp(3) without time zone,
    estado public."AssignmentStatus" DEFAULT 'ACTIVO'::public."AssignmentStatus" NOT NULL,
    usuario_asignador text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Assignment" OWNER TO postgres;

--
-- Name: AssignmentHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AssignmentHistory" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "placementId" text NOT NULL,
    "changeType" text NOT NULL,
    "previousCenterId" text,
    "newCenterId" text,
    "previousPastorId" text,
    "newPastorId" text,
    reason text,
    "changedBy" text NOT NULL,
    "changeDate" timestamp without time zone DEFAULT now() NOT NULL,
    metadata jsonb
);


ALTER TABLE public."AssignmentHistory" OWNER TO postgres;

--
-- Name: Placement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Placement" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "studentId" text NOT NULL,
    "termId" text NOT NULL,
    "centerId" text NOT NULL,
    "pastorId" text NOT NULL,
    "programId" text,
    "startDate" timestamp without time zone NOT NULL,
    "endDate" timestamp without time zone NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "assignedBy" text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public."Placement" OWNER TO postgres;

--
-- Name: AssignmentView; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public."AssignmentView" AS
 SELECT (p.metadata ->> 'migrated_from_assignment'::text) AS id,
    p."studentId" AS estudiante_id,
    p."centerId" AS centro_id,
    NULL::text AS practica_id,
    p."startDate" AS fecha_inicio,
    p."endDate" AS fecha_fin,
        CASE p.status
            WHEN 'ACTIVE'::text THEN 'ACTIVO'::text
            WHEN 'COMPLETED'::text THEN 'COMPLETADO'::text
            WHEN 'CANCELLED'::text THEN 'CANCELADO'::text
            ELSE 'ACTIVO'::text
        END AS estado,
    p."createdAt" AS fecha_creacion,
    p."updatedAt" AS fecha_actualizacion,
    p.id AS new_placement_id,
    p."pastorId",
    p."termId",
    p.status AS new_status
   FROM public."Placement" p
  WHERE (p.metadata ? 'migrated_from_assignment'::text)
UNION ALL
 SELECT a.id,
    a.estudiante_id,
    a.centro_id,
    a.practica_id,
    a.fecha_inicio,
    NULL::timestamp without time zone AS fecha_fin,
    (a.estado)::text AS estado,
    a.fecha_creacion,
    a.fecha_actualizacion,
    NULL::text AS new_placement_id,
    NULL::text AS "pastorId",
    NULL::text AS "termId",
    NULL::text AS new_status
   FROM public."Assignment" a
  WHERE (NOT (EXISTS ( SELECT 1
           FROM public."Placement" p
          WHERE ((p.metadata ->> 'migrated_from_assignment'::text) = a.id))));


ALTER TABLE public."AssignmentView" OWNER TO postgres;

--
-- Name: Association; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Association" (
    id text NOT NULL,
    nombre text NOT NULL,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    "unionId" text NOT NULL
);


ALTER TABLE public."Association" OWNER TO postgres;

--
-- Name: Congregation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Congregation" (
    id text NOT NULL,
    nombre text NOT NULL,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    "districtId" text NOT NULL,
    "esCentroPractica" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Congregation" OWNER TO postgres;

--
-- Name: District; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."District" (
    id text NOT NULL,
    nombre text NOT NULL,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    "associationId" text NOT NULL
);


ALTER TABLE public."District" OWNER TO postgres;

--
-- Name: Docente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Docente" (
    id text NOT NULL,
    "nombreCompleto" text NOT NULL,
    "tipoDocumento" text NOT NULL,
    "numeroDocumento" text NOT NULL,
    correo text NOT NULL,
    telefono text,
    whatsapp text,
    direccion text,
    rol text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Docente" OWNER TO postgres;

--
-- Name: Estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Estudiante" (
    id text NOT NULL,
    "nombreCompleto" text NOT NULL,
    "tipoDocumento" text NOT NULL,
    "numeroDocumento" text NOT NULL,
    correo text NOT NULL,
    telefono text,
    whatsapp text,
    direccion text,
    programa text NOT NULL,
    semestre integer NOT NULL,
    "estadoMatricula" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Estudiante" OWNER TO postgres;

--
-- Name: Evaluation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Evaluation" (
    id text NOT NULL,
    asignacion_id text NOT NULL,
    corte integer NOT NULL,
    fecha timestamp(3) without time zone NOT NULL,
    evaluador_id text NOT NULL,
    nota double precision NOT NULL,
    criterios jsonb NOT NULL,
    observaciones text NOT NULL,
    "programId" text,
    creado_por text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_por text,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public."Evaluation" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nombre text NOT NULL,
    "programId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: EvaluationDetailView; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public."EvaluationDetailView" AS
 SELECT e.id,
    e.asignacion_id,
    e.corte,
    e.fecha,
    e.evaluador_id,
    e.nota,
    e.criterios,
    e.observaciones,
    e."programId",
    e.creado_por,
    e.fecha_creacion,
    e.actualizado_por,
    e.fecha_actualizacion,
    e.metadata,
    COALESCE((e.metadata ->> 'placement_id'::text), 'legacy'::text) AS placement_id,
        CASE
            WHEN (e.metadata ? 'placement_id'::text) THEN p."studentId"
            ELSE a.estudiante_id
        END AS "studentId",
        CASE
            WHEN (e.metadata ? 'placement_id'::text) THEN p."centerId"
            ELSE a.centro_id
        END AS "centerId",
    p."pastorId",
    p."termId",
    u.nombre AS estudiante_nombre,
    c.nombre AS centro_nombre,
    pastor.nombre AS pastor_nombre
   FROM (((((public."Evaluation" e
     LEFT JOIN public."Assignment" a ON ((e.asignacion_id = a.id)))
     LEFT JOIN public."Placement" p ON ((p.id = (e.metadata ->> 'placement_id'::text))))
     LEFT JOIN public."User" u ON ((COALESCE(p."studentId", a.estudiante_id) = u.id)))
     LEFT JOIN public."Congregation" c ON ((COALESCE(p."centerId", a.centro_id) = c.id)))
     LEFT JOIN public."User" pastor ON ((p."pastorId" = pastor.id)));


ALTER TABLE public."EvaluationDetailView" OWNER TO postgres;

--
-- Name: Evidence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Evidence" (
    id text NOT NULL,
    asignacion_id text NOT NULL,
    archivo text NOT NULL,
    fecha timestamp(3) without time zone NOT NULL,
    hora text NOT NULL,
    ubicacion text,
    estado public."EvidenceStatus" DEFAULT 'PENDIENTE'::public."EvidenceStatus" NOT NULL,
    subido_por text NOT NULL,
    fecha_subida timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revisado_por text,
    fecha_revision timestamp(3) without time zone,
    motivo_rechazo text,
    sincronizado boolean DEFAULT false NOT NULL,
    peso integer,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public."Evidence" OWNER TO postgres;

--
-- Name: Institution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Institution" (
    id text NOT NULL,
    nombre text NOT NULL,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    "esCentroPractica" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Institution" OWNER TO postgres;

--
-- Name: OtpCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OtpCode" (
    id text NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OtpCode" OWNER TO postgres;

--
-- Name: Permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    modulo text NOT NULL,
    accion text NOT NULL,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Permission" OWNER TO postgres;

--
-- Name: PermissionNew; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PermissionNew" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    name text NOT NULL,
    description text,
    module text NOT NULL,
    action text NOT NULL,
    resource text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."PermissionNew" OWNER TO postgres;

--
-- Name: Practice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Practice" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "tutorId" text NOT NULL,
    "teacherId" text NOT NULL,
    institution text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status public."PracticeStatus" DEFAULT 'PENDING'::public."PracticeStatus" NOT NULL,
    hours integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "programId" text
);


ALTER TABLE public."Practice" OWNER TO postgres;

--
-- Name: PracticeReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PracticeReport" (
    id text NOT NULL,
    "practiceId" text NOT NULL,
    "userId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    activities text NOT NULL,
    hours integer NOT NULL,
    observations text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PracticeReport" OWNER TO postgres;

--
-- Name: Program; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Program" (
    id text NOT NULL,
    nombre text NOT NULL,
    codigo text NOT NULL,
    descripcion text,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Program" OWNER TO postgres;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    descripcion text,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Role" OWNER TO postgres;

--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RolePermission" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_asignacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RolePermission" OWNER TO postgres;

--
-- Name: RolePermissionNew; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RolePermissionNew" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "grantedBy" text NOT NULL,
    "grantedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."RolePermissionNew" OWNER TO postgres;

--
-- Name: SecurityLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SecurityLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text,
    action text NOT NULL,
    resource text,
    "resourceId" text,
    "ipAddress" text,
    "userAgent" text,
    success boolean NOT NULL,
    "errorMessage" text,
    metadata jsonb,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."SecurityLog" OWNER TO postgres;

--
-- Name: Term; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Term" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    name text NOT NULL,
    "startDate" timestamp without time zone NOT NULL,
    "endDate" timestamp without time zone NOT NULL,
    "academicYear" integer NOT NULL,
    period integer NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Term" OWNER TO postgres;

--
-- Name: Union; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Union" (
    id text NOT NULL,
    nombre text NOT NULL,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Union" OWNER TO postgres;

--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserRole" (
    "userId" text NOT NULL,
    "roleId" text NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id text NOT NULL,
    estado text DEFAULT 'ACTIVO'::text NOT NULL,
    fecha_asignacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserRole" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Assignment" (id, estudiante_id, practica_id, centro_id, "programId", fecha_inicio, estado, usuario_asignador, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: AssignmentHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AssignmentHistory" (id, "placementId", "changeType", "previousCenterId", "newCenterId", "previousPastorId", "newPastorId", reason, "changedBy", "changeDate", metadata) FROM stdin;
\.


--
-- Data for Name: Association; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Association" (id, nombre, estado, fecha_creacion, fecha_actualizacion, "unionId") FROM stdin;
\.


--
-- Data for Name: Congregation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Congregation" (id, nombre, estado, fecha_creacion, fecha_actualizacion, "districtId", "esCentroPractica") FROM stdin;
\.


--
-- Data for Name: District; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."District" (id, nombre, estado, fecha_creacion, fecha_actualizacion, "associationId") FROM stdin;
\.


--
-- Data for Name: Docente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Docente" (id, "nombreCompleto", "tipoDocumento", "numeroDocumento", correo, telefono, whatsapp, direccion, rol, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Estudiante" (id, "nombreCompleto", "tipoDocumento", "numeroDocumento", correo, telefono, whatsapp, direccion, programa, semestre, "estadoMatricula", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Evaluation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Evaluation" (id, asignacion_id, corte, fecha, evaluador_id, nota, criterios, observaciones, "programId", creado_por, fecha_creacion, actualizado_por, fecha_actualizacion, metadata) FROM stdin;
\.


--
-- Data for Name: Evidence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Evidence" (id, asignacion_id, archivo, fecha, hora, ubicacion, estado, subido_por, fecha_subida, revisado_por, fecha_revision, motivo_rechazo, sincronizado, peso, fecha_creacion, fecha_actualizacion, metadata) FROM stdin;
\.


--
-- Data for Name: Institution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Institution" (id, nombre, estado, fecha_creacion, fecha_actualizacion, "esCentroPractica") FROM stdin;
\.


--
-- Data for Name: OtpCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OtpCode" (id, email, code, used, "expiresAt", "createdAt") FROM stdin;
cmehensir0001ns018nqj2cbz	admin@sion.com	420603	t	2025-08-18 18:00:12.483	2025-08-18 17:45:12.484
cmehep07m0002ns01txi57yo9	admin@sion.com	407903	t	2025-08-18 18:01:09.106	2025-08-18 17:46:09.107
cmeherpuo0003ns017k10co6p	admin@sion.com	279989	t	2025-08-18 18:03:15.647	2025-08-18 17:48:15.648
cmeheua2f0004ns01yxlrlxik	admin@sion.com	357337	t	2025-08-18 18:05:15.158	2025-08-18 17:50:15.159
cmehexpwn0005ns01iguv2f8g	admin@sion.com	842136	t	2025-08-18 18:07:55.655	2025-08-18 17:52:55.656
cmehf1llq0000ns0114xvsdml	admin@sion.com	906551	t	2025-08-18 18:10:56.7	2025-08-18 17:55:56.702
cmehf4c4d0001ns0127dwawyy	admin@sion.com	159675	t	2025-08-18 18:13:04.379	2025-08-18 17:58:04.381
cmehf59ve0002ns01zl5ajfyz	admin@sion.com	879457	t	2025-08-18 18:13:48.121	2025-08-18 17:58:48.122
cmehff1im0001pg01thil5wkc	admin@sion.com	250565	t	2025-08-18 18:21:23.854	2025-08-18 18:06:23.855
cmehfg0w30002pg01pqesjs5q	admin@sion.com	562460	t	2025-08-18 18:22:09.699	2025-08-18 18:07:09.699
cmehfgddv0003pg01xpxwyzko	admin@sion.com	581762	t	2025-08-18 18:22:25.89	2025-08-18 18:07:25.891
cmehfjocx0004pg01qhi3qivx	admin@sion.com	816192	t	2025-08-18 18:25:00.08	2025-08-18 18:10:00.081
cmehg5gde0000og0111hx1l1t	admin@sion.com	250942	t	2025-08-18 18:41:56.161	2025-08-18 18:26:56.162
cmehga07e0001og01y4r3oa8u	admin@sion.com	334779	t	2025-08-18 18:45:28.488	2025-08-18 18:30:28.49
cmehgbbi20002og01ypi2dq3a	admin@sion.com	295237	t	2025-08-18 18:46:29.781	2025-08-18 18:31:29.786
cmehgdfe00003og01jdjn0ov8	admin@sion.com	362752	t	2025-08-18 18:48:08.135	2025-08-18 18:33:08.136
cmehkqe5k0004og01sz10cz6s	admin@sion.com	418842	t	2025-08-18 20:50:11.526	2025-08-18 20:35:11.527
cmehvof6b0005og01flze0g6e	admin@sion.com	948091	t	2025-08-19 01:56:35.314	2025-08-19 01:41:35.316
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Permission" (id, nombre, descripcion, modulo, accion, estado, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: PermissionNew; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PermissionNew" (id, name, description, module, action, resource, "createdAt") FROM stdin;
13757930-c204-464f-a25d-63aecc52fe1c	users.create	Crear nuevos usuarios	USERS	CREATE	user	2025-08-18 20:34:43.414787
9f4e46b2-2409-47db-a49f-aeea7963f659	users.read	Ver informaci??n de usuarios	USERS	READ	user	2025-08-18 20:34:43.414787
28b46e7a-cb85-4862-afc6-007afb17a2d2	users.update	Actualizar informaci??n de usuarios	USERS	UPDATE	user	2025-08-18 20:34:43.414787
ec4b545d-b434-4fca-b90c-0880a61d398b	users.delete	Eliminar usuarios	USERS	DELETE	user	2025-08-18 20:34:43.414787
adf13c0f-4d08-46fd-8a1b-a582069b221b	users.manage_roles	Gestionar roles de usuarios	USERS	MANAGE	user_roles	2025-08-18 20:34:43.414787
97b35f26-2768-4d62-9424-afd371f5de25	centers.create	Crear nuevos centros	CENTERS	CREATE	center	2025-08-18 20:34:43.414787
55f689d8-5404-49ec-9213-cf95048e73c6	centers.read	Ver informaci??n de centros	CENTERS	READ	center	2025-08-18 20:34:43.414787
00370171-7911-4366-b53f-f5fe03dabfab	centers.update	Actualizar informaci??n de centros	CENTERS	UPDATE	center	2025-08-18 20:34:43.414787
b58687a5-aa01-4e3b-a47e-030f76ca8c17	centers.delete	Eliminar centros	CENTERS	DELETE	center	2025-08-18 20:34:43.414787
8c70cf75-9f9e-45ae-9aff-e31f060f5351	practices.create	Crear nuevas pr??cticas	PRACTICES	CREATE	practice	2025-08-18 20:34:43.414787
03032f02-0321-4c54-bbde-03fffdb25ff8	practices.read	Ver informaci??n de pr??cticas	PRACTICES	READ	practice	2025-08-18 20:34:43.414787
6a4b4276-8286-41af-a3e0-6ec7f85eec8d	practices.update	Actualizar informaci??n de pr??cticas	PRACTICES	UPDATE	practice	2025-08-18 20:34:43.414787
dc68bdb5-487d-4fa5-918b-c38ebe75d608	practices.delete	Eliminar pr??cticas	PRACTICES	DELETE	practice	2025-08-18 20:34:43.414787
c8ef71c2-9ba0-4111-b9bc-899e07f52520	practices.assign	Asignar estudiantes a centros	PRACTICES	ASSIGN	assignment	2025-08-18 20:34:43.414787
d405cdcc-f611-40bf-8ed7-1e58396b4ad3	practices.transfer	Transferir estudiantes entre centros	PRACTICES	TRANSFER	assignment	2025-08-18 20:34:43.414787
4b1e8b4a-990c-438c-96e9-cbe50fe1bdd3	evaluations.create	Crear evaluaciones	EVALUATIONS	CREATE	evaluation	2025-08-18 20:34:43.414787
dcf88f86-cb65-4a80-9bc7-3bc05586aa40	evaluations.read	Ver evaluaciones	EVALUATIONS	READ	evaluation	2025-08-18 20:34:43.414787
ae6fd180-e70c-4599-b575-4db5f745d221	evaluations.update	Actualizar evaluaciones	EVALUATIONS	UPDATE	evaluation	2025-08-18 20:34:43.414787
9d3832a1-72c8-4c98-a654-e8ad3ade8272	evaluations.approve	Aprobar evaluaciones	EVALUATIONS	APPROVE	evaluation	2025-08-18 20:34:43.414787
4f4a1601-bb28-415a-be3d-a8fc0ee43025	evidences.create	Subir evidencias	EVIDENCES	CREATE	evidence	2025-08-18 20:34:43.414787
37a3692f-1a9f-4095-a834-ab68d514c6a0	evidences.read	Ver evidencias	EVIDENCES	READ	evidence	2025-08-18 20:34:43.414787
e051fd49-bc44-431a-bf0b-6c2d27079e82	evidences.update	Actualizar evidencias	EVIDENCES	UPDATE	evidence	2025-08-18 20:34:43.414787
25ea9036-dcd1-4917-9b4c-46ea85cc4ce3	evidences.approve	Aprobar evidencias	EVIDENCES	APPROVE	evidence	2025-08-18 20:34:43.414787
9d52d235-d3b6-4d28-b438-24aec379282a	reports.generate	Generar reportes	REPORTS	GENERATE	report	2025-08-18 20:34:43.414787
710de9f4-c04f-4425-8aa0-b6718fd0f856	reports.export	Exportar reportes	REPORTS	EXPORT	report	2025-08-18 20:34:43.414787
f39cbdcb-27cc-4849-970d-f5aaf2581590	config.read	Ver configuraci??n del sistema	CONFIG	READ	config	2025-08-18 20:34:43.414787
db91979a-8ea2-4b32-980c-b760805855eb	config.update	Actualizar configuraci??n del sistema	CONFIG	UPDATE	config	2025-08-18 20:34:43.414787
2459cab6-f99e-466b-9aec-a35527b48a4c	audit.read	Ver logs de auditor??a	AUDIT	READ	audit_log	2025-08-18 20:34:43.414787
8b6bdfb0-63da-4d31-940a-e80fb66b6bba	audit.export	Exportar logs de auditor??a	AUDIT	EXPORT	audit_log	2025-08-18 20:34:43.414787
\.


--
-- Data for Name: Placement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Placement" (id, "studentId", "termId", "centerId", "pastorId", "programId", "startDate", "endDate", status, "assignedBy", "createdAt", "updatedAt", metadata) FROM stdin;
\.


--
-- Data for Name: Practice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Practice" (id, "studentId", "tutorId", "teacherId", institution, "startDate", "endDate", status, hours, "createdAt", "updatedAt", "programId") FROM stdin;
\.


--
-- Data for Name: PracticeReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PracticeReport" (id, "practiceId", "userId", date, activities, hours, observations, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Program" (id, nombre, codigo, descripcion, estado, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Role" (id, descripcion, estado, fecha_actualizacion, fecha_creacion, nombre) FROM stdin;
cmehelvup0000nsclayz8pzdd	Estudiante de la universidad	ACTIVO	2025-08-18 17:43:43.489	2025-08-18 17:43:43.489	ESTUDIANTE
cmehelvux0001nscl5a1fwwkf	Pastor tutor	ACTIVO	2025-08-18 17:43:43.497	2025-08-18 17:43:43.497	PASTOR_TUTOR
cmehelvv10002nsclqcgp71og	Docente	ACTIVO	2025-08-18 17:43:43.501	2025-08-18 17:43:43.501	DOCENTE
cmehelvv60003nsclqh677csz	Coordinador de prácticas	ACTIVO	2025-08-18 17:43:43.507	2025-08-18 17:43:43.507	COORDINADOR_PRACTICAS
cmehelvvb0004nscl9q4xsknx	Decano	ACTIVO	2025-08-18 17:43:43.512	2025-08-18 17:43:43.512	DECANO
cmehelvvg0005nscl7is06ne5	Administrador técnico	ACTIVO	2025-08-18 17:43:43.516	2025-08-18 17:43:43.516	ADMINISTRADOR_TECNICO
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RolePermission" (id, "roleId", "permissionId", estado, fecha_asignacion, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: RolePermissionNew; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RolePermissionNew" (id, "roleId", "permissionId", "grantedBy", "grantedAt") FROM stdin;
298b4cee-1305-4c93-8216-ca31071fc2f5	cmehelvup0000nsclayz8pzdd	03032f02-0321-4c54-bbde-03fffdb25ff8	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
9d5e2fb9-4b41-4b78-94bd-9b3cee6134f5	cmehelvup0000nsclayz8pzdd	dcf88f86-cb65-4a80-9bc7-3bc05586aa40	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
5d3073ac-c2d0-4359-a8f6-4989d37aa9a9	cmehelvup0000nsclayz8pzdd	4f4a1601-bb28-415a-be3d-a8fc0ee43025	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
7eaa3099-42dd-4768-bda5-076f7db30f16	cmehelvup0000nsclayz8pzdd	37a3692f-1a9f-4095-a834-ab68d514c6a0	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
84be0342-a5e0-4e52-bba9-062dd039135d	cmehelvup0000nsclayz8pzdd	e051fd49-bc44-431a-bf0b-6c2d27079e82	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
d03ed990-e1af-4922-bed6-f6709fceb6fe	cmehelvux0001nscl5a1fwwkf	03032f02-0321-4c54-bbde-03fffdb25ff8	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
5c5dd990-1e6e-4b26-99b4-08a727b96cd7	cmehelvux0001nscl5a1fwwkf	4b1e8b4a-990c-438c-96e9-cbe50fe1bdd3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
8f0c22d7-5c78-49d8-991a-515b6cecd9bb	cmehelvux0001nscl5a1fwwkf	dcf88f86-cb65-4a80-9bc7-3bc05586aa40	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
c5601ff3-6975-46f1-a485-d0f472dae04e	cmehelvux0001nscl5a1fwwkf	ae6fd180-e70c-4599-b575-4db5f745d221	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
26c0cd0b-631e-4d5a-a051-eb47384fd53a	cmehelvux0001nscl5a1fwwkf	37a3692f-1a9f-4095-a834-ab68d514c6a0	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
f2a9ae11-0ef5-4473-8364-6c643602dee2	cmehelvux0001nscl5a1fwwkf	25ea9036-dcd1-4917-9b4c-46ea85cc4ce3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
641636e3-e8d9-4b0c-8457-169b9ed967f7	cmehelvux0001nscl5a1fwwkf	9d52d235-d3b6-4d28-b438-24aec379282a	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
84e848c4-77c2-469e-8d42-f7be42f36f75	cmehelvv10002nsclqcgp71og	03032f02-0321-4c54-bbde-03fffdb25ff8	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
147b9a81-181f-42c2-a202-64e931017850	cmehelvv10002nsclqcgp71og	6a4b4276-8286-41af-a3e0-6ec7f85eec8d	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
914a3564-6804-4e41-85e7-65dce99b80df	cmehelvv10002nsclqcgp71og	4b1e8b4a-990c-438c-96e9-cbe50fe1bdd3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
159ff980-767c-42c4-a98b-a2d73ecd7d57	cmehelvv10002nsclqcgp71og	dcf88f86-cb65-4a80-9bc7-3bc05586aa40	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
042edf9f-ec93-450b-b599-ee44f5f3139d	cmehelvv10002nsclqcgp71og	ae6fd180-e70c-4599-b575-4db5f745d221	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
ac69fdde-4316-47a4-9c7d-7479c270f937	cmehelvv10002nsclqcgp71og	9d3832a1-72c8-4c98-a654-e8ad3ade8272	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
e2847d3b-0cdc-4273-9307-2ea7416d7b67	cmehelvv10002nsclqcgp71og	37a3692f-1a9f-4095-a834-ab68d514c6a0	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
e992f6cb-cff6-47ff-b4c9-283583686c7c	cmehelvv10002nsclqcgp71og	25ea9036-dcd1-4917-9b4c-46ea85cc4ce3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
9f5112d1-c35d-4318-8a76-f1bd44c29552	cmehelvv10002nsclqcgp71og	9d52d235-d3b6-4d28-b438-24aec379282a	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
7cfff187-7ebc-4653-9e88-b0e2d38b4e5d	cmehelvv10002nsclqcgp71og	710de9f4-c04f-4425-8aa0-b6718fd0f856	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
99fcc614-00a5-4f50-9b63-18c01a45bc18	cmehelvv60003nsclqh677csz	13757930-c204-464f-a25d-63aecc52fe1c	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
b0c39f4c-a635-45e7-8e1f-ef80b97c54e7	cmehelvv60003nsclqh677csz	9f4e46b2-2409-47db-a49f-aeea7963f659	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
620ae078-6eb8-49f1-938c-25d8d6b268b3	cmehelvv60003nsclqh677csz	28b46e7a-cb85-4862-afc6-007afb17a2d2	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
60939411-e3c4-415a-9615-79b64e432d0f	cmehelvv60003nsclqh677csz	55f689d8-5404-49ec-9213-cf95048e73c6	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
8019416b-5859-42b2-b2e4-4f84e9bec239	cmehelvv60003nsclqh677csz	8c70cf75-9f9e-45ae-9aff-e31f060f5351	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
2bb489fc-eaf8-48b3-a822-e42d7942f976	cmehelvv60003nsclqh677csz	03032f02-0321-4c54-bbde-03fffdb25ff8	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
aa7e358b-8f26-4543-8d39-5516f96ef771	cmehelvv60003nsclqh677csz	6a4b4276-8286-41af-a3e0-6ec7f85eec8d	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
86e81f22-33d3-4b76-a4c1-bc4ff50c833b	cmehelvv60003nsclqh677csz	c8ef71c2-9ba0-4111-b9bc-899e07f52520	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
0b04650c-1e88-43c5-945b-85be80b6dd68	cmehelvv60003nsclqh677csz	d405cdcc-f611-40bf-8ed7-1e58396b4ad3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
3e12196c-dab8-4a55-ba65-a95004130356	cmehelvv60003nsclqh677csz	dcf88f86-cb65-4a80-9bc7-3bc05586aa40	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
34912dc3-f122-4d27-9f08-5245677d5403	cmehelvv60003nsclqh677csz	9d3832a1-72c8-4c98-a654-e8ad3ade8272	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
e6bc5b64-a0d6-4080-af1e-a78b5709aac4	cmehelvv60003nsclqh677csz	37a3692f-1a9f-4095-a834-ab68d514c6a0	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
2c058336-58f1-463e-8037-938aba048537	cmehelvv60003nsclqh677csz	25ea9036-dcd1-4917-9b4c-46ea85cc4ce3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
d00d1c31-5a6d-4ea1-9f6d-3961bdd4af4e	cmehelvv60003nsclqh677csz	9d52d235-d3b6-4d28-b438-24aec379282a	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
c669186d-02e3-4baa-818a-60dbd6d90278	cmehelvv60003nsclqh677csz	710de9f4-c04f-4425-8aa0-b6718fd0f856	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
43f7576e-82cc-48cb-9472-e07da01e9337	cmehelvvb0004nscl9q4xsknx	9f4e46b2-2409-47db-a49f-aeea7963f659	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
ba229ae8-4303-49bd-98af-1de1e4412837	cmehelvvb0004nscl9q4xsknx	28b46e7a-cb85-4862-afc6-007afb17a2d2	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
2f9825d2-1580-4abf-955c-ee5dd562ee07	cmehelvvb0004nscl9q4xsknx	adf13c0f-4d08-46fd-8a1b-a582069b221b	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
4b703832-997e-4827-ae84-2c18dbfd4ecc	cmehelvvb0004nscl9q4xsknx	55f689d8-5404-49ec-9213-cf95048e73c6	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
1c60ce19-4f59-4060-97f0-aba03c350630	cmehelvvb0004nscl9q4xsknx	03032f02-0321-4c54-bbde-03fffdb25ff8	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
2611e623-97ef-4f8f-bb57-6765e29623b0	cmehelvvb0004nscl9q4xsknx	c8ef71c2-9ba0-4111-b9bc-899e07f52520	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
b90838d0-9a93-4c5a-98c4-2a227aa004a9	cmehelvvb0004nscl9q4xsknx	d405cdcc-f611-40bf-8ed7-1e58396b4ad3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
569333bc-7916-4384-b6a6-519f90b4fa95	cmehelvvb0004nscl9q4xsknx	dcf88f86-cb65-4a80-9bc7-3bc05586aa40	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
c53cbb39-822c-467a-972d-df9b77e3931c	cmehelvvb0004nscl9q4xsknx	9d3832a1-72c8-4c98-a654-e8ad3ade8272	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
4c24a1b4-47a4-4ea2-b034-1d6f7256149a	cmehelvvb0004nscl9q4xsknx	37a3692f-1a9f-4095-a834-ab68d514c6a0	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
8bdfda50-99a8-4d60-bba4-804c6825bd27	cmehelvvb0004nscl9q4xsknx	25ea9036-dcd1-4917-9b4c-46ea85cc4ce3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
ed340f47-78bf-49ff-a3a2-18abcb7bd2de	cmehelvvb0004nscl9q4xsknx	9d52d235-d3b6-4d28-b438-24aec379282a	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
23bd699f-9002-4e36-ba90-35d6ce95586d	cmehelvvb0004nscl9q4xsknx	710de9f4-c04f-4425-8aa0-b6718fd0f856	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
96ebc6d4-1b8e-4a7d-ac22-4e27a05fcafd	cmehelvvb0004nscl9q4xsknx	2459cab6-f99e-466b-9aec-a35527b48a4c	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
19a3c1a1-5e28-4c4d-b956-84e6f5c35f2b	cmehelvvg0005nscl7is06ne5	13757930-c204-464f-a25d-63aecc52fe1c	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
1309b9a8-14d7-4470-9d23-ee2064f982f4	cmehelvvg0005nscl7is06ne5	9f4e46b2-2409-47db-a49f-aeea7963f659	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
052dd049-9880-4d88-a95b-602f720b25a4	cmehelvvg0005nscl7is06ne5	28b46e7a-cb85-4862-afc6-007afb17a2d2	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
d9d28576-a321-4b3f-b84d-20a33dfe73e5	cmehelvvg0005nscl7is06ne5	ec4b545d-b434-4fca-b90c-0880a61d398b	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
d01bd7fb-66cf-4d9c-a329-4ecef589726d	cmehelvvg0005nscl7is06ne5	adf13c0f-4d08-46fd-8a1b-a582069b221b	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
0505ddd3-5efb-4cbe-adf9-98a6330ff935	cmehelvvg0005nscl7is06ne5	97b35f26-2768-4d62-9424-afd371f5de25	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
f2bb3ec3-8fed-487f-9f6d-b7cd2c53670a	cmehelvvg0005nscl7is06ne5	55f689d8-5404-49ec-9213-cf95048e73c6	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
2dace8eb-207d-4f2b-8bec-808368cc99f0	cmehelvvg0005nscl7is06ne5	00370171-7911-4366-b53f-f5fe03dabfab	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
230aee61-28dc-4908-88ee-a968bbe17567	cmehelvvg0005nscl7is06ne5	b58687a5-aa01-4e3b-a47e-030f76ca8c17	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
700a99c0-7ebb-4c21-9300-1afe7d5054b8	cmehelvvg0005nscl7is06ne5	8c70cf75-9f9e-45ae-9aff-e31f060f5351	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
b3549263-255e-4823-995a-ec9345f1ee90	cmehelvvg0005nscl7is06ne5	03032f02-0321-4c54-bbde-03fffdb25ff8	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
4e0fa8a2-bed9-4601-a911-1e5a5ba7f919	cmehelvvg0005nscl7is06ne5	6a4b4276-8286-41af-a3e0-6ec7f85eec8d	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
29edd2f9-2acd-4997-bc8e-6e83bd28829d	cmehelvvg0005nscl7is06ne5	dc68bdb5-487d-4fa5-918b-c38ebe75d608	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
11933ff8-4beb-448c-8d4f-3878cf6259e5	cmehelvvg0005nscl7is06ne5	c8ef71c2-9ba0-4111-b9bc-899e07f52520	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
c67b7033-2ce2-49ef-8654-a11d6cce963e	cmehelvvg0005nscl7is06ne5	d405cdcc-f611-40bf-8ed7-1e58396b4ad3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
5921ab1f-3f2c-4626-9e4f-1a4cb405c6b6	cmehelvvg0005nscl7is06ne5	4b1e8b4a-990c-438c-96e9-cbe50fe1bdd3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
633abea0-73c8-4192-8c47-1436047de712	cmehelvvg0005nscl7is06ne5	dcf88f86-cb65-4a80-9bc7-3bc05586aa40	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
0fe05229-617d-4165-9e66-9e65eaade99c	cmehelvvg0005nscl7is06ne5	ae6fd180-e70c-4599-b575-4db5f745d221	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
06eabfb7-d1d4-4208-a3d4-e3109fbbea13	cmehelvvg0005nscl7is06ne5	9d3832a1-72c8-4c98-a654-e8ad3ade8272	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
dd95382d-34d9-45fb-a0ac-ac9824bffee5	cmehelvvg0005nscl7is06ne5	4f4a1601-bb28-415a-be3d-a8fc0ee43025	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
50405d28-56ce-4a9f-ae40-bba7e67794e9	cmehelvvg0005nscl7is06ne5	37a3692f-1a9f-4095-a834-ab68d514c6a0	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
856e6d1e-92f5-4790-94cd-29106fe36c44	cmehelvvg0005nscl7is06ne5	e051fd49-bc44-431a-bf0b-6c2d27079e82	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
0ad1e2d4-f486-40ac-97b8-59eb239b76d3	cmehelvvg0005nscl7is06ne5	25ea9036-dcd1-4917-9b4c-46ea85cc4ce3	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
c0d6eb26-368f-440c-a218-1989da490d2f	cmehelvvg0005nscl7is06ne5	9d52d235-d3b6-4d28-b438-24aec379282a	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
8b449021-36d4-4f28-9860-48c103b7eb97	cmehelvvg0005nscl7is06ne5	710de9f4-c04f-4425-8aa0-b6718fd0f856	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
4872dba4-5a60-4837-a476-3a5ec58185a4	cmehelvvg0005nscl7is06ne5	f39cbdcb-27cc-4849-970d-f5aaf2581590	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
6ca69ceb-3408-4cb7-86c5-a7b510e8e0de	cmehelvvg0005nscl7is06ne5	db91979a-8ea2-4b32-980c-b760805855eb	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
e761bfee-82c8-48ba-ba12-aa0728fcd77a	cmehelvvg0005nscl7is06ne5	2459cab6-f99e-466b-9aec-a35527b48a4c	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
3f980755-c382-40c8-a612-3ca6932939e8	cmehelvvg0005nscl7is06ne5	8b6bdfb0-63da-4d31-940a-e80fb66b6bba	cmehelvz40006nsclhy7xgvhi	2025-08-18 20:34:43.419576
\.


--
-- Data for Name: SecurityLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SecurityLog" (id, "userId", action, resource, "resourceId", "ipAddress", "userAgent", success, "errorMessage", metadata, "timestamp") FROM stdin;
\.


--
-- Data for Name: Term; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Term" (id, name, "startDate", "endDate", "academicYear", period, status, "createdAt", "updatedAt") FROM stdin;
term-2024-1	2024 - Primer Semestre	2024-01-15 00:00:00	2024-06-30 23:59:59	2024	1	COMPLETED	2025-08-18 20:34:43.40955	2025-08-18 20:34:43.40955
term-2024-2	2024 - Segundo Semestre	2024-07-15 00:00:00	2024-12-15 23:59:59	2024	2	COMPLETED	2025-08-18 20:34:43.40955	2025-08-18 20:34:43.40955
term-2025-1	2025 - Primer Semestre	2025-01-15 00:00:00	2025-06-30 23:59:59	2025	1	ACTIVE	2025-08-18 20:34:43.40955	2025-08-18 20:34:43.40955
term-2025-2	2025 - Segundo Semestre	2025-07-15 00:00:00	2025-12-15 23:59:59	2025	2	PLANNED	2025-08-18 20:34:43.40955	2025-08-18 20:34:43.40955
\.


--
-- Data for Name: Union; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Union" (id, nombre, estado, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, estado, fecha_actualizacion, fecha_creacion, nombre, "programId") FROM stdin;
cmehelvz40006nsclhy7xgvhi	admin@sion.com	$2b$10$py9vYHlM9wHd3c.PMZWNwOJ0N/Y5SxdDOae1OWGfcNe.9inCAxqlS	ACTIVO	2025-08-18 17:43:43.648	2025-08-18 17:43:43.648	Administrador del Sistema	\N
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRole" ("userId", "roleId", fecha_actualizacion, fecha_creacion, id, estado, fecha_asignacion) FROM stdin;
cmehelvz40006nsclhy7xgvhi	cmehelvvg0005nscl7is06ne5	2025-08-18 17:43:43.648	2025-08-18 17:43:43.648	cmehelvz40008nsclkoe17tyu	ACTIVO	2025-08-18 17:43:43.648
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f4b7a9ed-e311-4075-b085-761ba39a51e2	954c5207e5be45f8f4820e650193e2b02a966cd4283c711b4c8e54806f9e6396	2025-08-18 17:43:31.057713+00	20250728175217_init	\N	\N	2025-08-18 17:43:30.974042+00	1
6afebb68-78b5-4d30-8ff5-4b52244d67fc	d8c12e7fa76860a4bcd9f78a0950aafa0692112f6b3b58aeeb51716a6b7e0954	2025-08-18 17:43:31.085862+00	20250729045936_add_estudiante_docente	\N	\N	2025-08-18 17:43:31.059438+00	1
9ef6b129-2df5-45ee-9967-76308518c431	ce32ee454a06769850aecc9db837ce05186e5316112cdd4945993a4ebc7d5511	2025-08-18 17:43:31.124897+00	20250816031649_add_practice_models	\N	\N	2025-08-18 17:43:31.087974+00	1
04a67ed7-047c-4efe-9f97-7f56e63ab80a	36833553784f13bcd02f73e1cd9c7ada678e35fa10180b1842092e39f07748a9	2025-08-18 17:43:31.202925+00	20250816133119_implement_rbac_and_complete_models	\N	\N	2025-08-18 17:43:31.126977+00	1
\.


--
-- Name: AssignmentHistory AssignmentHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentHistory"
    ADD CONSTRAINT "AssignmentHistory_pkey" PRIMARY KEY (id);


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: Association Association_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Association"
    ADD CONSTRAINT "Association_pkey" PRIMARY KEY (id);


--
-- Name: Congregation Congregation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Congregation"
    ADD CONSTRAINT "Congregation_pkey" PRIMARY KEY (id);


--
-- Name: District District_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_pkey" PRIMARY KEY (id);


--
-- Name: Docente Docente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Docente"
    ADD CONSTRAINT "Docente_pkey" PRIMARY KEY (id);


--
-- Name: Estudiante Estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Estudiante"
    ADD CONSTRAINT "Estudiante_pkey" PRIMARY KEY (id);


--
-- Name: Evaluation Evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_pkey" PRIMARY KEY (id);


--
-- Name: Evidence Evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evidence"
    ADD CONSTRAINT "Evidence_pkey" PRIMARY KEY (id);


--
-- Name: Institution Institution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Institution"
    ADD CONSTRAINT "Institution_pkey" PRIMARY KEY (id);


--
-- Name: OtpCode OtpCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpCode"
    ADD CONSTRAINT "OtpCode_pkey" PRIMARY KEY (id);


--
-- Name: PermissionNew PermissionNew_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PermissionNew"
    ADD CONSTRAINT "PermissionNew_name_key" UNIQUE (name);


--
-- Name: PermissionNew PermissionNew_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PermissionNew"
    ADD CONSTRAINT "PermissionNew_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: Placement Placement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Placement"
    ADD CONSTRAINT "Placement_pkey" PRIMARY KEY (id);


--
-- Name: PracticeReport PracticeReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PracticeReport"
    ADD CONSTRAINT "PracticeReport_pkey" PRIMARY KEY (id);


--
-- Name: Practice Practice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Practice"
    ADD CONSTRAINT "Practice_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: RolePermissionNew RolePermissionNew_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissionNew"
    ADD CONSTRAINT "RolePermissionNew_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: SecurityLog SecurityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SecurityLog"
    ADD CONSTRAINT "SecurityLog_pkey" PRIMARY KEY (id);


--
-- Name: Term Term_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Term"
    ADD CONSTRAINT "Term_pkey" PRIMARY KEY (id);


--
-- Name: Union Union_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Union"
    ADD CONSTRAINT "Union_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: RolePermissionNew unique_role_permission; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissionNew"
    ADD CONSTRAINT unique_role_permission UNIQUE ("roleId", "permissionId");


--
-- Name: Placement unique_student_term; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Placement"
    ADD CONSTRAINT unique_student_term UNIQUE ("studentId", "termId");


--
-- Name: Term unique_year_period; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Term"
    ADD CONSTRAINT unique_year_period UNIQUE ("academicYear", period);


--
-- Name: Docente_correo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Docente_correo_key" ON public."Docente" USING btree (correo);


--
-- Name: Estudiante_correo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Estudiante_correo_key" ON public."Estudiante" USING btree (correo);


--
-- Name: Institution_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Institution_nombre_key" ON public."Institution" USING btree (nombre);


--
-- Name: Permission_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Permission_nombre_key" ON public."Permission" USING btree (nombre);


--
-- Name: Program_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Program_codigo_key" ON public."Program" USING btree (codigo);


--
-- Name: Program_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Program_nombre_key" ON public."Program" USING btree (nombre);


--
-- Name: RolePermission_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON public."RolePermission" USING btree ("roleId", "permissionId");


--
-- Name: Role_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Role_nombre_key" ON public."Role" USING btree (nombre);


--
-- Name: UserRole_userId_roleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON public."UserRole" USING btree ("userId", "roleId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: idx_assignment_center_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_center_status ON public."Assignment" USING btree (centro_id, estado);


--
-- Name: idx_assignment_history_placement_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_history_placement_date ON public."AssignmentHistory" USING btree ("placementId", "changeDate");


--
-- Name: idx_assignment_student_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_student_status ON public."Assignment" USING btree (estudiante_id, estado);


--
-- Name: idx_evaluation_assignment_cut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluation_assignment_cut ON public."Evaluation" USING btree (asignacion_id, corte);


--
-- Name: idx_evaluation_metadata; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluation_metadata ON public."Evaluation" USING gin (metadata);


--
-- Name: idx_evidence_assignment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evidence_assignment_status ON public."Evidence" USING btree (asignacion_id, estado);


--
-- Name: idx_evidence_metadata; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evidence_metadata ON public."Evidence" USING gin (metadata);


--
-- Name: idx_history_change_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_change_date ON public."AssignmentHistory" USING btree ("changeDate");


--
-- Name: idx_history_change_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_change_type ON public."AssignmentHistory" USING btree ("changeType");


--
-- Name: idx_history_changed_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_changed_by ON public."AssignmentHistory" USING btree ("changedBy");


--
-- Name: idx_history_placement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_placement ON public."AssignmentHistory" USING btree ("placementId");


--
-- Name: idx_permission_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permission_action ON public."PermissionNew" USING btree (action);


--
-- Name: idx_permission_module; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permission_module ON public."PermissionNew" USING btree (module);


--
-- Name: idx_placement_center; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_placement_center ON public."Placement" USING btree ("centerId");


--
-- Name: idx_placement_metadata; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_placement_metadata ON public."Placement" USING gin (metadata);


--
-- Name: idx_placement_pastor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_placement_pastor ON public."Placement" USING btree ("pastorId");


--
-- Name: idx_placement_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_placement_status ON public."Placement" USING btree (status);


--
-- Name: idx_placement_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_placement_student ON public."Placement" USING btree ("studentId");


--
-- Name: idx_placement_student_term_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_placement_student_term_status ON public."Placement" USING btree ("studentId", "termId", status);


--
-- Name: idx_placement_term; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_placement_term ON public."Placement" USING btree ("termId");


--
-- Name: idx_role_permission_permission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_permission_permission ON public."RolePermissionNew" USING btree ("permissionId");


--
-- Name: idx_role_permission_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_permission_role ON public."RolePermissionNew" USING btree ("roleId");


--
-- Name: idx_security_log_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_log_action ON public."SecurityLog" USING btree (action);


--
-- Name: idx_security_log_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_log_resource ON public."SecurityLog" USING btree (resource);


--
-- Name: idx_security_log_success; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_log_success ON public."SecurityLog" USING btree (success);


--
-- Name: idx_security_log_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_log_timestamp ON public."SecurityLog" USING btree ("timestamp");


--
-- Name: idx_security_log_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_log_user ON public."SecurityLog" USING btree ("userId");


--
-- Name: idx_security_log_user_action_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_log_user_action_timestamp ON public."SecurityLog" USING btree ("userId", action, "timestamp");


--
-- Name: idx_term_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_term_period ON public."Term" USING btree (period);


--
-- Name: idx_term_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_term_status ON public."Term" USING btree (status);


--
-- Name: idx_term_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_term_year ON public."Term" USING btree ("academicYear");


--
-- Name: idx_user_role_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_role_active ON public."UserRole" USING btree ("userId", estado);


--
-- Name: Placement trigger_audit_placement; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_placement AFTER INSERT OR UPDATE ON public."Placement" FOR EACH ROW EXECUTE FUNCTION public.audit_placement_changes();


--
-- Name: Placement trigger_update_placement_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_placement_timestamp BEFORE UPDATE ON public."Placement" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Term trigger_update_term_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_term_timestamp BEFORE UPDATE ON public."Term" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Evaluation trigger_validate_evaluation_timing; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_validate_evaluation_timing BEFORE INSERT OR UPDATE ON public."Evaluation" FOR EACH ROW EXECUTE FUNCTION public.validate_evaluation_timing();


--
-- Name: Placement trigger_validate_unique_student_term; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_validate_unique_student_term BEFORE INSERT OR UPDATE ON public."Placement" FOR EACH ROW EXECUTE FUNCTION public.validate_unique_student_term_placement();


--
-- Name: Assignment Assignment_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Association Association_unionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Association"
    ADD CONSTRAINT "Association_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES public."Union"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Congregation Congregation_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Congregation"
    ADD CONSTRAINT "Congregation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."District"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: District District_associationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES public."Association"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Evaluation Evaluation_asignacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_asignacion_id_fkey" FOREIGN KEY (asignacion_id) REFERENCES public."Assignment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Evaluation Evaluation_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Evidence Evidence_asignacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evidence"
    ADD CONSTRAINT "Evidence_asignacion_id_fkey" FOREIGN KEY (asignacion_id) REFERENCES public."Assignment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PracticeReport PracticeReport_practiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PracticeReport"
    ADD CONSTRAINT "PracticeReport_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES public."Practice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PracticeReport PracticeReport_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PracticeReport"
    ADD CONSTRAINT "PracticeReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Practice Practice_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Practice"
    ADD CONSTRAINT "Practice_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Practice Practice_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Practice"
    ADD CONSTRAINT "Practice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Practice Practice_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Practice"
    ADD CONSTRAINT "Practice_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Practice Practice_tutorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Practice"
    ADD CONSTRAINT "Practice_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRole UserRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRole UserRole_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AssignmentHistory fk_history_changed_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentHistory"
    ADD CONSTRAINT fk_history_changed_by FOREIGN KEY ("changedBy") REFERENCES public."User"(id);


--
-- Name: AssignmentHistory fk_history_new_center; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentHistory"
    ADD CONSTRAINT fk_history_new_center FOREIGN KEY ("newCenterId") REFERENCES public."Congregation"(id);


--
-- Name: AssignmentHistory fk_history_new_pastor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentHistory"
    ADD CONSTRAINT fk_history_new_pastor FOREIGN KEY ("newPastorId") REFERENCES public."User"(id);


--
-- Name: AssignmentHistory fk_history_placement; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentHistory"
    ADD CONSTRAINT fk_history_placement FOREIGN KEY ("placementId") REFERENCES public."Placement"(id);


--
-- Name: AssignmentHistory fk_history_prev_center; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentHistory"
    ADD CONSTRAINT fk_history_prev_center FOREIGN KEY ("previousCenterId") REFERENCES public."Congregation"(id);


--
-- Name: AssignmentHistory fk_history_prev_pastor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentHistory"
    ADD CONSTRAINT fk_history_prev_pastor FOREIGN KEY ("previousPastorId") REFERENCES public."User"(id);


--
-- Name: Placement fk_placement_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Placement"
    ADD CONSTRAINT fk_placement_assigned_by FOREIGN KEY ("assignedBy") REFERENCES public."User"(id);


--
-- Name: Placement fk_placement_center; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Placement"
    ADD CONSTRAINT fk_placement_center FOREIGN KEY ("centerId") REFERENCES public."Congregation"(id);


--
-- Name: Placement fk_placement_pastor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Placement"
    ADD CONSTRAINT fk_placement_pastor FOREIGN KEY ("pastorId") REFERENCES public."User"(id);


--
-- Name: Placement fk_placement_program; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Placement"
    ADD CONSTRAINT fk_placement_program FOREIGN KEY ("programId") REFERENCES public."Program"(id);


--
-- Name: Placement fk_placement_student; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Placement"
    ADD CONSTRAINT fk_placement_student FOREIGN KEY ("studentId") REFERENCES public."Estudiante"(id);


--
-- Name: RolePermissionNew fk_role_perm_granted_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissionNew"
    ADD CONSTRAINT fk_role_perm_granted_by FOREIGN KEY ("grantedBy") REFERENCES public."User"(id);


--
-- Name: RolePermissionNew fk_role_perm_permission; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissionNew"
    ADD CONSTRAINT fk_role_perm_permission FOREIGN KEY ("permissionId") REFERENCES public."PermissionNew"(id);


--
-- Name: RolePermissionNew fk_role_perm_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissionNew"
    ADD CONSTRAINT fk_role_perm_role FOREIGN KEY ("roleId") REFERENCES public."Role"(id);


--
-- Name: SecurityLog fk_security_log_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SecurityLog"
    ADD CONSTRAINT fk_security_log_user FOREIGN KEY ("userId") REFERENCES public."User"(id);


--
-- PostgreSQL database dump complete
--

