import { EvaluationService } from '../services/evaluation.service';
import { CreateEvaluationSchema, UpdateEvaluationSchema } from '../dtos/evaluation.dto';

const evaluationService = new EvaluationService();

function requireRole(roles: string[], userRole: string) {
  if (!roles.includes(userRole)) throw new Error('No autorizado');
}

// Crear evaluación (solo pastor tutor)
export function createEvaluation(req: any, res: any) {
  try {
    requireRole(['PASTOR'], req.user.role);
    const parsed = CreateEvaluationSchema.parse(req.body);
    if (parsed.programId) {
      // TODO: Validar existencia real en base de datos
    }
    const evaluation = evaluationService.create(parsed, req.user.id);
    res.status(201).json(evaluation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Actualizar evaluación (solo pastor tutor)
export function updateEvaluation(req: any, res: any) {
  try {
    requireRole(['PASTOR'], req.user.role);
    const parsed = UpdateEvaluationSchema.parse(req.body);
    if (parsed.programId) {
      // TODO: Validar existencia real en base de datos
    }
    const evaluation = evaluationService.update(req.params.id, parsed, req.user.id);
    res.json(evaluation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Consultar evaluaciones por asignación (estudiante, pastor, docente, coordinador)
export function listEvaluationsByAssignment(req: any, res: any) {
  try {
    requireRole(['ESTUDIANTE','PASTOR','DOCENTE','COORDINADOR'], req.user.role);
    const filter = { programId: req.query.programId };
    const evaluations = evaluationService.findByAssignment(req.params.asignacion_id, filter);
    res.json(evaluations);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}