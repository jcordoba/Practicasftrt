import { describe, it, expect, beforeEach } from 'vitest';
import { EvaluationService } from './evaluation.service';

const asignacion_id = 'asig1';
const evaluador_id = 'pastor1';
const criterios = [
  { id: 'c1', nombre: 'Puntualidad', puntaje: 4 },
  { id: 'c2', nombre: 'Responsabilidad', puntaje: 5 }
];

describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(() => {
    service = new EvaluationService();
  });

  it('debería crear una evaluación para corte 1', () => {
    const eval1 = service.create({ asignacion_id, corte: 1, fecha: '2024-06-01', evaluador_id, nota: 4.5, criterios, observaciones: 'Buen desempeño' }, evaluador_id);
    expect(eval1).toHaveProperty('id');
    expect(eval1.corte).toBe(1);
    expect(eval1.nota).toBe(4.5);
  });

  it('no permite más de una evaluación por corte/asignación', () => {
    service.create({ asignacion_id, corte: 2, fecha: '2024-06-15', evaluador_id, nota: 4, criterios, observaciones: '' }, evaluador_id);
    expect(() => service.create({ asignacion_id, corte: 2, fecha: '2024-06-16', evaluador_id, nota: 3, criterios, observaciones: '' }, evaluador_id)).toThrow();
  });

  it('debería actualizar la nota y criterios de una evaluación', () => {
    const eval1 = service.create({ asignacion_id, corte: 1, fecha: '2024-06-01', evaluador_id, nota: 4, criterios, observaciones: '' }, evaluador_id);
    const updated = service.update(eval1.id, { nota: 5, criterios: [{ id: 'c1', nombre: 'Puntualidad', puntaje: 5 }] }, evaluador_id);
    expect(updated.nota).toBe(5);
    expect(updated.criterios.length).toBe(1);
    expect(updated.historial?.length).toBe(1);
  });

  it('solo el evaluador original puede actualizar', () => {
    const eval1 = service.create({ asignacion_id, corte: 1, fecha: '2024-06-01', evaluador_id, nota: 4, criterios, observaciones: '' }, evaluador_id);
    expect(() => service.update(eval1.id, { nota: 3 }, 'otro')).toThrow();
  });

  it('debería listar evaluaciones por asignación', () => {
    service.create({ asignacion_id, corte: 1, fecha: '2024-06-01', evaluador_id, nota: 4, criterios, observaciones: '' }, evaluador_id);
    const list = service.findByAssignment(asignacion_id);
    expect(list.length).toBeGreaterThan(0);
  });
});