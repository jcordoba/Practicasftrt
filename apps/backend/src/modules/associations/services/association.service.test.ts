import { describe, it, expect, beforeEach } from 'vitest';
import { AssociationService } from './association.service';

describe('AssociationService', () => {
  let service: AssociationService;

  beforeEach(() => {
    service = new AssociationService();
  });

  it('debería crear una asociación', () => {
    const assoc = service.create({ nombre: 'Asociación 1', unionId: 'u1' });
    expect(assoc).toHaveProperty('id');
    expect(assoc.nombre).toBe('Asociación 1');
    expect(assoc.unionId).toBe('u1');
    expect(assoc.estado).toBe('ACTIVO');
  });

  it('no permite nombres duplicados en la misma unión', () => {
    service.create({ nombre: 'Asociación 2', unionId: 'u2' });
    expect(() => service.create({ nombre: 'Asociación 2', unionId: 'u2' })).toThrow();
  });

  it('debería actualizar una asociación', () => {
    const assoc = service.create({ nombre: 'Asociación 3', unionId: 'u3' });
    const updated = service.update(assoc.id, { nombre: 'Asociación 3B' });
    expect(updated.nombre).toBe('Asociación 3B');
  });

  it('debería inactivar (soft delete) una asociación', () => {
    const assoc = service.create({ nombre: 'Asociación 4', unionId: 'u4' });
    const deleted = service.softDelete(assoc.id);
    expect(deleted).toBe(true);
    expect(service.findById(assoc.id)).toBeUndefined();
  });

  it('debería filtrar por unionId', () => {
    service.create({ nombre: 'A1', unionId: 'u5' });
    service.create({ nombre: 'A2', unionId: 'u6' });
    const filtered = service.findAll('u5');
    expect(filtered.length).toBe(1);
    expect(filtered[0].unionId).toBe('u5');
  });
});