Arrancamos con auditoría de la base de datos (archivo practicasftr_backup.sql). Aquí va un diagnóstico claro + refactor propuesto del esquema, todo aterrizado a los requisitos que ya definieron (dos cortes, seguimiento por pastor, traslados, jerarquía Unión→Asociación→Distrito→Congregación, posibilidad de institución externa y proyección social) .

Resultado de la auditoría (backup actual)
Resumen técnico

Tablas clave: User, Role, Permission, RolePermission, UserRole, Union, Association, District, Congregation (esCentroPractica), Institution (esCentroPractica), Program, Practice, Assignment, Evaluation, Evidence, PracticeReport, OtpCode.

PK/FK:

Bien: cadena jerárquica Unión→Asociación→Distrito→Congregación con FKs; Practice referencia User (student/teacher/tutor) y Program; Evaluation/Evidence referencian Assignment.

Débil: Assignment solo tiene FK a Program; los campos estudiante_id, practica_id, centro_id son text sin FK.

Datos cargados (backup): Role (6), User (1), UserRole (1), OtpCode (16); el resto vacío (catálogos, prácticas, evaluaciones, etc.).

Enums útiles ya creados: PracticeStatus, AssignmentStatus, EvidenceStatus.

RBAC: tablas listas, pero Permission y RolePermission sin datos (permisos no operativos).

Cumplimiento vs requisitos (qué cubre y qué no)

Jerarquía organizacional y centros de práctica: existe y con FKs; Congregation/Institution traen esCentroPractica ✅ (permite “iglesia o institución”).

Asignación y traslados: insuficiente. Falta ligar asignación a estudiante/práctica/centro por FK y auditar traslados. La regla de negocio “si un estudiante cursa dos prácticas en el mismo semestre, deben ser en la misma iglesia/pastor” no es exigible con el modelo actual (no hay término/semestre ni agrupador de colocación) .

Evaluación de 2 cortes por pastor: estructura base (Evaluation.corte, criterios JSONB) ✅, pero sin FK de evaluador_id a User, ni restricción de unicidad (asignacion_id, corte); hoy esto se gestiona en Google Forms y hoja de cálculo .

Evidencias: tabla robusta (estado, ubicacion, timestamps) ✅; falta FK de quién sube (solo subido_por texto).

Autenticación: OTP/2FA operativo (tabla OtpCode) ✅, acorde a tu decisión de enfocarnos aquí primero.

Reportes/SNIES: sin vistas ni exports aún; hoy se alimenta por formularios externos (pendiente para una fase siguiente) .

Proyección social: el formulario existe afuera; no hay tablas nativas para integrarlo (fase posterior) .

Hallazgos críticos (para refactor)

Assignment sin integridad referencial

Campos estudiante_id, practica_id, centro_id son texto. Producen incoherencias: no podemos asegurar que un centro exista ni que la práctica/estudiante sean válidos.

Centro de práctica “texto” en Practice

Columna Practice.institution es text. Debe ser FK a Institution o Congregation (solo una de las dos).

Regla de negocio del semestre (dos prácticas en el mismo semestre ⇒ mismo centro/pastor)

No hay entidad término/semestre ni agrupador de colocación que permita enforzar esa regla .

Evaluaciones

Falta FK evaluador_id → User, restricción CHECK (corte IN (1,2)), y UNIQUE (asignacion_id, corte) para evitar duplicados por corte (el formulario de “segundo corte” está estandarizado) .

RBAC incompleto

Permission/RolePermission vacíos ⇒ el control fino por permisos no opera (solo roles semilla).

Indices

No hay índices secundarios para consultas típicas (por semestre, por centro, por estado), lo que degradará rendimiento cuando carguemos datos.

Refactor propuesto (solo base de datos, sin tocar Google SSO)

Objetivo: cerrar brechas estructurales para que asignaciones, evaluación en dos cortes y evidencias funcionen con integridad, y para que podamos aplicar la regla del semestre y los traslados.

A. Modelo de “colocación” por semestre

Introduce Term y Placement:

-- 1) Periodo académico
CREATE TABLE public."Term" (
  id text PRIMARY KEY,
  year int NOT NULL,
  period int NOT NULL CHECK (period IN (1,2)),
  startDate timestamp NOT NULL,
  cut1EndDate timestamp NOT NULL,  -- fin de los primeros 6 sábados
  endDate timestamp NOT NULL
);

-- 2) Colocación del estudiante en un centro para un término
CREATE TABLE public."Placement" (
  id text PRIMARY KEY,
  "studentId" text NOT NULL REFERENCES public."User"(id),
  "termId" text NOT NULL REFERENCES public."Term"(id),
  "congregationId" text NULL REFERENCES public."Congregation"(id),
  "institutionId" text NULL REFERENCES public."Institution"(id),
  "pastorId" text NOT NULL REFERENCES public."User"(id),   -- pastor tutor
  CHECK (("congregationId" IS NULL) <> ("institutionId" IS NULL)),
  UNIQUE ("studentId","termId")  -- **enforce** una sola colocación por semestre
);


Con esto, si un estudiante lleva dos prácticas en el mismo semestre, ambas apuntan a la misma Placement ⇒ misma iglesia/pastor por definición (regla exigida en reunión) .

