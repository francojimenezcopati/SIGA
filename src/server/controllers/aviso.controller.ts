import type { NextRequest } from "next/server";
import { getAuthContext } from "@/server/lib/auth";
import { badRequest, unauthorized } from "@/server/lib/api-error";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { createAvisoSchema, listAvisosQuerySchema } from "@/server/schemas/aviso.schema";
import { createAviso, getAvisos } from "@/server/services/aviso.service";

export async function listAvisosController(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();

  const { searchParams } = new URL(request.url);
  const query = listAvisosQuerySchema.parse({
    materia_id: searchParams.get("materia_id") ?? undefined,
  });

  return getAvisos(supabase, query);
}

export async function createAvisoController(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("El cuerpo debe ser JSON válido");
  }

  const input = createAvisoSchema.parse(body);
  return createAviso(supabase, input, auth);
}
