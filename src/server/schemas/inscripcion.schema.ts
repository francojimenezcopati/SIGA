import { z } from 'zod';

export const createInscripcionSchema = z.object({
  materia_id: z.string().uuid({ message: 'materia_id must be a valid UUID' }),
});

export type CreateInscripcionDto = z.infer<typeof createInscripcionSchema>;