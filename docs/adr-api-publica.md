# ADR: API Pública para Integración Externa

## Contexto
El sistema debe exponer endpoints públicos para integraciones externas, permitiendo consultar asignaciones, estudiantes y prácticas filtradas por programa.

## Decisión
- Se implementan endpoints públicos documentados bajo `/api/public/`.
- Endpoints principales: `GET /assignments?programId=...`, `GET /students?programId=...`, `GET /practices?programId=...`.
- Se protege el acceso mediante token o API Key.
- Se documentan los endpoints, filtros y ejemplos con OpenAPI/Swagger.

## Consecuencias
- Permite integraciones seguras con sistemas externos.
- Facilita la interoperabilidad y reporte institucional.
- Requiere mantener la documentación y seguridad actualizadas.