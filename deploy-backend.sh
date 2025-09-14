#!/bin/bash
# deploy-backend.sh

echo "🛑 Deteniendo contenedores y eliminando volúmenes..."
docker-compose down -v

echo "🛠 Reconstruyendo backend sin caché..."
docker-compose build --no-cache backend

echo "🚀 Levantando entorno..."
docker-compose up -d

echo "✅ Despliegue completado. Ejecuta:"
echo "docker exec -it practicasftrt-postgres-1 psql -U postgres -d practicasftr"
echo "para verificar las tablas con el comando: \\dt"
