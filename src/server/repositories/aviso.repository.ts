import { ApiError } from "@/server/lib/api-error";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import type { Tables, TablesInsert } from "@/server/lib/supabase/database.types";

export type Aviso = Tables<"avisos">;

export async function listAvisos(
  supabase: SupabaseServerClient,
  params: { materia_id?: string },
): Promise<any[]> {
  let query = supabase
    .from("avisos")
    .select(`
      *,
      autor:profiles(*),
      materia:materias(*)
    `)
    .order("created_at", { ascending: false });

  if (params.materia_id) {
    query = query.eq("materia_id", params.materia_id);
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, "No se pudieron obtener los avisos", error.message);
  }
  return data ?? [];
}

export async function insertAviso(
  supabase: SupabaseServerClient,
  values: TablesInsert<"avisos">,
): Promise<Aviso> {
  const { data, error } = await supabase
    .from("avisos")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    throw new ApiError(500, "No se pudo registrar el aviso", error.message);
  }
  return data;
}

export async function checkIsDocenteOfMateria(
  supabase: SupabaseServerClient,
  materiaId: string,
  docenteId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("materias")
    .select("id")
    .eq("id", materiaId)
    .eq("docente_id", docenteId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
