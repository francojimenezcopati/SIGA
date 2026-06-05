import { z } from "zod";

/**
 * Variables de entorno PRIVADAS (solo servidor). NUNCA deben llevar el
 * prefijo `NEXT_PUBLIC_` ni importarse desde componentes de cliente.
 *
 * `SUPABASE_SERVICE_ROLE_KEY` saltea Row Level Security: usar con extremo
 * cuidado y siempre detrás de un chequeo de rol en el servidor.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Devuelve el env privado validado, o lanza un error claro si falta algo. */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      "[env] SUPABASE_SERVICE_ROLE_KEY faltante. Es obligatoria del lado del " +
        "servidor (ver .env.local.example). Detalle: " +
        parsed.error.message,
    );
  }
  return parsed.data;
}
