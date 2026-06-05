import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

/**
 * Cliente de Supabase para el NAVEGADOR (componentes cliente).
 *
 * Usa la anon key, por lo que todo acceso queda limitado por RLS. En SIGA se
 * usa principalmente para autenticación/sesión; los datos se piden siempre a
 * la capa de API (`/app/api`), nunca a la base directamente.
 */
export function createSupabaseBrowserClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  return createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
