// role.test.ts - Tests unitarios para el módulo de roles

import { describe, it, expect } from 'vitest';
import { RoleService } from '../services/role.service';

describe('RoleService', () => {
  describe('Class Structure', () => {
    it('debería crear una instancia de RoleService', () => {
      const roleService = new RoleService();
      expect(roleService).toBeInstanceOf(RoleService);
    });

    it('debería tener los métodos requeridos', () => {
      const roleService = new RoleService();
      expect(typeof roleService.getAllRoles).toBe('function');
      expect(typeof roleService.findByName).toBe('function');
      expect(typeof roleService.getRoleById).toBe('function');
      expect(typeof roleService.seedRoles).toBe('function');
    });
  });
});