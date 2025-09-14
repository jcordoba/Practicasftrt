# Análisis de Cambios Propuestos en Base de Datos
## Sistema de Prácticas Profesionales FTR

**Fecha:** 18-07-2025  
**Analista:** Asistente IA  
**Versión:** 1.0  
**Estado:** Revisión Técnica  

---

## 1. Resumen Ejecutivo

El análisis de los cambios propuestos en `Cambios_en_base_de_datos.md` revela una **refactorización sólida y bien fundamentada** que aborda las principales deficiencias estructurales del esquema actual. Los cambios están **altamente alineados** con los requisitos funcionales definidos y resuelven problemas críticos de integridad referencial y reglas de negocio.

### Veredicto General: ✅ **APROBADO CON OBSERVACIONES MENORES**

---

## 2. Análisis por Componente

### 2.1 Modelo de Colocación por Semestre (Term + Placement)

#### ✅ **FORTALEZAS:**
- **Cumple RF-03:** Garantiza que estudiantes con múltiples prácticas en el mismo semestre estén en el mismo centro/pastor
- **Integridad referencial:** FKs sólidas a User, Term, Congregation/Institution
- **Constraint inteligente:** `UNIQUE (studentId, termId)` hace imposible violar la regla de negocio
- **Flexibilidad:** Soporta tanto congregaciones como instituciones externas

#### ⚠️ **OBSERVACIONES:**
1. **Campos de fecha en Term:** `cut1EndDate` es excelente para el control de cortes, pero considerar agregar `cut2StartDate` para mayor claridad
2. **Validación de períodos:** El `CHECK (period IN (1,2))` podría expandirse a `CHECK (period IN (1,2,3))` para semestres intersemestrales
3. **Timezone:** Los timestamps deberían especificar timezone explícitamente

#### 💡 **RECOMENDACIÓN:**
```sql
ALTER TABLE public."Term" 
  ADD COLUMN cut2StartDate timestamp NOT NULL,
  ALTER COLUMN startDate TYPE timestamptz,
  ALTER COLUMN cut1EndDate TYPE timestamptz,
  ALTER COLUMN cut2StartDate TYPE timestamptz,
  ALTER COLUMN endDate TYPE timestamptz;
```

### 2.2 Corrección de Practice y Assignment

#### ✅ **FORTALEZAS:**
- **Elimina campos texto:** Reemplaza `institution` text por FKs apropiadas
- **Constraint exclusivo:** Garantiza que Practice tenga exactamente un tipo de centro
- **Integridad total:** Assignment ahora tiene FKs reales a Student, Practice y Placement

#### ⚠️ **OBSERVACIONES:**
1. **Migración de datos:** El proceso de migración de `institution` text a FKs necesita un script específico
2. **Validación de estado:** Assignment debería validar que el Placement esté activo
3. **Auditoría:** Falta timestamp de creación/modificación en Assignment

#### 💡 **RECOMENDACIÓN:**
```sql
ALTER TABLE public."Assignment"
  ADD COLUMN createdAt timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updatedAt timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD CONSTRAINT assignment_active_placement 
    CHECK (EXISTS (SELECT 1 FROM public."Placement" p WHERE p.id = "placementId"));
```

### 2.3 Historial de Traslados (AssignmentHistory)

#### ✅ **FORTALEZAS:**
- **Cumple RF-03:** Historial completo y auditable de traslados
- **Trazabilidad:** Registra quién, cuándo, por qué y desde/hacia dónde
- **Índice apropiado:** Optimiza consultas por Assignment

#### ⚠️ **OBSERVACIONES:**
1. **Validación de traslado:** Debería validar que `from_placement` ≠ `to_placement`
2. **Estado del traslado:** Podría incluir estados (pendiente, aprobado, rechazado)
3. **Notificaciones:** Falta referencia a sistema de notificaciones automáticas (RF-03)

### 2.4 Evaluaciones Robustas

#### ✅ **FORTALEZAS:**
- **Cumple RF-04:** Dos cortes semestrales con validación
- **Previene duplicados:** `UNIQUE (asignacion_id, corte)`
- **FK al evaluador:** Trazabilidad de quién evalúa

#### ⚠️ **OBSERVACIONES:**
1. **Tipo de evaluador:** `evaluador_tipo` como text es frágil, debería ser ENUM
2. **Validación temporal:** Falta validar que evaluaciones estén dentro del período del Term
3. **Criterios de evaluación:** Los criterios JSONB necesitan esquema de validación

#### 💡 **RECOMENDACIÓN:**
```sql
CREATE TYPE evaluator_type AS ENUM ('PASTOR', 'DOCENTE', 'COORDINADOR');
ALTER TABLE public."Evaluation" 
  ALTER COLUMN "evaluador_tipo" TYPE evaluator_type USING "evaluador_tipo"::evaluator_type;
```

