import { ApiError } from "@/server/lib/api-error";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
} from "@/server/lib/supabase/database.types";

export type Materia = Tables<"materias">;

/**
 * Capa de acceso a datos de `materias`. Aísla a Supabase del resto del
 * sistema: si cambiara la base, solo se tocan los repositorios. Recibe el
 * cliente (RLS) por inyección, lo que también facilita testearlo/mockearlo.
 */

export async function listMaterias(
  supabase: SupabaseServerClient,
  params: { search?: string },
): Promise<Materia[]> {
  let query = supabase
    .from("materias")
    .select("*")
    .order("nombre", { ascending: true });

  if (params.search) {
    // Se neutralizan los caracteres especiales del filtro PostgREST para
    // evitar inyección en el `or(...)`.
    const term = params.search.replace(/[%,()*\\]/g, "");
    if (term.length > 0) {
      query = query.or(`nombre.ilike.*${term}*,codigo.ilike.*${term}*`);
    }
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, "No se pudieron listar las materias", error.message);
  }
  return data ?? [];
}

export async function findMateriaByCodigo(
  supabase: SupabaseServerClient,
  codigo: string,
): Promise<Materia | null> {
  const { data, error } = await supabase
    .from("materias")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Error al buscar la materia", error.message);
  }
  return data;
}

export async function insertMateria(
  supabase: SupabaseServerClient,
  values: TablesInsert<"materias">,
): Promise<Materia> {
  const { data, error } = await supabase
    .from("materias")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    // 23505 = unique_violation (código duplicado).
    if (error.code === "23505") {
      throw new ApiError(409, "Ya existe una materia con ese código");
    }
    throw new ApiError(500, "No se pudo crear la materia", error.message);
  }
  return data;
}
