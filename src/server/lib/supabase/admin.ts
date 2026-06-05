import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env";
import { getServerEnv } from "@/server/lib/env";

/**
 * Cliente PRIVILEGIADO de Supabase (service_role).
 *
 * SALTEA RLS por completo, por lo que SOLO debe usarse del lado del servidor
 * y para operaciones que realmente lo justifiquen (p. ej. ABM de usuarios por
 * un administrador), siempre detrás de un chequeo de rol (RBAC) en el
 * controller. Nunca exponer esta clave ni este cliente al navegador.
 */
export function createSupabaseAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
