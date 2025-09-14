import { describe, it, expect, beforeEach } from 'vitest';
import { PracticeService } from './practice.service';

describe('PracticeService', () => {
  let service: PracticeService;
  beforeEach(() => {
    service = new PracticeService();
  });

  it('debe crear una práctica y recuperarla', async () => {
    const created = await service.create({ 
      studentId: 'student1', 
      tutorId: 'tutor1', 
      teacherId: 'teacher1',
      institution: 'Test Institution',
      startDate: new Date(),
      endDate: new Date(),
      hours: 40
    });
    expect(created).toHaveProperty('id');
    const found = await service.findOne(created.id);
    expect(found).toMatchObject({ institution: 'Test Institution' });
  });

  it('debe filtrar prácticas por studentId', async () => {
    await service.create({ 
      studentId: 'student1', 
      tutorId: 'tutor1', 
      teacherId: 'teacher1',
      institution: 'Institution 1',
      startDate: new Date(),
      endDate: new Date(),
      hours: 40
    });
    await service.create({ 
      studentId: 'student2', 
      tutorId: 'tutor1', 
      teacherId: 'teacher1',
      institution: 'Institution 2',
      startDate: new Date(),
      endDate: new Date(),
      hours: 40
    });
    const filtered = await service.findAll({ studentId: 'student2' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].studentId).toBe('student2');
  });

  it('debe actualizar una práctica existente', async () => {
    const p = await service.create({ 
      studentId: 'student1', 
      tutorId: 'tutor1', 
      teacherId: 'teacher1',
      institution: 'Original Institution',
      startDate: new Date(),
      endDate: new Date(),
      hours: 40
    });
    const updated = await service.update(p.id, { institution: 'Updated Institution' });
    expect(updated?.institution).toBe('Updated Institution');
  });

  it('debe eliminar una práctica', async () => {
    const p = await service.create({ 
      studentId: 'student1', 
      tutorId: 'tutor1', 
      teacherId: 'teacher1',
      institution: 'Test Institution',
      startDate: new Date(),
      endDate: new Date(),
      hours: 40
    });
    const ok = await service.remove(p.id);
    expect(ok).toBe(true);
    const found = await service.findOne(p.id);
    expect(found).toBeUndefined();
  });

  it('no debe permitir actualizar un id inexistente', async () => {
    const updated = await service.update('no-existe', { institution: 'Nada' });
    expect(updated).toBeUndefined();
  });
});