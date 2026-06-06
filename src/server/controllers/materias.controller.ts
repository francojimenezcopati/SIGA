import type { NextRequest } from "next/server";

import { getAuthContext } from "@/server/lib/auth";
import { badRequest, forbidden, unauthorized } from "@/server/lib/api-error";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import {
  createMateriaSchema,
  listMateriasQuerySchema,
} from "@/server/schemas/materia.schema";
import { createMateria, getMaterias } from "@/server/services/materias.service";

/**
 * Controllers: orquestan la petición/respuesta. Validan entrada (Zod),
 * verifican autenticación y rol (RBAC), y delegan en los servicios. Devuelven
 * datos planos; el route handler arma la respuesta HTTP.
 */

export async function listMateriasController(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();

  const { searchParams } = new URL(request.url);
  const query = listMateriasQuerySchema.parse({
    search: searchParams.get("search") ?? undefined,
  });

  return getMaterias(supabase, query);
}

export async function createMateriaController(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();
  if (auth.role !== "docente" && auth.role !== "administrador") {
    throw forbidden("Solo docentes o administradores pueden crear materias");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("El cuerpo debe ser JSON válido");
  }
  const input = createMateriaSchema.parse(body);

  return createMateria(supabase, input, auth);
}
