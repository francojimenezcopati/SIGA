import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import type { Enums } from "@/server/lib/supabase/database.types";

export type UserRole = Enums<"user_role">;

export type AuthContext = {
  userId: string;
  email: string | null;
  role: UserRole;
};

/**
 * Devuelve el usuario autenticado y su rol (para RBAC), o `null` si no hay
 * sesión válida. Usa el cliente server (RLS), por lo que un usuario solo
 * puede leer su propio profile.
 */
export async function getAuthContext(
  supabase: SupabaseServerClient,
): Promise<AuthContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return { userId: user.id, email: profile.email, role: profile.role };
}
