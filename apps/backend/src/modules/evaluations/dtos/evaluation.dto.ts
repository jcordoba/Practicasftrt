import { z } from 'zod';

export const EvaluationCriterioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  puntaje: z.number().min(0).max(5)
});

export const CreateEvaluationSchema = z.object({
  asignacion_id: z.string(),
  corte: z.union([z.literal(1), z.literal(2)]),
  fecha: z.string(),
  evaluador_id: z.string(),
  nota: z.number().min(0).max(5),
  criterios: z.array(EvaluationCriterioSchema),
  observaciones: z.string().max(1000),
  programId: z.string().uuid().optional()
});

export const UpdateEvaluationSchema = z.object({
  nota: z.number().min(0).max(5).optional(),
  criterios: z.array(EvaluationCriterioSchema).optional(),
  observaciones: z.string().max(1000).optional(),
  programId: z.string().uuid().optional()
});