import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthContext } from "@/server/lib/auth";
import { badRequest, unauthorized } from "@/server/lib/api-error";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import {
  createNotaSchema,
  listNotasQuerySchema,
  patchNotaSchema,
} from "@/server/schemas/nota.schema";
import { createNota, getNotas, patchNota } from "@/server/services/nota.service";

/**
 * Lista las calificaciones del usuario autenticado.
 * - Estudiante: ve solo sus propias notas.
 * - Docente / Admin: ve las notas de sus materias.
 * Acepta el query param opcional `materia_id` (UUID) para filtrar por materia.
 */
export async function listNotasController(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();

  const { searchParams } = new URL(request.url);
  const query = listNotasQuerySchema.parse({
    materia_id: searchParams.get("materia_id") ?? undefined,
  });

  return getNotas(supabase, query, auth);
}

/**
 * Registra una nueva calificación para un estudiante inscripto.
 * Solo pueden hacerlo docentes o administradores.
 * El docente debe ser el responsable de la materia correspondiente a la inscripción.
 * Devuelve la nota creada con HTTP 201.
 */
export async function createNotaController(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("El cuerpo debe ser JSON válido");
  }

  const input = createNotaSchema.parse(body);
  return createNota(supabase, input, auth);
}

/**
 * Actualiza parcialmente una calificación existente (descripción y/o valor).
 * Solo pueden hacerlo docentes o administradores.
 * El docente debe ser el responsable de la materia a la que pertenece la nota.
 * Valida que el `id` recibido en la URL sea un UUID válido antes de procesar.
 */
export async function patchNotaController(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();

  // Validar UUID
  const idResult = z.string().uuid({ message: "ID de calificación inválido" }).safeParse(context.params.id);
  if (!idResult.success) {
    throw badRequest(idResult.error.issues[0].message);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("El cuerpo debe ser JSON válido");
  }

  const input = patchNotaSchema.parse(body);
  return patchNota(supabase, idResult.data, input, auth);
}
