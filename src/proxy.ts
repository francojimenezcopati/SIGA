import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy de Next.js (antes "middleware"): corre en el servidor antes de
 * renderizar cada ruta. En SIGA refresca la sesión de Supabase y protege las
 * rutas privadas. Ver `updateSession`.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corre en todas las rutas excepto:
     * - _next/static (assets), _next/image (optimizador de imágenes)
     * - favicon.ico y archivos de imagen comunes
     * Así se refresca la sesión en páginas y endpoints de API.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