B. Enderezar Practice y Assignment
-- Practice: reemplazar texto por FKs opcionales al centro (una sola)
ALTER TABLE public."Practice"
  ADD COLUMN "congregationId" text NULL REFERENCES public."Congregation"(id),
  ADD COLUMN "institutionId"  text NULL REFERENCES public."Institution"(id),
  ADD CONSTRAINT practice_center_oneof CHECK (
    ("congregationId" IS NULL) <> ("institutionId" IS NULL)
  );

-- (dato) migrar valores de "institution" textual si aplica, y luego:
ALTER TABLE public."Practice" DROP COLUMN "institution";

-- Assignment: renombrar y poner FKs coherentes
ALTER TABLE public."Assignment"
  ADD COLUMN "studentId"  text NOT NULL REFERENCES public."User"(id),
  ADD COLUMN "practiceId" text NOT NULL REFERENCES public."Practice"(id),
  ADD COLUMN "placementId" text NOT NULL REFERENCES public."Placement"(id),
  DROP COLUMN "estudiante_id",
  DROP COLUMN "practica_id",
  DROP COLUMN "centro_id";

-- Traslados auditables
CREATE TABLE public."AssignmentHistory" (
  id text PRIMARY KEY,
  "assignmentId" text NOT NULL REFERENCES public."Assignment"(id),
  from_placement text NOT NULL REFERENCES public."Placement"(id),
  to_placement   text NOT NULL REFERENCES public."Placement"(id),
  reason text NOT NULL,
  movedBy text NOT NULL REFERENCES public."User"(id),
  movedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ON public."AssignmentHistory"("assignmentId");

C. Evaluaciones y evidencias robustas
-- Evaluación: enforzar cortes y evaluador
ALTER TABLE public."Evaluation"
  ADD CONSTRAINT eval_corte_ck CHECK (corte IN (1,2)),
  ADD COLUMN "evaluador_tipo" text NOT NULL DEFAULT 'PASTOR', -- o enum
  ADD CONSTRAINT eval_evaluador_fk FOREIGN KEY ("evaluador_id") REFERENCES public."User"(id),
  ADD CONSTRAINT eval_unique_bycut UNIQUE ("asignacion_id", corte);

-- Evidence: quién sube y relación con término (si se quiere)
ALTER TABLE public."Evidence"
  ADD CONSTRAINT evidence_uploader_fk FOREIGN KEY (subido_por) REFERENCES public."User"(id);


Nota: los dos cortes (6+6 sábados) están contemplados en Term.cut1EndDate; eso nos permite bloquear el envío del corte 1 pasado ese hito y calcular notas por corte como piden los formatos actuales .

D. RBAC utilizable desde ya
-- Semilla mínima de permisos (ejemplo)
INSERT INTO public."Permission"(id,nombre,modulo,accion,estado,fecha_creacion,fecha_actualizacion)
VALUES
  ('perm_users_read','Usuarios: ver','USUARIOS','READ','ACTIVO',NOW(),NOW()),
  ('perm_assign_write','Asignaciones: crear/editar','ASIGNACIONES','WRITE','ACTIVO',NOW(),NOW()),
  ('perm_eval_write','Evaluaciones: crear/editar','EVALUACIONES','WRITE','ACTIVO',NOW(),NOW()),
  ('perm_evid_review','Evidencias: revisar','EVIDENCIAS','REVIEW','ACTIVO',NOW(),NOW());

-- Asignar a roles existentes
-- (ejemplo) COORDINADOR_PRACTICAS obtiene assign/eval/evid
-- (ejemplo) PASTOR_TUTOR obtiene eval_write, evid_review

E. Índices que vas a necesitar
CREATE INDEX ON public."Assignment"("studentId");
CREATE INDEX ON public."Assignment"("placementId");
CREATE INDEX ON public."Placement"("termId");
CREATE INDEX ON public."Placement"("congregationId");
CREATE INDEX ON public."Evaluation"("asignacion_id", corte);
CREATE INDEX ON public."Evidence"("asignacion_id", estado);

Qué gana el proyecto con este refactor

Integridad fuerte: no más IDs “sueltos”; todo con FK.

Regla institucional exigible: una sola colocación por estudiante/semestre garantiza misma iglesia/pastor para múltiples prácticas simultáneas .

Evaluación de 2 cortes alineada al proceso real y sin duplicados (formulario de corte ya estandarizado) .

Soporte a traslados con historial auditable (lo que se hace hoy de forma manual, pero el sistema lo registra).

Base lista para integrar proyección social y reportes SNIES en siguientes iteraciones (ya contemplados en el flujo actual) .

Siguiente tarea (te propongo esto ya mismo)

Aplicar migraciones A–E (no tocan autenticación Google; mantenemos OTP/2FA tal como acordaste).

Sembrar catálogos mínimos (Unión, 2 Asociaciones, Distritos y unas 3–5 Congregaciones con esCentroPractica = true; 1 Institution = AWR Colombia).

Sembrar Term actual (2025–2 con cut1EndDate = fin de los primeros 6 sábados).

Sembrar permisos base y vincularlos a tus 6 roles.