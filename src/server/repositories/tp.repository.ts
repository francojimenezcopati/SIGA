import { ApiError } from "@/server/lib/api-error";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import type { Tables, TablesInsert } from "@/server/lib/supabase/database.types";

export type TrabajosPracticos = Tables<"trabajos_practicos">;
export type Entrega = Tables<"entregas">;

export async function getTpsByMateria(
  supabase: SupabaseServerClient,
  materiaId: string,
): Promise<TrabajosPracticos[]> {
  const { data, error } = await supabase
    .from("trabajos_practicos")
    .select("*")
    .eq("materia_id", materiaId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "No se pudieron obtener los trabajos prácticos", error.message);
  }
  return data ?? [];
}

export async function getTpsByEstudiante(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<any[]> {
  const { data, error } = await supabase
    .from("trabajos_practicos")
    .select(`
      *,
      materia:materias(*),
      entregas(
        id,
        archivo_path,
        comentario,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "No se pudieron obtener los trabajos prácticos del estudiante", error.message);
  }
  return data ?? [];
}

export async function createTp(
  supabase: SupabaseServerClient,
  values: TablesInsert<"trabajos_practicos">,
): Promise<TrabajosPracticos> {
  const { data, error } = await supabase
    .from("trabajos_practicos")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    throw new ApiError(500, "No se pudo crear el trabajo práctico", error.message);
  }
  return data;
}

export async function getEntregasByTp(
  supabase: SupabaseServerClient,
  tpId: string,
): Promise<any[]> {
  const { data, error } = await supabase
    .from("entregas")
    .select(`
      *,
      estudiante:profiles(*)
    `)
    .eq("trabajo_practico_id", tpId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "No se pudieron obtener las entregas del TP", error.message);
  }
  return data ?? [];
}

export async function getEntregasByEstudiante(
  supabase: SupabaseServerClient,
  userId: string,
  tpId?: string,
): Promise<Entrega[]> {
  let query = supabase
    .from("entregas")
    .select("*")
    .eq("estudiante_id", userId);

  if (tpId) {
    query = query.eq("trabajo_practico_id", tpId);
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, "No se pudieron obtener las entregas del estudiante", error.message);
  }
  return data ?? [];
}

export async function createEntrega(
  supabase: SupabaseServerClient,
  values: TablesInsert<"entregas">,
): Promise<Entrega> {
  const { data, error } = await supabase
    .from("entregas")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    throw new ApiError(500, "No se pudo crear la entrega", error.message);
  }
  return data;
}
