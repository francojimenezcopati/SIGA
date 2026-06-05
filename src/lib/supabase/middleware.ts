import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnvSafe } from "@/lib/env";

/** Rutas de autenticación: si ya hay sesión, se redirige al dashboard. */
const AUTH_ROUTES = ["/login", "/auth"];
/** Prefijo de rutas privadas: requieren sesión. */
const PROTECTED_PREFIX = "/dashboard";

/**
 * Refresca la sesión de Supabase en cada request y protege las rutas
 * privadas. Pensado para usarse desde `src/middleware.ts`.
 *
 * Sigue el patrón recomendado por `@supabase/ssr`: el response se reconstruye
 * dentro de `setAll` para propagar las cookies refrescadas, y no debe
 * insertarse lógica entre `createServerClient` y `auth.getUser()`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const env = getPublicEnvSafe();
  if (!env) {
    // Sin configuración de Supabase todavía: dejamos pasar el request para no
    // romper la app antes de tener `.env.local` (ver `.env.local.example`).
    console.warn(
      "[middleware] Supabase no configurado: se omite el manejo de sesión.",
    );
    return supabaseResponse;
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: no insertar lógica entre createServerClient y getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Sin sesión en una ruta privada -> a /login (recordando el destino).
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return copyCookies(supabaseResponse, NextResponse.redirect(url));
  }

  // Con sesión en una ruta de auth -> al dashboard.
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return copyCookies(supabaseResponse, NextResponse.redirect(url));
  }

  return supabaseResponse;
}

/** Copia las cookies (sesión refrescada) a una respuesta de redirección. */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}
