import { z } from "zod";

export const CreateAssociationSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  unionId: z.string().min(1, "El unionId es obligatorio")
});

export type CreateAssociationDto = z.infer<typeof CreateAssociationSchema>;

export const UpdateAssociationSchema = z.object({
  nombre: z.string().min(1).optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]).optional()
});

export type UpdateAssociationDto = z.infer<typeof UpdateAssociationSchema>;