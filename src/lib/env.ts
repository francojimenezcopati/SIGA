import { z } from "zod";

/**
 * Variables de entorno PÚBLICAS (prefijo `NEXT_PUBLIC_`): seguras en el
 * navegador. Next.js las reemplaza estáticamente en el bundle del cliente,
 * por eso se referencian explícitamente (no por índice dinámico).
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function readPublicEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

/** Devuelve el env público validado, o lanza un error claro si falta algo. */
export function getPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse(readPublicEnv());
  if (!parsed.success) {
    throw new Error(
      "[env] Variables públicas de Supabase faltantes o inválidas. " +
        "Revisá tu .env.local (ver .env.local.example). Detalle: " +
        parsed.error.message,
    );
  }
  return parsed.data;
}

/**
 * Igual que `getPublicEnv` pero devuelve `null` en vez de lanzar. Pensado
 * para el middleware, que debe poder dejar pasar requests aun sin Supabase
 * configurado (p. ej. antes de crear `.env.local`).
 */
export function getPublicEnvSafe(): PublicEnv | null {
  const parsed = publicEnvSchema.safeParse(readPublicEnv());
  return parsed.success ? parsed.data : null;
}
