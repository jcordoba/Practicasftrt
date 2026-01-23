# Checklist de Despliegue - SION Prácticas FTR MVP

## Pre-Despliegue

### 🔍 Verificaciones de Código

#### Backend
- [x] Compilación exitosa sin errores TypeScript
- [x] Variables de entorno documentadas
- [x] Conexión a base de datos configurada
- [x] Autenticación JWT implementada
- [x] Middleware RBAC funcionando
- [x] Validaciones de datos implementadas
- [x] Manejo de errores consistente
- [ ] Variables de producción configuradas (.env.production)
- [ ] Logs de error configurados

#### Frontend
- [x] Compilación exitosa sin errores TypeScript
- [x] Build de producción generado
- [x] Variables de entorno configuradas
- [x] Rutas protegidas implementadas
- [x] Manejo de estados de carga
- [x] Mensajes de error amigables
- [x] Diseño responsive verificado
- [ ] Meta tags SEO añadidos
- [ ] Favicon configurado

### 📊 Base de Datos

#### Schema Prisma
- [x] Modelos definidos correctamente
- [x] Relaciones configuradas
- [x] Enums declarados
- [ ] Índices de rendimiento añadidos
- [ ] Backup de schema realizado

#### Migraciones
- [ ] Migración inicial creada
- [ ] Migración probada en ambiente de pruebas
- [ ] Script de rollback preparado
- [ ] Datos de prueba (seed) preparados

#### Datos Iniciales
- [ ] Roles creados (6 roles básicos)
- [ ] Usuario administrador creado
- [ ] Términos académicos cargados
- [ ] Centros de práctica cargados (si aplica)

---

## Configuración de Ambientes

### 🌐 Variables de Entorno

#### Backend (.env)
```bash
# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/db_name"

# JWT
JWT_SECRET="tu-secreto-super-seguro-cambiar-en-produccion"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="https://tu-dominio-frontend.com"

# Puerto
PORT=3001

# Email (si aplica)
SMTP_HOST="smtp.ejemplo.com"
SMTP_PORT=587
SMTP_USER="tu-email@unac.edu.pe"
SMTP_PASS="tu-contraseña"
```

