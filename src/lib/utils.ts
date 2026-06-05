import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Une clases de Tailwind de forma segura, resolviendo conflictos
 * (p. ej. `px-2 px-4` -> `px-4`). Usado por todos los componentes de UI.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
