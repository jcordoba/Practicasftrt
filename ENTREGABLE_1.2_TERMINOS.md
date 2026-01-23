# Módulo de Términos Académicos - Entregable 1.2

## 📋 Descripción General

El módulo de **Términos Académicos** permite gestionar los períodos y semestres en los que se desarrollan las prácticas ministeriales. Es fundamental para el correcto funcionamiento del sistema, ya que proporciona el contexto temporal necesario para organizar las asignaciones y evaluaciones.

## ✅ Funcionalidades Implementadas

### 1. Backend - API REST

#### Modelos de Datos (DTOs)
- **CreateTermDto**: Validaciones para crear términos
  - `name`: Nombre único del término (ej: "2025-1")
  - `academicYear`: Año académico (mínimo 2020)
  - `academicPeriod`: Período (1 o 2)
  - `startDate`: Fecha de inicio del término
  - `endDate`: Fecha de fin del término
  - `status`: Estado (ACTIVE, INACTIVE, COMPLETED)

- **UpdateTermDto**: Versión opcional del CreateTermDto para actualizaciones

#### Servicios (Business Logic)
Ubicación: `apps/backend/src/modules/terms/services/term.service.ts`

**Métodos implementados:**

1. `create()`: Crear nuevo término académico
   - Valida que el nombre sea único
   - Valida que endDate sea posterior a startDate
   - Crea el término con estado inicial

2. `findAll()`: Obtener todos los términos
   - Filtros por: academicYear, status
   - Ordenados por año y período descendente

3. `findById()`: Obtener un término específico
   - Incluye relaciones: placements y evaluationDetails
   - Retorna información detallada del término

4. `getActiveTerm()`: Obtener el término activo actual
   - Retorna el término marcado como ACTIVE
   - Solo puede haber un término activo a la vez

5. `update()`: Actualizar un término
   - Valida que el nuevo nombre sea único
   - Valida fechas si se actualizan

6. `setActive()`: Marcar un término como activo
   - Desactiva todos los demás términos
   - Activa el término seleccionado

7. `changeStatus()`: Cambiar estado de un término
   - Valida que no haya asignaciones activas antes de completar/desactivar
   - Actualiza el estado

8. `getTermStats()`: Obtener estadísticas de un término
   - Total de asignaciones
   - Asignaciones activas
   - Asignaciones completadas
   - Total de evaluaciones

#### Controladores (REST Endpoints)
Ubicación: `apps/backend/src/modules/terms/controllers/term.controller.ts`

**Endpoints implementados:**

| Método | Ruta | Descripción | Roles Permitidos |
|--------|------|-------------|------------------|
| POST | `/api/terms` | Crear nuevo término | COORDINADOR, ADMIN |
| GET | `/api/terms` | Listar términos con filtros | Todos autenticados |
| GET | `/api/terms/active` | Obtener término activo | Todos autenticados |
| GET | `/api/terms/:id` | Obtener término por ID | Todos autenticados |
| GET | `/api/terms/:id/stats` | Obtener estadísticas | COORDINADOR, ADMIN |
| PUT | `/api/terms/:id` | Actualizar término | COORDINADOR, ADMIN |
| PATCH | `/api/terms/:id/activate` | Marcar como activo | COORDINADOR, ADMIN |
| PATCH | `/api/terms/:id/status` | Cambiar estado | COORDINADOR, ADMIN |

#### Rutas y Seguridad
Ubicación: `apps/backend/src/routes/term.routes.ts`

- ✅ Todas las rutas protegidas con JWT
- ✅ Operaciones de escritura restringidas a COORDINADOR_PRACTICAS y ADMINISTRADOR_TECNICO
- ✅ Operaciones de lectura disponibles para todos los roles autenticados
- ✅ Documentación Swagger incluida

### 2. Frontend - Interfaz de Usuario

#### Página Principal
Ubicación: `apps/frontend/src/pages/dashboard/coordinador/terms.tsx`

**Características:**

1. **Tabla de términos**
   - Columnas: Nombre, Año, Período, Fecha Inicio, Fecha Fin, Estado
   - Estados visuales con badges de colores
   - Acciones por fila: Editar, Activar, Completar

2. **Filtros avanzados**
   - Filtro por año académico
   - Filtro por estado (ACTIVE, INACTIVE, COMPLETED)
   - Botón "Aplicar Filtros" para actualizar lista

3. **Formulario de creación/edición**
   - Campos validados:
     - Nombre del término
     - Año académico (2020-2030)
     - Período académico (1 o 2)
     - Fecha de inicio
     - Fecha de fin
     - Estado
   - Validaciones del lado del cliente
   - Modo creación y edición en el mismo formulario

4. **Gestión de estados**
   - Botón "Activar" para marcar un término como activo
   - Botón "Completar" para finalizar un término activo
   - Confirmaciones antes de cambios críticos

