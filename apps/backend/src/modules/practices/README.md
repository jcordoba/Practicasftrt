# Practices Module

This module manages practices (internships/fieldwork) and supports multicarrea via the programId field.

## Structure
- controllers/practice.controller.ts
- services/practice.service.ts
- dtos/practice.dto.ts
- entities/practice.entity.ts
- services/practice.service.test.ts

## Endpoints (to implement)
- GET /practices
- GET /practices/:id
- POST /practices
- PUT /practices/:id
- DELETE /practices/:id

## Notes
- programId is optional but used for filtering and creation.
- Add validation to ensure programId exists when referenced.