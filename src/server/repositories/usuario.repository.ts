import { ApiError } from "@/server/lib/api-error";
import { createSupabaseAdminClient } from "@/server/lib/supabase/admin";
import type { Database, Tables } from "@/server/lib/supabase/database.types";

export type Profile = Tables<"profiles">;
type AdminClientType = ReturnType<typeof createSupabaseAdminClient>;

export async function listUsuarios(adminClient: AdminClientType): Promise<Profile[]> {
  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    throw new ApiError(500, "No se pudo obtener el listado de usuarios", error.message);
  }
  return data ?? [];
}

export async function updateUsuarioRole(
  adminClient: AdminClientType,
  id: string,
  role: Database["public"]["Enums"]["user_role"],
): Promise<Profile> {
  const { data, error } = await adminClient
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new ApiError(500, "No se pudo actualizar el rol del usuario", error.message);
  }
  return data;
}
