import type { AuthContext } from "@/server/lib/auth";
import { forbidden, notFound } from "@/server/lib/api-error";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import {
  findInscripcionById,
  findNotaById,
  insertNota,
  listNotas,
  updateNota,
  type Nota,
} from "@/server/repositories/nota.repository";
import type {
  CreateNotaInput,
  ListNotasQuery,
  PatchNotaInput,
} from "@/server/schemas/nota.schema";

export async function getNotas(
  supabase: SupabaseServerClient,
  query: ListNotasQuery,
  auth: AuthContext,
): Promise<any[]> {
  return listNotas(supabase, { materia_id: query.materia_id });
}

export async function createNota(
  supabase: SupabaseServerClient,
  input: CreateNotaInput,
  auth: AuthContext,
): Promise<Nota> {
  if (auth.role === "estudiante") {
    throw forbidden("Los estudiantes no pueden registrar calificaciones");
  }

  const inscripcion = await findInscripcionById(supabase, input.inscripcion_id);
  if (!inscripcion) {
    throw notFound("La inscripción especificada no existe");
  }

  // Si es docente, verificar que sea el docente a cargo de la materia
  if (auth.role === "docente") {
    if (inscripcion.materia?.docente_id !== auth.userId) {
      throw forbidden(
        "Solo puedes calificar a estudiantes inscriptos en tus propias materias",
      );
    }
  }

  return insertNota(supabase, {
    inscripcion_id: input.inscripcion_id,
    descripcion: input.descripcion,
    valor: input.valor,
    docente_id: auth.userId,
  });
}

export async function patchNota(
  supabase: SupabaseServerClient,
  id: string,
  input: PatchNotaInput,
  auth: AuthContext,
): Promise<Nota> {
  if (auth.role === "estudiante") {
    throw forbidden("Los estudiantes no pueden modificar calificaciones");
  }

  const existingNota = await findNotaById(supabase, id);
  if (!existingNota) {
    throw notFound("La calificación especificada no existe");
  }

  // Si es docente, verificar que sea el docente a cargo de la materia
  if (auth.role === "docente") {
    if (existingNota.inscripcion?.materia?.docente_id !== auth.userId) {
      throw forbidden(
        "Solo puedes modificar calificaciones de tus propias materias",
      );
    }
  }

  return updateNota(supabase, id, {
    descripcion: input.descripcion,
    valor: input.valor,
  });
}
