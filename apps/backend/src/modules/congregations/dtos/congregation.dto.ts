import { z } from "zod";

export const CreateCongregationSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  districtId: z.string().min(1, "El districtId es obligatorio"),
  esCentroPractica: z.boolean().optional()
});

export type CreateCongregationDto = z.infer<typeof CreateCongregationSchema>;

export const UpdateCongregationSchema = z.object({
  nombre: z.string().min(1).optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]).optional(),
  esCentroPractica: z.boolean().optional()
});

export type UpdateCongregationDto = z.infer<typeof UpdateCongregationSchema>;