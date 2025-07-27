import { describe, it, expect, beforeEach } from 'vitest';
import { InstitutionService } from './institution.service';

describe('InstitutionService', () => {
  let service: InstitutionService;

  beforeEach(() => {
    service = new InstitutionService();
  });

  it('debería crear una institución', () => {
    const institution = service.create({ nombre: 'Institución 1', esCentroPractica: true });
    expect(institution).toHaveProperty('id');
    expect(institution.nombre).toBe('Institución 1');
    expect(institution.esCentroPractica).toBe(true);
    expect(institution.estado).toBe('ACTIVO');
  });

  it('no permite nombres duplicados', () => {
    service.create({ nombre: 'Institución 2', esCentroPractica: false });
    expect(() => service.create({ nombre: 'Institución 2', esCentroPractica: true })).toThrow();
  });

  it('debería actualizar una institución', () => {
    const institution = service.create({ nombre: 'Institución 3', esCentroPractica: false });
    const updated = service.update(institution.id, { nombre: 'Institución 3B', esCentroPractica: true });
    expect(updated.nombre).toBe('Institución 3B');
    expect(updated.esCentroPractica).toBe(true);
  });

  it('debería inactivar (soft delete) una institución', () => {
    const institution = service.create({ nombre: 'Institución 4', esCentroPractica: false });
    const deleted = service.softDelete(institution.id);
    expect(deleted).toBe(true);
    expect(service.findById(institution.id)).toBeUndefined();
  });

  it('debería listar solo instituciones activas', () => {
    service.create({ nombre: 'I1', esCentroPractica: true });
    service.create({ nombre: 'I2', esCentroPractica: false });
    const all = service.findAll();
    expect(all.length).toBe(2);
    expect(all.every(i => i.estado === 'ACTIVO')).toBe(true);
  });
});