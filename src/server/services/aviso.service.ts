import type { AuthContext } from "@/server/lib/auth";
import { forbidden } from "@/server/lib/api-error";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import {
  insertAviso,
  listAvisos,
  checkIsDocenteOfMateria,
  type Aviso,
} from "@/server/repositories/aviso.repository";
import type { CreateAvisoInput, ListAvisosQuery } from "@/server/schemas/aviso.schema";

export async function getAvisos(
  supabase: SupabaseServerClient,
  query: ListAvisosQuery,
): Promise<any[]> {
  return listAvisos(supabase, { materia_id: query.materia_id });
}

export async function createAviso(
  supabase: SupabaseServerClient,
  input: CreateAvisoInput,
  auth: AuthContext,
): Promise<Aviso> {
  if (auth.role === "estudiante") {
    throw forbidden("Los estudiantes no pueden publicar avisos");
  }

  if (auth.role === "docente") {
    if (!input.materia_id) {
      throw forbidden(
        "Los docentes solo pueden publicar avisos dentro de sus materias (materia_id es requerido)",
      );
    }
    const isDocente = await checkIsDocenteOfMateria(
      supabase,
      input.materia_id,
      auth.userId,
    );
    if (!isDocente) {
      throw forbidden("Solo puedes publicar avisos en materias a tu cargo");
    }
  }

  return insertAviso(supabase, {
    titulo: input.titulo,
    contenido: input.contenido,
    materia_id: input.materia_id ?? null,
    autor_id: auth.userId,
  });
}
