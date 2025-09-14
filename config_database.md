# Configuración de Base de Datos - Sistema de Prácticas FTR

## Información Crítica de la Base de Datos

**⚠️ IMPORTANTE: El nombre real de la base de datos es `practicasftr` (sin 't' al final)**

### Detalles de Conexión
- **Nombre de la base de datos**: `practicasftr`
- **Usuario**: `postgres`
- **Puerto**: `5432`
- **Contenedor Docker**: `practicasftrt-postgres-1`

### Comandos de Conexión Correctos

```bash
# Conectar a la base de datos desde Docker
docker exec -it practicasftrt-postgres-1 psql -U postgres -d practicasftr

# Ejecutar scripts SQL
Get-Content script.sql | docker exec -i practicasftrt-postgres-1 psql -U postgres -d practicasftr

# Backup de la base de datos
docker exec practicasftrt-postgres-1 pg_dump -U postgres -d practicasftr > backup.sql
```

### Historial de Errores Comunes
- ❌ `practicasftrt` (con 't' extra al final) - **INCORRECTO**
- ✅ `practicasftr` - **CORRECTO**

### Verificación de Conexión
Para verificar que estás conectado a la base de datos correcta:
```sql
SELECT current_database();
```

### Scripts de Refactoring Actualizados
Todos los scripts de refactoring han sido actualizados para incluir el nombre correcto de la base de datos en sus comentarios:

1. `fase1_nuevas_tablas.sql` ✅
2. `fase2_poblacion_inicial.sql` ✅  
3. `fase3_triggers_validaciones.sql` ✅

### Notas para el Desarrollo
- Siempre verificar el nombre de la base de datos antes de ejecutar comandos
- Mantener esta documentación actualizada
- Revisar los scripts antes de la ejecución para evitar errores de conexión