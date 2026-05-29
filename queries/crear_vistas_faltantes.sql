-- Crear vistas faltantes (corregidas)

-- Vista de compatibilidad para Assignment
CREATE OR REPLACE VIEW "AssignmentView" AS
SELECT 
    p.metadata->>'migrated_from_assignment' as id,
    p."studentId" as estudiante_id,
    p."centerId" as centro_id,
    NULL as practica_id,
    p."startDate"::timestamp as fecha_inicio,
    p."endDate"::timestamp as fecha_fin,
    CASE p.status
        WHEN 'ACTIVE' THEN 'ACTIVO'
        WHEN 'COMPLETED' THEN 'COMPLETADO'
        WHEN 'CANCELLED' THEN 'CANCELADO'
        ELSE 'ACTIVO'
    END as estado,
    p."createdAt" as fecha_creacion,
    p."updatedAt" as fecha_actualizacion,
    -- Campos adicionales para compatibilidad
    p.id as new_placement_id,
    p."pastorId",
    p."termId",
    p.status as new_status
FROM "Placement" p
WHERE p.metadata ? 'migrated_from_assignment'

UNION ALL

-- También incluir assignments originales si existen
SELECT 
    a.id,
    a.estudiante_id,
    a.centro_id,
    a.practica_id,
    a.fecha_inicio,
    NULL as fecha_fin, -- Assignment no tiene fecha_fin
    a.estado::text,
    a.fecha_creacion,
    a.fecha_actualizacion,
    -- Campos adicionales nulos para assignments originales
    NULL as new_placement_id,
    NULL as "pastorId",
    NULL as "termId",
    NULL as new_status
FROM "Assignment" a
WHERE NOT EXISTS (
    SELECT 1 FROM "Placement" p 
    WHERE p.metadata->>'migrated_from_assignment' = a.id
);

\echo 'Vista AssignmentView creada exitosamente';

-- Vista extendida con información de estudiante y centro
CREATE OR REPLACE VIEW "AssignmentDetailView" AS
SELECT 
    av.*,
    u.nombre as estudiante_nombre,
    u.email as estudiante_email,
    c.nombre as centro_nombre,
    c.direccion as centro_direccion,
    pastor.nombre as pastor_nombre,
    t.name as term_name,
    t."startDate" as term_start,
    t."endDate" as term_end
FROM "AssignmentView" av
JOIN "User" u ON av.estudiante_id = u.id
JOIN "Congregation" c ON av.centro_id = c.id
LEFT JOIN "User" pastor ON av."pastorId" = pastor.id
LEFT JOIN "Term" t ON av."termId" = t.id;

\echo 'Vista AssignmentDetailView creada exitosamente';

-- Verificar que las vistas se crearon correctamente
SELECT 'Verificación de vistas:' as info, COUNT(*) as registros_assignment_view FROM "AssignmentView";

\echo 'Todas las vistas de compatibilidad creadas exitosamente';