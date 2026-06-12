import { z } from "zod";

export const createTpSchema = z.object({
  materia_id: z.string().uuid({ message: "ID de materia inválido" }),
  titulo: z.string().trim().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  descripcion: z.string().trim().optional(),
  fecha_entrega: z.string().optional().nullable(),
});

export const createEntregaSchema = z.object({
  tp_id: z.string().uuid({ message: "ID de TP inválido" }),
  archivo_url: z.string().url({ message: "URL del archivo inválida" }),
  comentario: z.string().trim().optional(),
});

export type CreateTpInput = z.infer<typeof createTpSchema>;
export type CreateEntregaInput = z.infer<typeof createEntregaSchema>;
