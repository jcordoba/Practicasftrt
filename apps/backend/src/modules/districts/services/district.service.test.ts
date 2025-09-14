import { describe, it, expect, beforeEach } from 'vitest';
import { DistrictService } from './district.service';

describe('DistrictService', () => {
  let service: DistrictService;

  beforeEach(() => {
    service = new DistrictService();
  });

  it('debería crear un distrito', async () => {
    const district = await service.create({ nombre: 'Distrito 1', associationId: 'a1' });
    expect(district).toHaveProperty('id');
    expect(district.nombre).toBe('Distrito 1');
    expect(district.associationId).toBe('a1');
    expect(district.estado).toBe('ACTIVO');
  });

  it('no permite nombres duplicados en la misma asociación', async () => {
    await service.create({ nombre: 'Distrito 2', associationId: 'a2' });
    await expect(service.create({ nombre: 'Distrito 2', associationId: 'a2' })).rejects.toThrow();
  });

  it('debería actualizar un distrito', async () => {
    const district = await service.create({ nombre: 'Distrito 3', associationId: 'a3' });
    const updated = await service.update(district.id, { nombre: 'Distrito 3B' });
    expect(updated.nombre).toBe('Distrito 3B');
  });

  it('debería inactivar (soft delete) un distrito', async () => {
    const district = await service.create({ nombre: 'Distrito 4', associationId: 'a4' });
    const deleted = await service.softDelete(district.id);
    expect(deleted).toBe(true);
    expect(await service.findById(district.id)).toBeUndefined();
  });

  it('debería filtrar por associationId', async () => {
    await service.create({ nombre: 'D1', associationId: 'a5' });
    await service.create({ nombre: 'D2', associationId: 'a6' });
    const filtered = await service.findAll('a5');
    expect(filtered.length).toBe(1);
    expect(filtered[0].associationId).toBe('a5');
  });
});