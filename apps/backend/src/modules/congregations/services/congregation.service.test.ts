import { describe, it, expect, beforeEach } from 'vitest';
import { CongregationService } from './congregation.service';

describe('CongregationService', () => {
  let service: CongregationService;

  beforeEach(() => {
    service = new CongregationService();
  });

  it('debería crear una congregación', () => {
    const congregation = service.create({ nombre: 'Congregación 1', districtId: 'd1', esCentroPractica: true });
    expect(congregation).toHaveProperty('id');
    expect(congregation.nombre).toBe('Congregación 1');
    expect(congregation.districtId).toBe('d1');
    expect(congregation.esCentroPractica).toBe(true);
    expect(congregation.estado).toBe('ACTIVO');
  });

  it('no permite nombres duplicados en el mismo distrito', () => {
    service.create({ nombre: 'Congregación 2', districtId: 'd2', esCentroPractica: false });
    expect(() => service.create({ nombre: 'Congregación 2', districtId: 'd2', esCentroPractica: true })).toThrow();
  });

  it('debería actualizar una congregación', () => {
    const congregation = service.create({ nombre: 'Congregación 3', districtId: 'd3', esCentroPractica: false });
    const updated = service.update(congregation.id, { nombre: 'Congregación 3B', esCentroPractica: true });
    expect(updated.nombre).toBe('Congregación 3B');
    expect(updated.esCentroPractica).toBe(true);
  });

  it('debería inactivar (soft delete) una congregación', () => {
    const congregation = service.create({ nombre: 'Congregación 4', districtId: 'd4', esCentroPractica: false });
    const deleted = service.softDelete(congregation.id);
    expect(deleted).toBe(true);
    expect(service.findById(congregation.id)).toBeUndefined();
  });

  it('debería filtrar por districtId', () => {
    service.create({ nombre: 'C1', districtId: 'd5', esCentroPractica: true });
    service.create({ nombre: 'C2', districtId: 'd6', esCentroPractica: false });
    const filtered = service.findAll('d5');
    expect(filtered.length).toBe(1);
    expect(filtered[0].districtId).toBe('d5');
  });
});