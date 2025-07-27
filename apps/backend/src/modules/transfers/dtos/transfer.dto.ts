import { z } from 'zod';

export const CreateTransferSchema = z.object({
  asignacion_id: z.string().min(1),
  centro_nuevo_id: z.string().min(1),
  motivo: z.string().min(5),
  usuario_responsable: z.string().min(1),
  fecha: z.coerce.date()
});

export type CreateTransferDto = z.infer<typeof CreateTransferSchema>;

export const UpdateTransferSchema = z.object({
  motivo: z.string().min(5).optional(),
  usuario_responsable: z.string().min(1).optional(),
  fecha: z.coerce.date().optional()
});

export type UpdateTransferDto = z.infer<typeof UpdateTransferSchema>;