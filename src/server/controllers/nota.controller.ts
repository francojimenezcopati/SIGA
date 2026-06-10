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