#### Frontend (.env.local)
```bash
# API Backend
NEXT_PUBLIC_API_URL="https://api.tu-dominio.com"

# Otros
NEXT_PUBLIC_APP_NAME="SION Prácticas FTR"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### ☁️ Servidor / Hosting

#### Requisitos Mínimos:
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado
- [ ] PM2 o similar para process management
- [ ] Nginx o Apache como reverse proxy
- [ ] SSL/TLS certificado configurado
- [ ] Firewall configurado (puertos 80, 443, 5432)
- [ ] Memoria RAM: 2GB mínimo
- [ ] Disco: 10GB mínimo

#### Servicios Recomendados:
- [ ] Backend: Heroku, Railway, DigitalOcean, AWS
- [ ] Frontend: Vercel, Netlify, Heroku
- [ ] Base de Datos: Railway, Supabase, AWS RDS

---

## Despliegue

### 📦 Backend

#### Pasos:
1. [ ] Clonar repositorio en servidor
   ```bash
   git clone https://github.com/tu-org/practicasftrt.git
   cd practicasftrt/apps/backend
   ```

2. [ ] Instalar dependencias
   ```bash
   npm install --production
   ```

3. [ ] Configurar variables de entorno
   ```bash
   cp .env.example .env
   nano .env  # Editar con valores de producción
   ```

4. [ ] Compilar TypeScript
   ```bash
   npm run build
   ```

5. [ ] Ejecutar migraciones de Prisma
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. [ ] Cargar datos iniciales (seed)
   ```bash
   npm run seed  # Si existe script
   ```

7. [ ] Iniciar aplicación con PM2
   ```bash
   pm2 start dist/index.js --name "sion-backend"
   pm2 save
   pm2 startup  # Configurar inicio automático
   ```

8. [ ] Verificar que está corriendo
   ```bash
   pm2 status
   curl http://localhost:3001/health  # Si existe endpoint
   ```

### 🌐 Frontend

#### Opción 1: Vercel (Recomendado)
1. [ ] Conectar repositorio a Vercel
2. [ ] Configurar variables de entorno en Vercel dashboard
3. [ ] Configurar build command: `npm run build`
4. [ ] Configurar output directory: `.next`
5. [ ] Deploy automático desde main branch

#### Opción 2: Manual
1. [ ] Build de producción
   ```bash
   cd apps/frontend
   npm install
   npm run build
   ```

2. [ ] Copiar archivos al servidor
   ```bash
   scp -r .next/ user@servidor:/var/www/sion-frontend/
   scp -r public/ user@servidor:/var/www/sion-frontend/
   scp package*.json user@servidor:/var/www/sion-frontend/
   ```

3. [ ] Instalar dependencias en servidor
   ```bash
   ssh user@servidor
   cd /var/www/sion-frontend
   npm install --production
   ```

4. [ ] Iniciar con PM2
   ```bash
   pm2 start npm --name "sion-frontend" -- start
   pm2 save
   ```

### 🔐 Nginx Reverse Proxy

1. [ ] Crear archivo de configuración
   ```bash
   sudo nano /etc/nginx/sites-available/sion-practicas
   ```

2. [ ] Configuración ejemplo:
   ```nginx
   # Backend API
   server {
       listen 80;
       server_name api.tu-dominio.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }

   # Frontend
   server {
       listen 80;
       server_name tu-dominio.com www.tu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. [ ] Habilitar sitio
   ```bash
   sudo ln -s /etc/nginx/sites-available/sion-practicas /etc/nginx/sites-enabled/
   sudo nginx -t  # Verificar configuración
   sudo systemctl reload nginx
   ```

4. [ ] Configurar SSL con Let's Encrypt
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com -d api.tu-dominio.com
   ```

---

## Post-Despliegue

### ✅ Verificaciones Funcionales

#### Backend
- [ ] Health check responde: `GET /health` o similar
- [ ] Login funciona: `POST /api/auth/login`
- [ ] Endpoints protegidos requieren token
- [ ] CORS permite requests del frontend
- [ ] Logs se están generando correctamente
- [ ] Base de datos conecta correctamente

#### Frontend
- [ ] Página de login carga
- [ ] Assets (CSS, JS, imágenes) cargan
- [ ] Autenticación funciona end-to-end
- [ ] Navegación entre páginas funciona
- [ ] Formularios envían datos correctamente
- [ ] Mensajes de error se muestran
- [ ] Responsive en móvil funciona

### 🧪 Pruebas de Usuario

#### Flujo de Administrador
- [ ] Login como admin
- [ ] Crear nuevo usuario
- [ ] Asignar roles a usuario
- [ ] Ver listado de usuarios
- [ ] Editar usuario existente
- [ ] Desactivar/activar usuario

#### Flujo de Coordinador
- [ ] Login como coordinador
- [ ] Crear centro de práctica
- [ ] Crear término académico
- [ ] Crear asignación de estudiante
- [ ] Ver reportes de estudiantes
- [ ] Validar evidencias

#### Flujo de Estudiante
- [ ] Login como estudiante
- [ ] Ver mis prácticas asignadas
- [ ] Crear reporte semanal
- [ ] Ver historial de reportes
- [ ] Ver horas acumuladas

### 📊 Monitoreo

#### Herramientas Recomendadas:
- [ ] PM2 Monitoring: `pm2 monit`
- [ ] Logs Backend: `pm2 logs sion-backend`
- [ ] Logs Frontend: `pm2 logs sion-frontend`
- [ ] Logs Nginx: `tail -f /var/log/nginx/error.log`
- [ ] Base de datos: Herramienta de monitoreo del proveedor

#### Métricas a Vigilar:
- [ ] Uso de CPU (< 70%)
- [ ] Uso de Memoria (< 80%)
- [ ] Tiempo de respuesta API (< 500ms)
- [ ] Errores 5xx en logs (0 idealmente)
- [ ] Conexiones activas a DB (< límite)

### 🔒 Seguridad

- [ ] JWT_SECRET es seguro y único
- [ ] Variables sensibles no están en el código
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado en producción
- [ ] Headers de seguridad configurados (helmet)
- [ ] Rate limiting implementado (si aplica)
- [ ] Backups automáticos de BD configurados
- [ ] Política de contraseñas fuertes habilitada

---

## Rollback

### 🔄 Plan de Contingencia

En caso de problemas críticos:

1. [ ] Detener servicios
   ```bash
   pm2 stop sion-backend sion-frontend
   ```

2. [ ] Restaurar backup de BD (si aplica)
   ```bash
   psql -U user -d db_name < backup_YYYYMMDD.sql
   ```

3. [ ] Revertir código a versión anterior
   ```bash
   git checkout [commit-hash-anterior]
   npm install
   npm run build
   ```

4. [ ] Reiniciar servicios
   ```bash
   pm2 restart sion-backend sion-frontend
   ```

---

## Documentación

### 📚 Recursos Creados
- [x] README.md principal
- [x] RESUMEN_EJECUTIVO_MVP.md
- [x] PALETA_COLORES_UNAC.md
- [x] CHECKLIST_DESPLIEGUE.md (este archivo)
- [ ] Manual de usuario (PDF)
- [ ] Guía de administrador (PDF)
- [ ] Video tutorial (opcional)

### 👥 Capacitación

- [ ] Sesión de capacitación para administradores
- [ ] Sesión de capacitación para coordinadores
- [ ] Sesión de capacitación para estudiantes
- [ ] Material de referencia entregado
- [ ] Canal de soporte definido

---

## Contactos y Soporte

### 🆘 Canales de Soporte
- Email: [tu-email@unac.edu.pe]
- Teléfono: [número de contacto]
- Horario: [horario de atención]

### 📞 Escalamiento
1. Nivel 1: Usuario final → Coordinador
2. Nivel 2: Coordinador → Administrador técnico
3. Nivel 3: Administrador técnico → Equipo de desarrollo

---

## Notas Finales

### ✨ Mejores Prácticas
- Realizar despliegues en horarios de bajo tráfico
- Mantener backups antes de cada despliegue
- Documentar todos los cambios en CHANGELOG
- Versionar releases (Git tags)
- Comunicar mantenimientos con anticipación

### 📝 Registro de Despliegues

| Fecha | Versión | Responsable | Notas |
|-------|---------|-------------|-------|
| [DD/MM/YYYY] | 1.0.0 | [Nombre] | Despliegue inicial MVP |

---

**Fecha Creación**: Enero 2025  
**Última Actualización**: Enero 2025  
**Versión**: 1.0  
**Estado**: ✅ Listo para uso
