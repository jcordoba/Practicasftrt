import { describe, it, expect, beforeEach } from 'vitest';
import { UnionService } from './union.service';

describe('UnionService', () => {
  let service: UnionService;

  beforeEach(() => {
    service = new UnionService();
  });

  it('debería crear una unión', () => {
    const union = service.create({ nombre: 'Unión Norte' });
    expect(union).toHaveProperty('id');
    expect(union.nombre).toBe('Unión Norte');
    expect(union.estado).toBe('ACTIVO');
  });

  it('no permite nombres duplicados', () => {
    service.create({ nombre: 'Unión Sur' });
    expect(() => service.create({ nombre: 'Unión Sur' })).toThrow();
  });

  it('debería actualizar una unión', () => {
    const union = service.create({ nombre: 'Unión Centro' });
    const updated = service.update(union.id, { nombre: 'Unión Centro Actualizada' });
    expect(updated.nombre).toBe('Unión Centro Actualizada');
  });

  it('debería inactivar (soft delete) una unión', () => {
    const union = service.create({ nombre: 'Unión Este' });
    const deleted = service.softDelete(union.id);
    expect(deleted.estado).toBe('INACTIVO');
  });

  it('debería filtrar por estado', () => {
    service.create({ nombre: 'Unión 1' });
    const u2 = service.create({ nombre: 'Unión 2' });
    service.softDelete(u2.id);
    const activos = service.findAll({ estado: 'ACTIVO' });
    const inactivos = service.findAll({ estado: 'INACTIVO' });
    expect(activos.length).toBe(1);
    expect(inactivos.length).toBe(1);
  });
});