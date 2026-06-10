import { ApiError } from "@/server/lib/api-error";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/server/lib/supabase/database.types";

export type Nota = Tables<"notas">;

export async function listNotas(
  supabase: SupabaseServerClient,
  params: { materia_id?: string },
): Promise<any[]> {
  let query = supabase
    .from("notas")
    .select(`
      *,
      inscripcion:inscripciones!inner(
        *,
        estudiante:profiles(*),
        materia:materias(*)
      )
    `);

  if (params.materia_id) {
    query = query.eq("inscripciones.materia_id", params.materia_id);
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, "No se pudieron listar las calificaciones", error.message);
  }
  return data ?? [];
}

export async function findNotaById(
  supabase: SupabaseServerClient,
  id: string,
): Promise<any | null> {
  const { data, error } = await supabase
    .from("notas")
    .select(`
      *,
      inscripcion:inscripciones(*, materia:materias(*))
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Error al buscar la calificación", error.message);
  }
  return data;
}

export async function insertNota(
  supabase: SupabaseServerClient,
  values: TablesInsert<"notas">,
): Promise<Nota> {
  const { data, error } = await supabase
    .from("notas")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    throw new ApiError(500, "No se pudo registrar la calificación", error.message);
  }
  return data;
}

export async function updateNota(
  supabase: SupabaseServerClient,
  id: string,
  values: TablesUpdate<"notas">,
): Promise<Nota> {
  const { data, error } = await supabase
    .from("notas")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new ApiError(500, "No se pudo actualizar la calificación", error.message);
  }
  return data;
}

export async function findInscripcionById(
  supabase: SupabaseServerClient,
  id: string,
): Promise<any | null> {
  const { data, error } = await supabase
    .from("inscripciones")
    .select("*, materia:materias(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Error al buscar la inscripción", error.message);
  }
  return data;
}
