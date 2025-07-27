# ADR: Soporte Multicarrea (Multi-programa)

## Contexto
El sistema SION Prácticas FTR debe escalar para soportar múltiples carreras/programas académicos, permitiendo filtrar, asignar y reportar prácticas por programa.

## Decisión
- Se agregó el modelo `Program` en Prisma, relacionado con `User` y `Practice`.
- Se añadió el campo opcional `programId` en las entidades y DTOs de usuario, práctica, asignación y evaluación.
- Los servicios y controladores validan la existencia del programa al crear o actualizar entidades.
- Los endpoints permiten filtrar por programa (`GET /practices?programId=...`).
- El seeder inicializa programas base.

## Consecuencias
- El sistema es ahora multicarrea y escalable.
- Se mantiene compatibilidad con datos previos (programId opcional).
- Permite futuras integraciones externas y reportes por programa.