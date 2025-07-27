# Sistema de Gestión de Prácticas FTRT

Sistema de gestión de prácticas para la Facultad de Teología, Filosofía y Humanidades de la UNAC, desarrollado con arquitectura modular y autenticación basada en roles.

## 🚀 Características

- **Autenticación Multi-modal**: Login local y Google OAuth
- **Control de Acceso Basado en Roles (RBAC)**: 6 roles predefinidos
- **Arquitectura Modular**: Separación clara de responsabilidades
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Testing**: Suite completa de tests unitarios con Vitest
- **Validación**: DTOs con class-validator
- **Seguridad**: Hashing de contraseñas con bcrypt, JWT tokens

## 📋 Roles del Sistema

1. **ESTUDIANTE** - Estudiantes del sistema
2. **PASTOR_TUTOR** - Pastores tutores
3. **DOCENTE** - Docentes del sistema
4. **COORDINADOR** - Coordinadores académicos
5. **DECANO** - Decanos de facultad
6. **ADMIN_TECNICO** - Administradores técnicos

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js con TypeScript (SSR habilitado)
- **Backend**: Node.js con TypeScript usando Express
- **Base de Datos**: PostgreSQL con Prisma como ORM
- **Autenticación**: Passport.js (Local + Google OAuth)
- **Testing**: Vitest para unitarios, Cypress opcional para integración
- **Validación**: class-validator
- **Herramientas**: ESLint, Prettier, Husky + lint-staged, Conventional Commits

## 📁 Estructura del Proyecto

```
/apps
  /frontend      # Proyecto Next.js (interfaz mobile-first, institucional)
  /backend       # API REST modular en Express
    /src
      /modules
        /auth        # Autenticación y autorización
        /users       # Gestión de usuarios
        /roles       # Gestión de roles
        /assignments # Asignaciones de prácticas
        /evaluations # Evaluaciones
        /programs    # Programas académicos (multicarrea)
        /practices   # Prácticas (vinculadas a programas)
        /public      # API pública (GET filtrado por programId)
/packages
  /shared        # Tipos, DTOs, validaciones y utilidades compartidas
/infra
  /database      # Prisma (esquema, migraciones, seeders)
  /scripts       # Scripts de desarrollo y despliegue
/tests          # Pruebas e2e y utilidades de testing global
```

## 🚀 Configuración Inicial

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd practicasftrt
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Configurar las siguientes variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/practicasftrt"
   JWT_SECRET="your-super-secret-jwt-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Configurar la base de datos**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

## 🧪 Testing

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Generar reporte de cobertura
```bash
npm run coverage
```

### Tests implementados
- **Users**: `apps/backend/src/modules/users/tests/user.test.ts`
- **Roles**: `apps/backend/src/modules/roles/tests/role.test.ts`
- **Auth**: `apps/backend/src/modules/auth/tests/auth.test.ts`
- **Assignments**: `apps/backend/src/modules/assignments/services/assignment.service.test.ts`
- **Evaluations**: `apps/backend/src/modules/evaluations/services/evaluation.service.test.ts`
- **Programs**: `apps/backend/src/modules/programs/services/program.service.test.ts`
- **Practices**: `apps/backend/src/modules/practices/services/practice.service.test.ts`
- **Public API**: `apps/backend/src/modules/public/controllers/public.controller.test.ts`

## 🔐 Autenticación

- **Login principal**: Google Workspace SSO (@unac.edu.co)
- **Login alternativo**: Solo administrador puede crear usuarios locales
- **RBAC**: Control de acceso basado en roles con 6 niveles
- **JWT**: Tokens con expiración de 24 horas
- **Validación**: Dominio institucional obligatorio (@unac.edu.co)

## 🛡️ Seguridad Implementada

- Contraseñas hasheadas con bcrypt (salt rounds: 10)
- Tokens JWT con expiración configurable
- Validación de dominio de email institucional
- Middleware RBAC para control de acceso
- Validación de usuario activo en autenticación
- DTOs con validaciones robustas

## 📄 Documentación y API

- Documentación técnica y ADRs en `/docs/`
- Swagger/OpenAPI: Integración pendiente en `apps/backend/src/swagger.ts`
- Endpoints públicos bajo `/api/public/` con filtro `programId`