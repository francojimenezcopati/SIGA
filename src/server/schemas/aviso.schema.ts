import { z } from "zod";

export const createAvisoSchema = z.object({
  titulo: z.string().min(1, { message: "El título es requerido" }),
  contenido: z.string().min(1, { message: "El contenido es requerido" }),
  materia_id: z.string().uuid({ message: "ID de materia inválido" }).nullable().optional(),
});

export const listAvisosQuerySchema = z.object({
  materia_id: z.string().uuid().optional(),
});

export type CreateAvisoInput = z.infer<typeof createAvisoSchema>;
export type ListAvisosQuery = z.infer<typeof listAvisosQuerySchema>;
