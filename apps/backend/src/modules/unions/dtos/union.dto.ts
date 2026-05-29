import { z } from 'zod';

export const CreateUnionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
});

export type CreateUnionDto = z.infer<typeof CreateUnionSchema>;

export const UpdateUnionSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

export type UpdateUnionDto = z.infer<typeof UpdateUnionSchema>;
