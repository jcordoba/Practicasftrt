# Arquitectura SION Prácticas FTR

## Modelo extendido: Multi-programa

```
Program ──< User ──< Practice
           │         │
           └─────────┘
```
- **Program**: Representa un programa académico (carrera). Tiene relación 1:N con usuarios y prácticas.
- **User**: Puede ser estudiante, docente, tutor, coordinador, etc. Relacionado opcionalmente a un programa.
- **Practice**: Práctica profesional o social, relacionada a un estudiante, tutor y docente, y opcionalmente a un programa.

## Decisiones de arquitectura
- Se modularizó el backend por funcionalidad: users, programs, practices, assignments, reports, evidences, evaluations, roles.
- Todas las entidades clave soportan el campo `programId` para queries y validaciones multicarrea.
- Los servicios y controladores validan la existencia del programa al crear o actualizar entidades.
- Los endpoints permiten filtrar por programa (`GET /practices?programId=...`).
- Seeder inicial para programas en `prisma/seed.ts`.

## ADRs relevantes
- **Soporte multicarrea**: Se optó por un modelo relacional flexible, permitiendo que usuarios y prácticas pertenezcan a un programa, pero manteniendo compatibilidad con datos previos (programId opcional).
- **Modularización**: Cada módulo tiene controller, service, dto, entity y test, facilitando mantenibilidad y escalabilidad.
- **API pública**: Se exponen endpoints públicos filtrables por programa, protegidos por token/API Key y documentados con OpenAPI.

---

Para detalles adicionales, ver los archivos ADR en este directorio.