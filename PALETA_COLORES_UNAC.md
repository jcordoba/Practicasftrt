# Paleta de Colores - SION Prácticas FTR (UNAC)

Este documento define la paleta de colores institucional utilizada en el sistema SION Prácticas FTR.

## Colores Institucionales UNAC

### Primarios
- **Azul Institucional**: `#003875` (Tailwind: `bg-blue-900`)
  - Uso: Headers, navegación principal, elementos de marca
  - Ejemplo: Header principal, títulos de sección

- **Dorado Institucional**: `#FDB913` (Tailwind: `bg-yellow-500`)
  - Uso: Botones de acción principales, elementos destacados
  - Ejemplo: Botón "Crear Usuario", badges importantes

## Colores de Estado

### Estados de Actividad
- **Verde (Activo/Éxito)**: `bg-green-100 text-green-800 border-green-300`
  - Uso: Estados activos, operaciones exitosas, confirmaciones
  - Ejemplo: Badge "Activo", práctica en curso

- **Rojo (Inactivo/Error/Admin)**: `bg-red-100 text-red-800 border-red-300`
  - Uso: Estados inactivos, errores, rol administrador técnico
  - Ejemplo: Badge "Inactivo", mensajes de error

- **Azul (Completado/Info)**: `bg-blue-100 text-blue-800 border-blue-300`
  - Uso: Estados completados, información general, rol coordinador
  - Ejemplo: Badge "Completado", estadísticas totales

- **Amarillo (Pendiente/Advertencia)**: `bg-yellow-100 text-yellow-800 border-yellow-300`
  - Uso: Estados pendientes, advertencias, pastor tutor
  - Ejemplo: Badge "Pendiente", alertas

- **Naranja (En proceso)**: `bg-orange-100 text-orange-800 border-orange-300`
  - Uso: Procesos en curso, asignaciones pendientes
  - Ejemplo: Estadísticas de asignaciones pendientes

- **Morado (Transferido/Docente)**: `bg-purple-100 text-purple-800 border-purple-300`
  - Uso: Estados transferidos, rol docente, métricas especiales
  - Ejemplo: Badge de transferencia, estadísticas completadas

## Roles y Colores Asociados

### Badges de Roles
```tsx
const roleBadgeColors = {
  ADMINISTRADOR_TECNICO: 'bg-red-100 text-red-900 border border-red-300',
  COORDINADOR_PRACTICAS: 'bg-blue-100 text-blue-900 border border-blue-300',
  ESTUDIANTE: 'bg-green-100 text-green-900 border border-green-300',
  DOCENTE: 'bg-purple-100 text-purple-900 border border-purple-300',
  PASTOR: 'bg-orange-100 text-orange-900 border border-orange-300',
  PASTOR_TUTOR: 'bg-yellow-100 text-yellow-900 border border-yellow-300'
};
```

## Componentes de UI

### Tarjetas de Estadísticas
- **Fondo**: `bg-white` con sombra `shadow-lg`
- **Borde izquierdo**: `border-l-4` con color según métrica
  - Azul (`border-blue-600`): Totales generales
  - Verde (`border-green-600`): Éxitos, activos
  - Amarillo (`border-yellow-500`): Pendientes, esta semana
  - Morado (`border-purple-500`): Completados especiales
  - Naranja (`border-orange-500`): Pendientes de acción

### Fondos de Aplicación
- **Fondo General**: `bg-gradient-to-br from-gray-50 to-gray-100`
  - Uso: Fondos de páginas principales
  - Efecto: Gradiente sutil de gris claro

- **Header**: `bg-blue-900 bg-opacity-90 backdrop-blur-lg`
  - Uso: Barra de navegación superior
  - Efecto: Azul institucional con efecto glassmorphism

### Botones

#### Botón Primario (Acción Principal)
```tsx
className="bg-yellow-500 text-blue-900 hover:bg-yellow-600"
```

#### Botón Secundario
```tsx
className="bg-blue-600 text-white hover:bg-blue-700"
```

#### Botón Cancelar/Volver
```tsx
className="bg-gray-500 text-white hover:bg-gray-600"
```

#### Botón Peligro/Eliminar
```tsx
className="bg-red-600 text-white hover:bg-red-700"
```

## Estados de Placement (Asignación)

```tsx
const statusStyles = {
  ACTIVE: 'bg-green-100 text-green-900 border border-green-400',
  COMPLETED: 'bg-blue-100 text-blue-900 border border-blue-400',
  CANCELLED: 'bg-red-100 text-red-900 border border-red-400',
  PENDING: 'bg-yellow-100 text-yellow-900 border border-yellow-400',
  TRANSFERRED: 'bg-purple-100 text-purple-900 border border-purple-400'
};
```

## Guías de Uso

### ✅ Usar para:
- **Azul institucional**: Elementos de marca, navegación principal, títulos
- **Dorado institucional**: CTAs principales, elementos que requieren acción inmediata
- **Verde**: Confirmaciones, estados activos, éxitos
- **Rojo**: Errores, alertas críticas, eliminaciones
- **Amarillo**: Advertencias, pendientes, información temporal

### ❌ Evitar:
- Usar colores brillantes saturados (usar tonos 100-900 de Tailwind)
- Mezclar más de 3 colores en un mismo componente
- Usar gradientes de colores en tarjetas de contenido (solo en fondos)

## Accesibilidad

Todos los colores cumplen con:
- **Contraste WCAG AA**: Mínimo 4.5:1 para texto normal
- **Contraste WCAG AA**: Mínimo 3:1 para texto grande
- **Estados claros**: Uso de iconos además de color para indicar estados

## Actualización

Última actualización: Enero 2025
Versión: 1.0
Autor: Equipo SION Prácticas FTR
