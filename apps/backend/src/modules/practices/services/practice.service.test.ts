import { describe, it, expect, beforeEach } from 'vitest';
import { PracticeService } from './practice.service';

describe('PracticeService', () => {
  let service: PracticeService;
  beforeEach(() => {
    service = new PracticeService();
  });

  it('debe crear una práctica y recuperarla', async () => {
    const created = await service.create({ name: 'Práctica', programId: 'progA' });
    expect(created).toHaveProperty('id');
    const found = await service.findOne(created.id);
    expect(found).toMatchObject({ name: 'Práctica', programId: 'progA' });
  });

  it('debe filtrar prácticas por programId', async () => {
    await service.create({ name: 'P1', programId: 'progA' });
    await service.create({ name: 'P2', programId: 'progB' });
    const filtered = await service.findAll({ programId: 'progB' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].programId).toBe('progB');
  });

  it('debe actualizar una práctica existente', async () => {
    const p = await service.create({ name: 'X', programId: 'progA' });
    const updated = await service.update(p.id, { name: 'Y' });
    expect(updated?.name).toBe('Y');
  });

  it('debe eliminar una práctica', async () => {
    const p = await service.create({ name: 'Z', programId: 'progA' });
    const ok = await service.remove(p.id);
    expect(ok).toBe(true);
    const found = await service.findOne(p.id);
    expect(found).toBeUndefined();
  });

  it('no debe permitir actualizar un id inexistente', async () => {
    const updated = await service.update('no-existe', { name: 'Nada' });
    expect(updated).toBeUndefined();
  });
});