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

  it('debería crear una asignación', () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    const assignment = service.create(dto);
    expect(assignment).toHaveProperty('id');
    expect(assignment.estudiante_id).toBe(estudiante_id);
    expect(assignment.estado).toBe('ACTIVO');
  });

  it('no permite más de una asignación activa por estudiante', () => {
    const dto1: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    service.create(dto1);
    const dto2: CreateAssignmentDto = { estudiante_id, practica_id: 'prac2', centro_id: 'centro2', fecha_inicio: new Date('2024-01-11'), usuario_asignador };
    expect(() => service.create(dto2)).toThrow();
  });

  it('debería actualizar el centro de práctica', () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    const assignment = service.create(dto);
    const updated = service.update(assignment.id, { centro_id: 'nuevoCentro' });
    expect(updated.centro_id).toBe('nuevoCentro');
  });

  it('debería cambiar el estado a TRASLADADO', () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    const assignment = service.create(dto);
    const updated = service.update(assignment.id, { estado: 'TRASLADADO' });
    expect(updated.estado).toBe('TRASLADADO');
  });

  it('debería listar asignaciones filtradas', () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    service.create(dto);
    const list = service.findAll({ estudiante_id });
    expect(list.length).toBeGreaterThan(0);
  });

  it('debería obtener historial de asignaciones', () => {
    const dto: CreateAssignmentDto = { estudiante_id, practica_id, centro_id, fecha_inicio: new Date('2024-01-10'), usuario_asignador };
    service.create(dto);
    const historial = service.getHistorial(estudiante_id);
    expect(Array.isArray(historial)).toBe(true);
  });
});