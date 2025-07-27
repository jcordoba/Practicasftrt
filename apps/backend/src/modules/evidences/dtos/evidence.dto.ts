import { z } from 'zod';

export const EvidenceStatusSchema = z.enum(['PENDIENTE', 'APROBADA', 'RECHAZADA']);

export const CreateEvidenceSchema = z.object({
  asignacion_id: z.string(),
  archivo: z.string().refine(
    (val) => /\.(jpg|jpeg|png)$/i.test(val),
    { message: 'El archivo debe ser JPG o PNG' }
  ),
  fecha: z.string(),
  hora: z.string(),
  ubicacion: z.string().optional(),
  subido_por: z.string(),
  peso: z.number().max(5 * 1024 * 1024, 'El archivo no debe superar 5 MB')
});

export const UpdateEvidenceStatusSchema = z.object({
  estado: EvidenceStatusSchema,
  revisado_por: z.string(),
  motivo_rechazo: z.string().optional()
});