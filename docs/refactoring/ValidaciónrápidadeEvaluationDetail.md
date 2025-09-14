¡Excelente, Javier! 👏 Lo que generó Trae (análisis + `EvaluationDetail`) está muy bien encaminado. Te dejo una revisión quirúrgica y los ajustes que sugiero antes de pasar a **SocialProjection** y **SNIES**.

# Validación rápida de `EvaluationDetail`

Lo bueno:

* Estructura robusta, con **dimensiones** y **asistencia** integradas.
* **Compatibilidad** con la tabla `Evaluation` vía vista.
* Índices GIN en JSONB y triggers de auditoría: ✅.

Ajustes recomendados (mínimos pero importantes):

1. **Cortes permitidos: solo 1 y 2**
   Tus requisitos son 2 cortes (6 + 6); no metas “3” salvo que exista un remedial formal.

   ```sql
   ALTER TABLE "EvaluationDetail"
     DROP CONSTRAINT IF EXISTS valid_evaluation_period,
     ADD CONSTRAINT valid_evaluation_period CHECK (evaluationPeriod IN (1,2));
   ```
2. **Asistencia por sábados (o hitos) además de horas**
   El proceso real evalúa por **semanas/sábados**; agrega campos numéricos para trazabilidad operativa, además del JSON.

   ```sql
   ALTER TABLE "EvaluationDetail"
     ADD COLUMN sabbathsPlanned SMALLINT NOT NULL DEFAULT 6,
     ADD COLUMN sabbathsAttended SMALLINT NOT NULL DEFAULT 0,
     ADD COLUMN sabbathAttendancePct DECIMAL(5,2) GENERATED ALWAYS AS (
       CASE WHEN sabbathsPlanned>0 THEN (sabbathsAttended::DECIMAL/sabbathsPlanned*100) ELSE 0 END
     ) STORED;
   ```
3. **Enforzar un evaluador válido por tipo de evaluación**
   Si el **corte** lo diligencia Pastor Tutor (o Docente), valida el rol en BD (o por trigger):

   ```sql
   -- ejemplo de constraint lógico vía trigger (simplificado)
   -- asume función has_required_role(uuid, text) que valida en UserRole
   CREATE OR REPLACE FUNCTION check_evaluator_role() RETURNS trigger AS $$
   BEGIN
     IF NEW.evaluationType='regular' AND NOT has_required_role(NEW.evaluatorId,'PASTOR_TUTOR') THEN
       RAISE EXCEPTION 'Evaluador debe tener rol PASTOR_TUTOR';
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   CREATE TRIGGER trg_evaldetail_evalrole
     BEFORE INSERT OR UPDATE ON "EvaluationDetail"
     FOR EACH ROW EXECUTE FUNCTION check_evaluator_role();
   ```
4. **Unicidad por (placementId, evaluationPeriod)**
   Evita duplicados de corte, incluso si cambian `evaluationType`.

   ```sql
   DROP INDEX IF EXISTS idx_evaluationdetail_unique_placement_period;
   CREATE UNIQUE INDEX uq_evaldetail_cut
   ON "EvaluationDetail"(placementId, evaluationPeriod);
   ```
5. **Vista de compatibilidad**: mantén el nombre de claves legacy
   Tu vista usa `placementId AS asignacion_id`; eso puede confundir APIs viejas. Mejor expón ambos:

   ```sql
   CREATE OR REPLACE VIEW "EvaluationCompatibilityView" AS
   SELECT 
     ed.id,
     p.id            AS placement_id,
     a.id            AS asignacion_id,   -- si existe mapeo placement→assignment
     ed.evaluationPeriod AS corte,
     ed.evaluationDate   AS fecha,
     ed.evaluatorId      AS evaluador_id,
     ed.finalGrade       AS nota,
     jsonb_build_object(
       'academic', ed.academicDimension,
       'pastoral', ed.pastoralDimension,
       'social', ed.socialDimension,
       'administrative', ed.administrativeDimension
     ) AS criterios,
     COALESCE(ed.generalObservations,'') AS observaciones,
     p."programId",
     ed.createdBy       AS creado_por,
     ed.createdAt       AS fecha_creacion,
     ed.updatedBy       AS actualizado_por,
     ed.updatedAt       AS fecha_actualizacion,
     ed.metadata
   FROM "EvaluationDetail" ed
   JOIN "Placement" p ON ed.placementId = p.id
   LEFT JOIN "Assignment" a ON a.practica_id = p.id  -- ajusta si tu función mapea distinto
   WHERE ed.status = 'approved';
   ```

   *(Si no hay mapeo 1:1 con `Assignment`, deja `asignacion_id` nulo, pero así no rompes consumidores legacy.)*

---

# Siguiente bloque: **SocialProjection**

