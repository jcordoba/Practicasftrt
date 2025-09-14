# 🛡️ Guía de Desarrollo Seguro - Sistema de Autenticación

## 🎯 Objetivo

Esta guía asegura que los desarrolladores puedan agregar nuevas funcionalidades sin romper el sistema de autenticación que funciona correctamente.

## 📚 Documentación de Referencia

- **Solución técnica:** `docs/solucion-logout-automatico.md`
- **Configuración crítica:** `docs/configuracion-critica.md`
- **Esta guía:** Mejores prácticas para desarrollo

## 🔄 Flujo de Desarrollo Recomendado

### 1. Antes de Empezar
```bash
# Verificar que el sistema funciona
docker ps
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sion.com","password":"admin"}'
```

### 2. Durante el Desarrollo
- ✅ Usar `UserRepository` para operaciones de usuario
- ✅ Nunca usar `prisma.user` directamente
- ✅ Validar `user.estado === 'ACTIVO'` antes de operaciones sensibles
- ✅ Usar `user.isActive` en lógica de aplicación
- ✅ Usar `user.name` en respuestas de API

### 3. Después de Cambios
```bash
# Reconstruir si modificaste backend
docker-compose up --build -d backend

# Probar flujo completo
# 1. Login
# 2. Obtener OTP
# 3. Verificar OTP
# 4. Usar token
```

## 🧩 Patrones de Código Seguros

### ✅ Patrón Correcto - Operaciones de Usuario
```typescript
// En cualquier servicio o controlador
export class MiServicio {
  constructor(
    private userRepository: UserRepository // ✅ Usar repository
  ) {}

  async miMetodo(userId: string) {
    // ✅ Usar repository con normalización automática
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // ✅ Usar campos normalizados
    if (!user.isActive) {
      throw new Error('Usuario inactivo');
    }

    // ✅ Usar name normalizado
    return {
      message: `Hola ${user.name}`,
      isActive: user.isActive
    };
  }
}
```

### ❌ Patrón Incorrecto - NO HACER
```typescript
// ❌ NO HACER ESTO
export class MiServicio {
  constructor(
    private prisma: PrismaService // ❌ Evitar uso directo
  ) {}

  async miMetodo(userId: string) {
    // ❌ Prisma directo sin normalización
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    // ❌ isActive será undefined
    if (!user.isActive) { // ❌ ESTO FALLARÁ
      throw new Error('Usuario inactivo');
    }

    // ❌ nombre puede ser undefined
    return {
      message: `Hola ${user.name}`, // ❌ ESTO PUEDE FALLAR
      isActive: user.isActive // ❌ ESTO SERÁ undefined
    };
  }
}
```

## 🔐 Patrones de Autenticación

### ✅ Validación Correcta de Estado
```typescript
// En auth.controller.ts o servicios similares
async login(email: string, password: string) {
  const user = await this.userRepository.findByEmail(email);
  
  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // ✅ SIEMPRE validar estado antes de continuar
  if (user.estado !== 'ACTIVO') {
    throw new UnauthorizedException('Usuario inactivo');
  }

  // Continuar con validación de password...
}
```

### ✅ Creación de Usuarios
```typescript
async createUser(userData: CreateUserDto) {
  const newUser = await this.userRepository.create({
    ...userData,
    estado: 'ACTIVO', // ✅ SIEMPRE establecer estado explícitamente
    // otros campos...
  });

  // El repository ya normaliza automáticamente
  return newUser; // Tendrá isActive: true y name normalizado
}
```

## 🧪 Testing Recomendado

