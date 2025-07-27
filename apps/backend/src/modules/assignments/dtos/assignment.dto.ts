import { z } from 'zod';

export const CreateAssignmentSchema = z.object({
  estudiante_id: z.string().min(1),
  practica_id: z.string().min(1),
  centro_id: z.string().min(1),
  fecha_inicio: z.coerce.date(),
  usuario_asignador: z.string().min(1),
  programId: z.string().uuid().optional()
});

export type CreateAssignmentDto = z.infer<typeof CreateAssignmentSchema>;

export const UpdateAssignmentSchema = z.object({
  centro_id: z.string().min(1).optional(),
  estado: z.enum(['ACTIVO', 'TRASLADADO', 'FINALIZADO']).optional(),
  fecha_inicio: z.coerce.date().optional(),
  programId: z.string().uuid().optional()
});

export type UpdateAssignmentDto = z.infer<typeof UpdateAssignmentSchema>;