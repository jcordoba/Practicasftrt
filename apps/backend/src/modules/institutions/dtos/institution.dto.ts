import { z } from "zod";

export const CreateInstitutionSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  esCentroPractica: z.boolean().optional()
});

export type CreateInstitutionDto = z.infer<typeof CreateInstitutionSchema>;

export const UpdateInstitutionSchema = z.object({
  nombre: z.string().min(1).optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]).optional(),
  esCentroPractica: z.boolean().optional()
});

export type UpdateInstitutionDto = z.infer<typeof UpdateInstitutionSchema>;