import { describe, it, expect, beforeEach } from 'vitest';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from '../dtos/assignment.dto';

const estudiante_id = 'stu1';
const practica_id = 'prac1';
const centro_id = 'centro1';
const usuario_asignador = 'coord1';

describe('AssignmentService', () => {
  let service: AssignmentService;

  beforeEach(() => {
    service = new AssignmentService();
  });

  it('debería crear una asignación', async () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    const assignment = await service.create(dto);
    expect(assignment).toHaveProperty('id');
    expect(assignment.estudiante_id).toBe(estudiante_id);
    expect(assignment.estado).toBe('ACTIVO');
  });

  it('no permite más de una asignación activa por estudiante en diferentes centros', async () => {
    const dto1: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    await service.create(dto1);
    const dto2: CreateAssignmentDto = { estudiante_id, practica_id: 'prac2', centro_id: 'centro2', fecha_inicio: new Date('2024-01-11'), usuario_asignador };
    await expect(service.create(dto2)).rejects.toThrow('El estudiante ya tiene una asignación activa para este semestre.');
  });

  it('debería actualizar el centro de práctica', async () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    const assignment = await service.create(dto);
    const updated = await service.update(assignment.id, { centro_id: 'nuevoCentro' });
    expect(updated.centro_id).toBe('nuevoCentro');
  });

  it('debería cambiar el estado a TRASLADADO', async () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    const assignment = await service.create(dto);
    const updated = await service.update(assignment.id, { estado: 'TRASLADADO' });
    expect(updated.estado).toBe('TRASLADADO');
  });

  it('debería listar asignaciones filtradas', async () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    await service.create(dto);
    const list = await service.findAll({ estudiante_id });
    expect(list.length).toBeGreaterThan(0);
  });

  it('debería obtener historial de asignaciones', async () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    await service.create(dto);
    const historial = await service.getHistorial(estudiante_id);
    expect(Array.isArray(historial)).toBe(true);
  });

  // Nuevos tests para la regla de múltiples prácticas en el mismo centro
  it('debería permitir múltiples prácticas diferentes del mismo estudiante en el mismo centro', async () => {
    const dto1: CreateAssignmentDto = { estudiante_id, practica_id: 'prac1', centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    const dto2: CreateAssignmentDto = { estudiante_id, practica_id: 'prac2', centro_id, fecha_inicio: new Date('2024-01-15'), usuario_asignador };
    
    // Primera asignación debe ser exitosa
    const assignment1 = await service.create(dto1);
    expect(assignment1.practica_id).toBe('prac1');
    
    // Segunda asignación (práctica diferente, mismo centro) debe ser exitosa
    const assignment2 = await service.create(dto2);
    expect(assignment2.practica_id).toBe('prac2');
    expect(assignment2.centro_id).toBe(centro_id);
  });

  it('no debería permitir la misma práctica del mismo estudiante en el mismo centro', async () => {
    const dto1: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    const dto2: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-15'), usuario_asignador };
    
    // Primera asignación debe ser exitosa
    await service.create(dto1);
    
    // Segunda asignación (misma práctica, mismo centro) debe fallar
    await expect(service.create(dto2)).rejects.toThrow('El estudiante ya está asignado a esta práctica en este centro.');
  });
});