# Public API Module

This module exposes public GET endpoints for assignments, students, and practices, supporting filtering by programId.

## Structure
- controllers/public.controller.ts
- services/public.service.ts
- services/public.service.test.ts

## Endpoints (to implement)
- GET /api/public/assignments?programId=...
- GET /api/public/students?programId=...
- GET /api/public/practices?programId=...

## Notes
- Endpoints should be documented in Swagger/OpenAPI.
- Add basic token or API Key protection for public endpoints.