Basado en el formulario oficial de **Evento Cultural** (campos: ámbito, modalidad, nombre, lugar, ejes, responsables, beneficiarios, fechas, horas, etc.), propongo este esquema mínimo viable, 100% trazable y enlazado a `Placement`/`Term`:

```sql
CREATE TABLE "SocialProjection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  termId UUID NOT NULL REFERENCES "Term"(id),
  placementId UUID NULL REFERENCES "Placement"(id), -- opcional si la actividad está ligada a una práctica
  scope TEXT NOT NULL CHECK (scope IN ('Nacional','Internacional')),
  modality TEXT NOT NULL CHECK (modality IN ('Presencial','Virtual','Mixta','No aplica')),
  activityName TEXT NOT NULL,         -- máx 5 palabras (validar en app)
  location TEXT NOT NULL,
  medium TEXT[] NOT NULL,             -- ['Teams','Zoom','Whatsapp','Meet','Presencial','Otro']
  directBeneficiaries INTEGER NOT NULL CHECK (directBeneficiaries>=0),
  strategicAxes TEXT[] NOT NULL,      -- Docencia, Investigación, Responsabilidad Social, Misional, Gestión
  areaResponsible TEXT NOT NULL,
  executingUnit TEXT NOT NULL,
  classification TEXT NOT NULL,       -- Evento/Curso/Reunión/Red/Estudios/Otro
  year INTEGER NOT NULL,
  semester SMALLINT NOT NULL CHECK (semester IN (1,2)),
  objective TEXT NOT NULL,
  description TEXT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  investedHours INTEGER NOT NULL CHECK (investedHours>=0),
  participants JSONB DEFAULT '[]',    -- nombres, cédulas (cifrar si aplica)
  evidences JSONB DEFAULT '[]',       -- urls/paths a fotos, actas, etc.
  metadata JSONB DEFAULT '{}',
  createdBy UUID NOT NULL REFERENCES "User"(id),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedBy UUID REFERENCES "User"(id),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sp_term ON "SocialProjection"(termId);
CREATE INDEX idx_sp_semester ON "SocialProjection"(year, semester);
CREATE INDEX idx_sp_axes_gin ON "SocialProjection" USING GIN (strategicAxes);
CREATE INDEX idx_sp_medium_gin ON "SocialProjection" USING GIN (medium);
CREATE INDEX idx_sp_metadata_gin ON "SocialProjection" USING GIN (metadata);
```

Esto cubre los campos del formulario institucional de **Proyección Social – Evento Cultural** para registro, beneficiarios, fechas y ejes estratégicos (lo que hoy diligencian en Google Forms).

---

# Siguiente bloque: **SNIES**

Para **reportes SNIES** consolidados, sugiere una tabla de “fotografía” del período más **vistas** de agregación. Empecemos por un “header” del reporte y sus líneas:

```sql
CREATE TABLE "SniesReport" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  termId UUID NOT NULL REFERENCES "Term"(id),
  generatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  generatedBy UUID NOT NULL REFERENCES "User"(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','final')),
  notes TEXT,
  payload JSONB DEFAULT '{}'   -- snapshot completo para trazabilidad (export base)
);

CREATE TABLE "SniesReportLine" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reportId UUID NOT NULL REFERENCES "SniesReport"(id) ON DELETE CASCADE,
  programId UUID NULL,                    -- si aplica
  centerType TEXT NOT NULL CHECK (centerType IN ('Congregation','Institution')),
  centerId UUID NULL,                     -- FK según tipo (modelable con vista)
  studentsCount INTEGER NOT NULL DEFAULT 0,
  avgGrade DECIMAL(3,2) NULL,
  attendancePct DECIMAL(5,2) NULL,
  activitiesCount INTEGER NOT NULL DEFAULT 0,  -- de proyección social vinculadas
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_snies_report_term ON "SniesReport"(termId,status);
CREATE INDEX idx_snies_line_report ON "SniesReportLine"(reportId);
```

Luego, definimos **vistas** que consoliden desde `Placement`, `EvaluationDetail` (cortes 1 y 2) y `SocialProjection`. El equipo de calidad puede seguir consultando desde la vista o desde exportadores a Excel/PDF. El origen institucional hoy apunta a formularios externos; la tabla y vistas facilitan **migrar a interno** y tener **historial de reportes generados**.

---

# Orden recomendado (bien corto y ejecutable)

1. Aplicar **ajustes menores** a `EvaluationDetail` (cortes, asistencia por sábados, unicidad, vista de compatibilidad).
2. Crear **SocialProjection** (es directa, mapea 1:1 con el formulario institucional).
3. Crear **SniesReport / SniesReportLine** + una vista base de consolidado (en otra iteración armamos el exportador).

Si te parece, te preparo **el prompt para Trae** con SOLO estas tres tareas en ese orden (para que lo ejecute de una). ¿Lo dejo listo así?
