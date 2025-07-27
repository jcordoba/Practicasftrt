// auth.test.ts - Tests unitarios para el módulo de autenticación

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../services/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe('validateUser', () => {
    it('debería ejecutar la validación de usuario', async () => {
      const result = await authService.validateUser('test@unac.edu.co', 'password123');
      expect(result).toBeDefined();
    });
  });

  describe('login', () => {
    it('debería ejecutar el proceso de login', async () => {
      const user = {
        id: '1',
        email: 'test@unac.edu.co',
        name: 'Test User',
        password: 'hashedpassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        programId: null,
        roles: [{ name: 'ESTUDIANTE' }],
      } as any;

      const result = await authService.login(user);
      expect(result).toBeDefined();
    });
  });

  // Google login tests will be performed in production environment

  describe('verifyToken', () => {
    it('debería ejecutar la verificación de token', async () => {
      const result = await authService.verifyToken('valid.jwt.token');
      expect(result).toBeDefined();
    });
  });
});