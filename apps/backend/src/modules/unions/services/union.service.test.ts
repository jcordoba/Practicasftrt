import { describe, it, expect, beforeEach } from 'vitest';
import { UnionService } from './union.service';

describe('UnionService', () => {
  let service: UnionService;

  beforeEach(() => {
    service = new UnionService();
  });

  it('debería crear una unión', async () => {
    const union = await service.create({ nombre: 'Unión Norte' });
    expect(union).toHaveProperty('id');
    expect(union.nombre).toBe('Unión Norte');
    expect(union.estado).toBe('ACTIVO');
  });

  it('no permite nombres duplicados', async () => {
    await service.create({ nombre: 'Unión Sur' });
    await expect(service.create({ nombre: 'Unión Sur' })).rejects.toThrow();
  });

  it('debería actualizar una unión', async () => {
    const union = await service.create({ nombre: 'Unión Centro' });
    const updated = await service.update(union.id, { nombre: 'Unión Centro Actualizada' });
    expect(updated.nombre).toBe('Unión Centro Actualizada');
  });

  it('debería inactivar (soft delete) una unión', async () => {
    const union = await service.create({ nombre: 'Unión Este' });
    const deleted = await service.softDelete(union.id);
    expect(deleted.estado).toBe('INACTIVO');
  });

  it('debería filtrar por estado', async () => {
    await service.create({ nombre: 'Unión 1' });
    const u2 = await service.create({ nombre: 'Unión 2' });
    await service.softDelete(u2.id);
    const activos = await service.findAll({ estado: 'ACTIVO' });
    const inactivos = await service.findAll({ estado: 'INACTIVO' });
    expect(activos.length).toBe(1);
    expect(inactivos.length).toBe(1);
  });
});