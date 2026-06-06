import type { AuthContext } from "@/server/lib/auth";
import { conflict } from "@/server/lib/api-error";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import {
  findMateriaByCodigo,
  insertMateria,
  listMaterias,
  type Materia,
} from "@/server/repositories/materias.repository";
import type {
  CreateMateriaInput,
  ListMateriasQuery,
} from "@/server/schemas/materia.schema";

/**
 * Lógica de negocio de `materias`. No conoce HTTP ni Supabase directamente:
 * orquesta repositorios y aplica reglas de negocio.
 */

export async function getMaterias(
  supabase: SupabaseServerClient,
  query: ListMateriasQuery,
): Promise<Materia[]> {
  return listMaterias(supabase, { search: query.search });
}

export async function createMateria(
  supabase: SupabaseServerClient,
  input: CreateMateriaInput,
  auth: AuthContext,
): Promise<Materia> {
  // Regla de negocio: si quien crea es docente, queda como docente a cargo;
  // un admin puede asignar el docente explícitamente (o dejarlo sin asignar).
  const docenteId =
    auth.role === "docente" ? auth.userId : (input.docente_id ?? null);

  // Mensaje amistoso ante código duplicado (la unicidad la garantiza la DB).
  const existing = await findMateriaByCodigo(supabase, input.codigo);
  if (existing) {
    throw conflict("Ya existe una materia con ese código");
  }

  return insertMateria(supabase, {
    codigo: input.codigo,
    nombre: input.nombre,
    descripcion: input.descripcion ?? null,
    cupo: input.cupo,
    periodo: input.periodo ?? null,
    docente_id: docenteId,
  });
}
