import { Evaluation, EvaluationCorte, EvaluationCriterio } from '../entities/evaluation.entity';
import { CreateEvaluationSchema, UpdateEvaluationSchema } from '../dtos/evaluation.dto';

export class EvaluationService {
  private evaluations: Evaluation[] = [];

  create(dto: any, userId: string): Evaluation {
    const now = new Date();
    const evaluation: Evaluation = {
      id: (Math.random() * 1e18).toString(36),
      ...dto,
      creado_por: userId,
      fecha_creacion: now,
      programId: dto.programId || null
    };
    this.evaluations.push(evaluation);
    return evaluation;
  }

  update(id: string, dto: any, userId: string): Evaluation {
    const evaluation = this.evaluations.find(e => e.id === id);
    if (!evaluation) throw new Error('Evaluación no encontrada');
    if (dto.nota) evaluation.nota = dto.nota;
    if (dto.criterios) evaluation.criterios = dto.criterios;
    if (dto.observaciones) evaluation.observaciones = dto.observaciones;
    if (dto.programId) evaluation.programId = dto.programId;
    evaluation.actualizado_por = userId;
    evaluation.fecha_actualizacion = new Date();
    return evaluation;
  }

  findByAssignment(asignacion_id: string, filter?: { programId?: string }): Evaluation[] {
    return this.evaluations.filter(e =>
      e.asignacion_id === asignacion_id &&
      (!filter?.programId || e.programId === filter.programId)
    );
  }
  
  // Consultar evaluaciones por evaluador
  findByEvaluator(evaluador_id: string): Evaluation[] {
    return this.evaluations.filter(e => e.evaluador_id === evaluador_id);
  }
}