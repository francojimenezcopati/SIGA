import { z } from "zod";

export const patchUsuarioRoleSchema = z.object({
  role: z.enum(["estudiante", "docente", "administrador"]),
});

export type PatchUsuarioRoleInput = z.infer<typeof patchUsuarioRoleSchema>;
