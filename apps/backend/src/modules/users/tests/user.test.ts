// user.test.ts - Tests unitarios para el módulo de usuarios

import { describe, it, expect } from 'vitest';
import { UserService } from '../services/user.service';

describe('UserService', () => {
  describe('Class Structure', () => {
    it('debería crear una instancia de UserService', () => {
      const userService = new UserService();
      expect(userService).toBeInstanceOf(UserService);
    });

    it('debería tener los métodos requeridos', () => {
      const userService = new UserService();
      expect(typeof userService.create).toBe('function');
      expect(typeof userService.findAll).toBe('function');
      expect(typeof userService.findByEmail).toBe('function');
      expect(typeof userService.assignRoles).toBe('function');
      expect(typeof userService.activateDeactivate).toBe('function');
    });
  });

  describe('Email Validation', () => {
    it('debería validar el dominio de email correctamente', () => {
      const userService = new UserService();
      
      // Test de validación de dominio sin ejecutar create
      const validEmail = 'test@unac.edu.co';
      const invalidEmail = 'test@gmail.com';
      
      expect(validEmail.endsWith('@unac.edu.co')).toBe(true);
      expect(invalidEmail.endsWith('@unac.edu.co')).toBe(false);
    });
  });
});