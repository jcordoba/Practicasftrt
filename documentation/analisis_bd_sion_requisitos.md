# Análisis BD Actual vs Requisitos Oficiales SION Prácticas FTR

## 📊 Estado Actual de la Base de Datos

### Tablas Principales Existentes

#### 1. **Assignment** (Sistema Legacy)
```sql
- id (text, NOT NULL)
- estudiante_id (text, NOT NULL)
- practica_id (text, NOT NULL)
- centro_id (text, NOT NULL)
- programId (text, NULLABLE)
- fecha_inicio (timestamp, NULLABLE)
- estado (USER-DEFINED, NOT NULL)
- usuario_asignador (text, NOT NULL)
- fecha_creacion (timestamp, NOT NULL)
- fecha_actualizacion (timestamp, NOT NULL)
```

#### 2. **Placement** (Sistema Refactorizado)
```sql
- id (text, NOT NULL)
- studentId (text, NOT NULL)
- termId (text, NOT NULL)
- centerId (text, NOT NULL)
- pastorId (text, NOT NULL)
- programId (text, NULLABLE)
- startDate (timestamp, NOT NULL)
- endDate (timestamp, NOT NULL)
- status (text, NOT NULL)
- assignedBy (text, NOT NULL)
- createdAt (timestamp, NOT NULL)
- updatedAt (timestamp, NOT NULL)
- metadata (jsonb, NULLABLE)
```

#### 3. **Evaluation** (Sistema Actual)
```sql
- id (text, NOT NULL)
- asignacion_id (text, NOT NULL)
- corte (integer, NOT NULL)
- fecha (timestamp, NOT NULL)
- evaluador_id (text, NOT NULL)
- nota (double precision, NOT NULL)
- criterios (jsonb, NOT NULL)
- observaciones (text, NOT NULL)
- programId (text, NULLABLE)
- creado_por (text, NOT NULL)
- fecha_creacion (timestamp, NOT NULL)
- actualizado_por (text, NULLABLE)
- fecha_actualizacion (timestamp, NOT NULL)
- metadata (jsonb, NULLABLE)
```

#### 4. **Term** (Sistema Refactorizado)
```sql
- id (text, NOT NULL)
- name (text, NOT NULL)
- startDate (timestamp, NOT NULL)
- endDate (timestamp, NOT NULL)
- academicYear (integer, NOT NULL)
- period (integer, NOT NULL)
- status (text, NOT NULL)
- createdAt (timestamp, NOT NULL)
- updatedAt (timestamp, NOT NULL)
```

## 🎯 Requisitos Oficiales SION vs Estado Actual

### 1. **EVALUACIONES DETALLADAS DE PRÁCTICAS**

| Requisito Oficial | Tabla Actual | Gap Detectado |
|-------------------|--------------|---------------|
| **Dimensiones de evaluación específicas** | `Evaluation.criterios` (JSONB) | ❌ **FALTA**: Estructura formal para dimensiones (Académica, Pastoral, Social, Administrativa) |
| **Control de asistencia detallado** | No existe | ❌ **FALTA**: Tabla para registro de asistencia diaria/semanal |
| **Observaciones por dimensión** | `Evaluation.observaciones` (texto general) | ❌ **FALTA**: Observaciones específicas por cada dimensión |
| **Evaluaciones por cortes académicos** | `Evaluation.corte` | ✅ **EXISTE** |
| **Múltiples evaluadores** | `Evaluation.evaluador_id` | ⚠️ **PARCIAL**: Solo un evaluador por evaluación |
| **Historial de cambios** | `Evaluation.metadata` | ⚠️ **PARCIAL**: No hay estructura formal de auditoría |

### 2. **ACTIVIDADES DE PROYECCIÓN SOCIAL**

| Requisito Oficial | Tabla Actual | Gap Detectado |
|-------------------|--------------|---------------|
| **Registro de actividades sociales** | No existe | ❌ **FALTA**: Tabla completa para proyección social |
| **Eventos culturales y comunitarios** | No existe | ❌ **FALTA**: Categorización de eventos |
| **Participantes y beneficiarios** | No existe | ❌ **FALTA**: Registro de impacto social |
| **Recursos utilizados** | No existe | ❌ **FALTA**: Control de recursos y presupuesto |
| **Evidencias documentales** | No existe | ❌ **FALTA**: Almacenamiento de evidencias |
| **Vinculación con prácticas** | No existe | ❌ **FALTA**: Relación práctica ↔ actividad social |

### 3. **REPORTES SNIES (Sistema Nacional de Información)**

| Requisito Oficial | Tabla Actual | Gap Detectado |
|-------------------|--------------|---------------|
| **Consolidación automática** | No existe | ❌ **FALTA**: Sistema de reportes consolidados |
| **Indicadores de calidad** | No existe | ❌ **FALTA**: Métricas y KPIs automatizados |
| **Datos estadísticos** | No existe | ❌ **FALTA**: Agregaciones por programa/período |
| **Exportación oficial** | No existe | ❌ **FALTA**: Formatos oficiales SNIES |
| **Trazabilidad de reportes** | No existe | ❌ **FALTA**: Historial de reportes generados |
| **Validación de datos** | No existe | ❌ **FALTA**: Reglas de negocio para validación |

## 🔧 Estructuras Requeridas (Nuevas Tablas)

### 1. **EvaluationDetail** - Evaluaciones Granulares
**Propósito**: Reemplazar/complementar la tabla `Evaluation` con estructura más detallada

**Campos Requeridos**:
- Dimensiones específicas (Académica, Pastoral, Social, Administrativa)
- Control de asistencia integrado
- Observaciones por dimensión
- Múltiples evaluadores
- Evidencias documentales

### 2. **SocialProjection** - Proyección Social
**Propósito**: Gestionar actividades de impacto social y comunitario

**Campos Requeridos**:
- Tipos de actividad (Cultural, Comunitaria, Educativa, Salud)
- Participantes y beneficiarios
- Recursos y presupuesto
- Evidencias y documentación
- Vinculación con prácticas

### 3. **SniesReport** - Reportes Oficiales
**Propósito**: Generar reportes consolidados para el Sistema Nacional

**Campos Requeridos**:
- Agregaciones automáticas
- Indicadores de calidad
- Datos estadísticos
- Formatos de exportación
- Trazabilidad completa

## 📈 Impacto y Beneficios

### Beneficios Inmediatos
1. **Cumplimiento normativo** con requisitos oficiales SION
2. **Trazabilidad completa** de evaluaciones y actividades
3. **Reportes automatizados** para entes de control
4. **Mejor gestión** de proyección social
5. **Indicadores de calidad** en tiempo real

### Compatibilidad
- ✅ **Mantiene** todas las funcionalidades actuales
- ✅ **Preserva** datos existentes mediante vistas de compatibilidad
- ✅ **Extiende** capacidades sin romper APIs existentes
- ✅ **Migración gradual** sin interrupciones

## 🚀 Próximos Pasos

1. **Diseñar estructuras detalladas** para las 3 nuevas tablas
2. **Crear migraciones Prisma** con las nuevas estructuras
3. **Generar SQL de migración** compatible con PostgreSQL
4. **Implementar vistas de compatibilidad** para APIs existentes
5. **Crear funciones de migración** de datos legacy

---
**Fecha de Análisis**: 18 de Agosto 2025  
**Estado**: Análisis completado - Listo para diseño de estructuras