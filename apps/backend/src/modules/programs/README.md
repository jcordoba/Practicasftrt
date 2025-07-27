# Programs Module

This module handles CRUD operations for academic programs and supports filtering by programId for multicarrea functionality.

## Structure
- controllers/program.controller.ts
- services/program.service.ts
- dtos/program.dto.ts
- entities/program.entity.ts
- services/program.service.test.ts

## Endpoints (to implement)
- GET /programs
- GET /programs/:id
- POST /programs
- PUT /programs/:id
- DELETE /programs/:id

## Notes
- Supports programId as a filter for related entities.
- Add validation to ensure programId exists when referenced.