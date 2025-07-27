import { describe, it, expect, beforeEach } from 'vitest';
import { ProgramService } from './program.service';

describe('ProgramService', () => {
  let service: ProgramService;
  beforeEach(() => {
    service = new ProgramService();
  });

  it('debe crear un programa y recuperarlo', async () => {
    const created = await service.create({ name: 'Test', code: 'TST' });
    expect(created).toHaveProperty('id');
    const found = await service.findOne(created.id);
    expect(found).toMatchObject({ name: 'Test', code: 'TST' });
  });

  it('debe filtrar programas por programId', async () => {
    const p1 = await service.create({ name: 'A', code: 'A' });
    const p2 = await service.create({ name: 'B', code: 'B' });
    const filtered = await service.findAll({ programId: p2.id });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(p2.id);
  });

  it('debe actualizar un programa existente', async () => {
    const p = await service.create({ name: 'X', code: 'X' });
    const updated = await service.update(p.id, { name: 'Y' });
    expect(updated?.name).toBe('Y');
  });

  it('debe eliminar un programa', async () => {
    const p = await service.create({ name: 'Z', code: 'Z' });
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