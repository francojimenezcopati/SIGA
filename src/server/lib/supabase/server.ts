import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/server/lib/supabase/database.types";

/**
 * Cliente de Supabase para el SERVIDOR ligado a la sesión del usuario (vía
 * cookies). Respeta RLS: es el cliente por defecto para los repositorios que
 * actúan en nombre del usuario autenticado.
 *
 * Usar en Route Handlers (`/app/api`) y Server Components.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  return createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component (cookies de solo lectura).
            // El middleware (`updateSession`) se encarga de refrescar la cookie.
          }
        },
      },
    },
  );
}

/** Tipo del cliente server, tipado con el esquema de la base. */
export type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;
