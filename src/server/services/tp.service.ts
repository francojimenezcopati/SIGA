import type { AuthContext } from "@/server/lib/auth";
import { forbidden, notFound, conflict } from "@/server/lib/api-error";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import {
  getTpsByMateria,
  getTpsByEstudiante,
  createTp as insertTp,
  getEntregasByTp,
  getEntregasByEstudiante,
  createEntrega as insertEntrega,
  type TrabajosPracticos,
  type Entrega,
} from "../repositories/tp.repository";
import type { CreateTpInput, CreateEntregaInput } from "../schemas/tp.schema";

export async function getTps(
  supabase: SupabaseServerClient,
  auth: AuthContext,
  materiaId?: string,
): Promise<any[]> {
  if (auth.role === "administrador") {
    if (materiaId) {
      return getTpsByMateria(supabase, materiaId);
    }
    const { data, error } = await supabase
      .from("trabajos_practicos")
      .select("*, materia:materias(*)")
      .order("created_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  }

  if (auth.role === "docente") {
    if (materiaId) {
      return getTpsByMateria(supabase, materiaId);
    }
    const { data, error } = await supabase
      .from("trabajos_practicos")
      .select("*, materia:materias!inner(*)")
      .eq("materia.docente_id", auth.userId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  }

  // Estudiante: sees TPs for enrolled materias
  return getTpsByEstudiante(supabase, auth.userId);
}

export async function createTp(
  supabase: SupabaseServerClient,
  input: CreateTpInput,
  auth: AuthContext,
): Promise<TrabajosPracticos> {
  if (auth.role === "estudiante") {
    throw forbidden("Los estudiantes no pueden crear trabajos prácticos");
  }

  if (auth.role === "docente") {
    const isDocente = await checkIsDocenteOfMateria(supabase, input.materia_id, auth.userId);
    if (!isDocente) {
      throw forbidden("Solo puedes crear trabajos prácticos en materias a tu cargo");
    }
  }

  return insertTp(supabase, {
    materia_id: input.materia_id,
    titulo: input.titulo,
    consigna: input.descripcion ?? null,
    fecha_entrega: input.fecha_entrega ?? null,
  });
}

export async function getEntregas(
  supabase: SupabaseServerClient,
  tpId: string,
  auth: AuthContext,
): Promise<any[]> {
  if (auth.role === "administrador") {
    return getEntregasByTp(supabase, tpId);
  }

  if (auth.role === "docente") {
    const tpMateriaId = await getTpMateriaId(supabase, tpId);
    if (!tpMateriaId) {
      throw notFound("El trabajo práctico no existe");
    }
    const isDocente = await checkIsDocenteOfMateria(supabase, tpMateriaId, auth.userId);
    if (!isDocente) {
      throw forbidden("Solo puedes ver entregas de tus materias");
    }
    return getEntregasByTp(supabase, tpId);
  }

  return getEntregasByEstudiante(supabase, auth.userId, tpId);
}

export async function createEntrega(
  supabase: SupabaseServerClient,
  tpId: string,
  input: CreateEntregaInput,
  auth: AuthContext,
): Promise<Entrega> {
  if (auth.role !== "estudiante") {
    throw forbidden("Solo los estudiantes pueden realizar entregas");
  }

  const tpMateriaId = await getTpMateriaId(supabase, tpId);
  if (!tpMateriaId) {
    throw notFound("El trabajo práctico no existe");
  }

  const isEnrolled = await isEstudianteEnrolledInMateria(supabase, tpMateriaId, auth.userId);
  if (!isEnrolled) {
    throw forbidden("Debes estar inscrito activamente en la materia para entregar el trabajo");
  }

  const existing = await getEntregasByEstudiante(supabase, auth.userId, tpId);
  if (existing.length > 0) {
    throw conflict("Ya has entregado este trabajo práctico");
  }

  return insertEntrega(supabase, {
    trabajo_practico_id: tpId,
    estudiante_id: auth.userId,
    archivo_path: input.archivo_url,
    comentario: input.comentario ?? null,
  });
}

// Helpers
async function checkIsDocenteOfMateria(
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

async function getTpMateriaId(
  supabase: SupabaseServerClient,
  tpId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("trabajos_practicos")
    .select("materia_id")
    .eq("id", tpId)
    .maybeSingle();
  if (error || !data) return null;
  return data.materia_id;
}

async function isEstudianteEnrolledInMateria(
  supabase: SupabaseServerClient,
  materiaId: string,
  estudianteId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("inscripciones")
    .select("id")
    .eq("materia_id", materiaId)
    .eq("estudiante_id", estudianteId)
    .eq("estado", "activa")
    .maybeSingle();
  return !error && !!data;
}
