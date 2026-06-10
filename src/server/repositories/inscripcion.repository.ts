import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { CreateInscripcionDto } from "../schemas/inscripcion.schema";

export class InscripcionRepository {
  private async getClient() {
    // Standard server client that respects user context and Supabase RLS policies
    return createSupabaseServerClient();
  }

  async findAll() {
    const client = await this.getClient();
    const { data, error } = await client
      .from("inscripciones")
      .select("*, materia:materias(*)");
    if (error) throw error;
    return data;
  }

  async findByEstudianteId(estudianteId: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("inscripciones")
      .select("*, materia:materias(*)")
      .eq("estudiante_id", estudianteId);
    if (error) throw error;
    return data;
  }

  async findByDocenteMaterias(docenteId: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("inscripciones")
      .select("*, materia:materias!inner(*)")
      .eq("materias.docente_id", docenteId);
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("inscripciones")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findExisting(estudianteId: string, materiaId: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("inscripciones")
      .select("id")
      .eq("estudiante_id", estudianteId)
      .eq("materia_id", materiaId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async checkMateriaExists(materiaId: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("materias")
      .select("id")
      .eq("id", materiaId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async create(estudianteId: string, dto: CreateInscripcionDto) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("inscripciones")
      .insert({ estudiante_id: estudianteId, materia_id: dto.materia_id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const client = await this.getClient();
    const { error } = await client
      .from("inscripciones")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
}