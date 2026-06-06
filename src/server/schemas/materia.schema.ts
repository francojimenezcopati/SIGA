import { z } from "zod";

/** DTO de entrada para crear una materia (POST /api/materias). */
export const createMateriaSchema = z.object({
  codigo: z.string().trim().min(1, "El código es obligatorio").max(20),
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  descripcion: z.string().trim().max(2000).nullish(),
  cupo: z.number().int().min(0).max(1000).default(30),
  periodo: z.string().trim().max(20).nullish(),
  // Solo lo usa un admin para asignar el docente a cargo; si lo crea un
  // docente, el service lo ignora y se asigna a sí mismo.
  docente_id: z.string().uuid().nullish(),
});
export type CreateMateriaInput = z.infer<typeof createMateriaSchema>;

/** DTO de query para listar materias (GET /api/materias). */
export const listMateriasQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
});
export type ListMateriasQuery = z.infer<typeof listMateriasQuerySchema>;
