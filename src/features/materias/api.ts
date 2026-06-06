import type { Tables } from "@/server/lib/supabase/database.types";

export type Materia = Tables<"materias">;

export type CreateMateriaInput = {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  cupo: number;
  periodo?: string | null;
};

/** Cliente de la API de materias: el front siempre habla con /app/api. */

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  throw new Error(body?.error ?? fallback);
}

export async function fetchMaterias(search?: string): Promise<Materia[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`/api/materias${qs}`);
  if (!res.ok) await throwApiError(res, "No se pudieron cargar las materias");
  return res.json();
}

export async function createMateria(
  input: CreateMateriaInput,
): Promise<Materia> {
  const res = await fetch("/api/materias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) await throwApiError(res, "No se pudo crear la materia");
  return res.json();
}