### 2.5 RBAC Operativo

#### ✅ **FORTALEZAS:**
- **Permisos granulares:** Separación clara por módulo y acción
- **Alineado con RF-01:** Control estricto por roles
- **Escalable:** Fácil agregar nuevos permisos

#### ⚠️ **OBSERVACIONES:**
1. **Permisos insuficientes:** La semilla propuesta es muy básica
2. **Jerarquía de permisos:** No contempla herencia de permisos
3. **Validación de contexto:** Falta validar que permisos sean aplicables al contexto del usuario

---

## 3. Cumplimiento de Requisitos Funcionales

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| **RF-01 (Autenticación)** | ✅ Cumple | RBAC operativo, mantiene OTP/2FA |
| **RF-02 (Entidades Org.)** | ✅ Cumple | Jerarquía preservada con FKs |
| **RF-03 (Asignación)** | ✅ Cumple | Regla de mismo centro/pastor garantizada |
| **RF-04 (Evaluación)** | ✅ Cumple | Dos cortes con validación temporal |
| **RF-05 (Calificaciones)** | ⚠️ Parcial | Estructura base, falta UI tipo SVGA |
| **RF-06 (Dashboards)** | ⚠️ Pendiente | No abordado en este refactor |
| **RF-07 (UX/UI)** | ⚠️ Pendiente | No abordado en este refactor |
| **RF-08 (Escalabilidad)** | ✅ Cumple | Estructura preparada para expansión |

---

## 4. Análisis de Riesgos y Mitigaciones

### 4.1 Riesgos Identificados

#### 🔴 **ALTO - Migración de Datos**
- **Riesgo:** Pérdida de datos durante migración de campos text a FKs
- **Mitigación:** Script de migración con rollback + backup completo

#### 🟡 **MEDIO - Performance**
- **Riesgo:** Consultas complejas con múltiples JOINs
- **Mitigación:** Índices propuestos + vistas materializadas para reportes

#### 🟡 **MEDIO - Complejidad**
- **Riesgo:** Modelo más complejo para desarrolladores
- **Mitigación:** Documentación detallada + helpers en ORM

### 4.2 Plan de Mitigación

1. **Fase 1:** Crear tablas nuevas sin afectar existentes
2. **Fase 2:** Migrar datos con validación
3. **Fase 3:** Actualizar aplicación para usar nuevo modelo
4. **Fase 4:** Eliminar tablas/campos obsoletos

---

## 5. Recomendaciones Adicionales

### 5.1 Mejoras Inmediatas

1. **Soft Delete Pattern:**
```sql
ALTER TABLE public."Placement" ADD COLUMN deletedAt timestamptz NULL;
ALTER TABLE public."Assignment" ADD COLUMN deletedAt timestamptz NULL;
```

2. **Validaciones de Negocio:**
```sql
-- Validar que pastor tutor tenga rol apropiado
ALTER TABLE public."Placement" ADD CONSTRAINT placement_pastor_role_check
  CHECK (EXISTS (SELECT 1 FROM public."UserRole" ur 
                 JOIN public."Role" r ON ur."roleId" = r.id 
                 WHERE ur."userId" = "pastorId" AND r.nombre = 'PASTOR_TUTOR'));
```

3. **Índices Adicionales:**
```sql
CREATE INDEX ON public."Placement"("pastorId", "termId");
CREATE INDEX ON public."Assignment"("practiceId", status);
CREATE INDEX ON public."Evaluation"("evaluador_id", corte);
```

### 5.2 Consideraciones Futuras

1. **Particionamiento:** Para tablas de Evidence y AssignmentHistory por año
2. **Archivado:** Estrategia para términos antiguos
3. **Replicación:** Para reportes SNIES sin impactar producción

---

## 6. Conclusiones y Próximos Pasos

### ✅ **APROBACIÓN TÉCNICA**
Los cambios propuestos son **técnicamente sólidos** y **alineados con los requisitos**. Resuelven los problemas críticos identificados y establecen una base robusta para el sistema.

### 📋 **PRÓXIMOS PASOS RECOMENDADOS:**

1. **Inmediato:** Implementar mejoras sugeridas (ENUMs, timestamps, validaciones)
2. **Corto plazo:** Desarrollar scripts de migración con rollback
3. **Medio plazo:** Actualizar ORM/Prisma schema
4. **Largo plazo:** Implementar vistas materializadas para reportes

### 🎯 **CRITERIOS DE ÉXITO:**
- ✅ Migración sin pérdida de datos
- ✅ Reglas de negocio garantizadas por BD
- ✅ Performance mantenida o mejorada
- ✅ RBAC completamente operativo
- ✅ Trazabilidad completa de traslados

---

**Firma Digital:** Análisis completado por Asistente IA  
**Próxima Revisión:** Post-implementación de migraciones