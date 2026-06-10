import { z } from "zod";

export const createNotaSchema = z.object({
  inscripcion_id: z.string().uuid({ message: "ID de inscripción inválido" }),
  descripcion: z.string().min(1, { message: "La descripción es requerida" }),
  valor: z
    .number()
    .min(0, { message: "El valor mínimo es 0" })
    .max(10, { message: "El valor máximo es 10" }),
});

export const patchNotaSchema = z.object({
  descripcion: z.string().min(1, { message: "La descripción no puede estar vacía" }).optional(),
  valor: z
    .number()
    .min(0, { message: "El valor mínimo es 0" })
    .max(10, { message: "El valor máximo es 10" })
    .optional(),
});

export const listNotasQuerySchema = z.object({
  materia_id: z.string().uuid().optional(),
});

export type CreateNotaInput = z.infer<typeof createNotaSchema>;
export type PatchNotaInput = z.infer<typeof patchNotaSchema>;
export type ListNotasQuery = z.infer<typeof listNotasQuerySchema>;
