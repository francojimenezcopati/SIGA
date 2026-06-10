import type { AuthContext } from "@/server/lib/auth";
import { forbidden } from "@/server/lib/api-error";
import { createSupabaseAdminClient } from "@/server/lib/supabase/admin";
import {
  listUsuarios,
  updateUsuarioRole,
  type Profile,
} from "@/server/repositories/usuario.repository";
import type { Database } from "@/server/lib/supabase/database.types";

type AdminClientType = ReturnType<typeof createSupabaseAdminClient>;

export async function getUsuarios(
  adminClient: AdminClientType,
  auth: AuthContext,
): Promise<Profile[]> {
  if (auth.role !== "administrador") {
    throw forbidden("Solo administradores pueden listar usuarios");
  }
  return listUsuarios(adminClient);
}

export async function updateRole(
  adminClient: AdminClientType,
  id: string,
  role: Database["public"]["Enums"]["user_role"],
  auth: AuthContext,
): Promise<Profile> {
  if (auth.role !== "administrador") {
    throw forbidden("Solo administradores pueden modificar roles de usuario");
  }
  return updateUsuarioRole(adminClient, id, role);
}