### Test de Integración - Autenticación
```typescript
describe('Authentication Flow', () => {
  it('should complete full auth flow', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@sion.com', password: 'admin' })
      .expect(200);

    expect(loginResponse.body.message).toBe('OTP sent to your email');

    // 2. Get OTP from database
    const otp = await getLatestOtp('admin@sion.com');

    // 3. Verify OTP
    const verifyResponse = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'admin@sion.com', otp })
      .expect(200);

    expect(verifyResponse.body.token).toBeDefined();

    // 4. Use token (should not logout automatically)
    const protectedResponse = await request(app)
      .get('/api/protected-endpoint')
      .set('Authorization', `Bearer ${verifyResponse.body.token}`)
      .expect(200);

    // ✅ Si llegamos aquí, no hay logout automático
  });
});
```

### Test Unitario - UserRepository
```typescript
describe('UserRepository', () => {
  it('should normalize user data correctly', async () => {
    const user = await userRepository.findByEmail('test@example.com');
    
    // ✅ Verificar normalización
    expect(user.isActive).toBeDefined();
    expect(user.name).toBeDefined();
    expect(typeof user.isActive).toBe('boolean');
    
    // ✅ Verificar mapeo correcto
    if (user.estado === 'ACTIVO') {
      expect(user.isActive).toBe(true);
    } else {
      expect(user.isActive).toBe(false);
    }
  });
});
```

## 🚨 Señales de Alerta

### Durante Desarrollo:
- ❌ Error: "Cannot read property 'isActive' of undefined"
- ❌ Error: "Cannot read property 'name' of undefined"
- ❌ Usuario activo recibe "Usuario inactivo"
- ❌ Logout automático después del login
- ❌ Tokens que expiran en 1 hora

### Soluciones Rápidas:
1. **Verificar normalización:** ¿Estás usando UserRepository?
2. **Verificar validaciones:** ¿Validaste user.estado antes del token?
3. **Reconstruir backend:** `docker-compose up --build -d backend`
4. **Revisar variables de entorno:** ¿JWT_EXPIRES_IN=7d?

## 📋 Checklist Pre-Deploy

### Antes de hacer merge/deploy:
- [ ] ✅ Tests de autenticación pasan
- [ ] ✅ Flujo completo login → OTP → token funciona
- [ ] ✅ No hay logout automático
- [ ] ✅ UserRepository.normalizeUser() intacto
- [ ] ✅ Validaciones de estado en auth.controller.ts intactas
- [ ] ✅ Variables de entorno correctas
- [ ] ✅ Backend reconstruido si hubo cambios

### Comando de Verificación Rápida:
```bash
# Script de verificación completa
#!/bin/bash
echo "🔍 Verificando sistema de autenticación..."

# 1. Verificar contenedores
docker ps | grep -E "backend|postgres" || echo "❌ Contenedores no están corriendo"

# 2. Probar login
echo "📧 Probando login..."
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sion.com","password":"admin"}' | grep -q "OTP sent" && echo "✅ Login OK" || echo "❌ Login FAIL"

echo "🎉 Verificación completada"
```

## 🤝 Colaboración en Equipo

### Al Revisar Pull Requests:
1. **Buscar cambios en archivos críticos:**
   - `user.repository.ts`
   - `auth.controller.ts`
   - Variables de entorno
   - Schema de base de datos

2. **Preguntas clave:**
   - ¿Se mantiene la normalización?
   - ¿Se preservan las validaciones de estado?
   - ¿Se probó el flujo completo?

3. **Solicitar pruebas:**
   - Screenshot del login funcionando
   - Logs del backend sin errores
   - Confirmación de que no hay logout automático

---

## 📞 Contacto y Soporte

**En caso de dudas o problemas:**
1. Revisar esta documentación
2. Ejecutar comandos de verificación
3. Revisar logs: `docker logs practicasftrt-backend-1`
4. Consultar con el equipo antes de modificar código crítico

---

**Recuerda:** Un sistema que funciona es más valioso que uno "perfecto" pero roto. Preserva la funcionalidad existente mientras agregas nuevas características.

**Última actualización:** Enero 2025  
**Mantenido por:** Equipo de Desarrollo  
**Estado:** ✅ Sistema estable y funcionando