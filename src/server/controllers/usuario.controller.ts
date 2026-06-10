import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthContext } from "@/server/lib/auth";
import { badRequest, unauthorized } from "@/server/lib/api-error";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { createSupabaseAdminClient } from "@/server/lib/supabase/admin";
import { patchUsuarioRoleSchema } from "@/server/schemas/usuario.schema";
import { getUsuarios, updateRole } from "@/server/services/usuario.service";

export async function listUsuariosController(request: NextRequest) {
  // Verificamos sesión del usuario autenticado normal (seguridad)
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();

  // Instanciamos el cliente admin privilegiado (service_role) para saltear RLS
  const adminClient = createSupabaseAdminClient();
  return getUsuarios(adminClient, auth);
}

export async function patchUsuarioRoleController(
  request: NextRequest,
  context: { params: { id: string } },
) {
  // Verificamos sesión del usuario autenticado normal
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) throw unauthorized();

  // Validar UUID del usuario a modificar
  const idResult = z.string().uuid({ message: "ID de usuario inválido" }).safeParse(context.params.id);
  if (!idResult.success) {
    throw badRequest(idResult.error.issues[0].message);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("El cuerpo debe ser JSON válido");
  }

  const input = patchUsuarioRoleSchema.parse(body);
  const adminClient = createSupabaseAdminClient();
  return updateRole(adminClient, idResult.data, input.role, auth);
}
