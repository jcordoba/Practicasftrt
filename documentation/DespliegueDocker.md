# Despliegue de Backend con Docker y Prisma

Este documento describe cómo desplegar correctamente el backend del sistema **SION Prácticas FTR** usando Docker, Prisma y migraciones automáticas.

---

## 🧱 Requisitos Previos

- Docker y Docker Compose instalados
- Código fuente en la estructura esperada:
  ```
  apps/
    backend/
      prisma/
        migrations/
        schema.prisma
      src/
      Dockerfile
      .env
  ```

---

## 🚀 Despliegue completo

```bash
docker-compose down -v
docker-compose build --no-cache backend
docker-compose up -d
```

Esto:

1. Reconstruye completamente el contenedor del backend.
2. Aplica automáticamente las migraciones de Prisma.
3. Levanta el servidor backend en producción (puerto 3000 interno, 3001 externo).

---

## 🔍 Verificar migraciones

```bash
docker exec -it practicasftrt-postgres-1 psql -U postgres -d practicasftr
\dt
```

Deberías ver todas las tablas (`User`, `Role`, `Union`, etc).

---

## 🛑 Problemas comunes

- **Las tablas no aparecen**: asegúrate de que `COPY apps/backend/prisma ./prisma` esté en el `Dockerfile` (fase builder).
- **El build falla con `/# not found`**: nunca pongas comentarios en la misma línea de un `COPY`.

---