5. **Diseño UI/UX**
   - Glassmorphism y gradientes consistentes con el diseño del proyecto
   - Responsive design para móviles y tablets
   - Mensajes de éxito y error
   - Loading states

#### Integración en Dashboard
Ubicación: `apps/frontend/src/pages/dashboard/coordinador.tsx`

- ✅ Nueva tarjeta "Términos Académicos" en sección de Gestión Organizacional
- ✅ Icono: 📅
- ✅ Descripción: "Gestionar períodos y semestres académicos"
- ✅ Grid actualizado a 3 columnas (Centers, Terms, Jerarquía)

## 🔄 Flujo de Trabajo

### Crear un nuevo término académico:
1. Coordinador accede a Dashboard → Términos Académicos
2. Click en "+ Nuevo Término"
3. Completa el formulario:
   - Nombre: "2025-1"
   - Año: 2025
   - Período: 1 (Primer Semestre)
   - Fecha inicio: 2025-02-01
   - Fecha fin: 2025-06-30
   - Estado: ACTIVE
4. Click en "Crear"
5. El sistema crea el término y lo marca como activo

### Activar un término existente:
1. Coordinador navega a la tabla de términos
2. Localiza el término deseado
3. Click en "Activar"
4. Confirma la acción
5. El sistema desactiva todos los demás términos y marca este como activo

### Completar un término:
1. Coordinador localiza el término activo
2. Click en "Completar"
3. Sistema valida que no haya asignaciones activas
4. Cambia el estado a COMPLETED

## 📁 Estructura de Archivos

```
apps/backend/src/
├── modules/terms/
│   ├── dtos/
│   │   └── term.dto.ts              ✅ DTOs con validaciones
│   ├── services/
│   │   └── term.service.ts          ✅ Lógica de negocio (8 métodos)
│   └── controllers/
│       └── term.controller.ts       ✅ Controladores REST (8 endpoints)
└── routes/
    └── term.routes.ts               ✅ Rutas con RBAC

apps/frontend/src/pages/dashboard/coordinador/
├── terms.tsx                        ✅ Página CRUD completa
└── coordinador.tsx                  ✅ Actualizado con link

apps/backend/src/
└── index.ts                         ✅ Rutas registradas
```

## 🧪 Pruebas Manuales Realizadas

### Backend
✅ Servidor inicia correctamente en puerto 3001
✅ Rutas registradas: `/api/terms`
✅ Prisma Client reconoce modelo Term
✅ Sin errores de compilación TypeScript

### Frontend
⏳ Pendiente de prueba en navegador

## 🔐 Seguridad

- ✅ JWT requerido en todas las rutas
- ✅ RBAC implementado (solo coordinadores y administradores pueden crear/editar)
- ✅ Validaciones de entrada en DTOs
- ✅ Validaciones de negocio en servicios

## 📊 Modelo de Datos

El modelo `Term` ya existía en Prisma Schema:

```prisma
model Term {
  id             String   @id @default(cuid())
  name           String   @unique
  academicYear   Int
  academicPeriod Int
  startDate      DateTime
  endDate        DateTime
  status         String   @default("ACTIVE")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  evaluationDetails EvaluationDetail[]
  placements        Placement[]

  @@index([academicYear])
  @@index([academicPeriod])
  @@index([status])
  @@index([startDate, endDate])
}
```

## 🎯 Próximos Pasos

1. **Pruebas en navegador**:
   - Verificar funcionamiento de todos los filtros
   - Probar creación, edición y activación de términos
   - Validar diseño responsive

2. **Mejoras futuras** (fuera del MVP):
   - Selector de término activo en header global
   - Dashboard de estadísticas por término
   - Exportación de reportes por término
   - Calendario visual de términos

## 📝 Notas de Implementación

- **Validación de fechas**: El sistema valida que endDate sea posterior a startDate
- **Término activo único**: Solo puede haber un término ACTIVE a la vez
- **Soft delete**: No se eliminan físicamente, solo se cambian estados
- **Protección de integridad**: No se puede completar un término con asignaciones activas

## ✨ Características Destacadas

1. **Gestión inteligente de estados**: El sistema garantiza que solo haya un término activo
2. **Validaciones robustas**: Fechas, nombres únicos, estados válidos
3. **Estadísticas integradas**: Endpoint para obtener métricas de cada término
4. **UI consistente**: Mismo diseño glassmorphism que módulo de centros
5. **Filtros eficientes**: Búsqueda por año y estado
6. **RBAC granular**: Permisos diferenciados para lectura y escritura

---

**Estado**: ✅ **COMPLETADO**  
**Fecha**: 21 de enero de 2025  
**Desarrollador**: GitHub Copilot  
**Versión**: 1.0
