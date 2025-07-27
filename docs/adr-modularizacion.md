# ADR: Modularización del Backend

## Contexto
Para facilitar el mantenimiento, escalabilidad y pruebas, el backend debe estar organizado por módulos funcionales.

## Decisión
- Se estructuró `/apps/backend/src/modules/` en subcarpetas por funcionalidad: users, programs, practices, assignments, reports, evidences, evaluations, roles.
- Cada módulo contiene: controller, service, dto, entity y test.
- Se promueve la separación de responsabilidades y la reutilización de lógica.

## Consecuencias
- El código es más mantenible y escalable.
- Permite equipos trabajar en paralelo en diferentes módulos.
- Facilita la integración de nuevas funcionalidades y pruebas unitarias.