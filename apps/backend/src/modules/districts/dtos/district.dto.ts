import { z } from "zod";

export const CreateDistrictSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  associationId: z.string().min(1, "El associationId es obligatorio")
});

export type CreateDistrictDto = z.infer<typeof CreateDistrictSchema>;

export const UpdateDistrictSchema = z.object({
  nombre: z.string().min(1).optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]).optional()
});

export type UpdateDistrictDto = z.infer<typeof UpdateDistrictSchema>;