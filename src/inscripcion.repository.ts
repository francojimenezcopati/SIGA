import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CreateInscripcionDto } from '../schemas/inscripcion.schema';

export class InscripcionRepository {
  private getClient() {
    // Standard server client that respects user context and Supabase RLS policies
    return createServerComponentClient({ cookies });
  }

  async findAll() {
    const { data, error } = await this.getClient()
      .from('inscripciones')
      .select('*, materias(*)');
    if (error) throw error;
    return data;
  }

  async findByEstudianteId(estudianteId: string) {
    const { data, error } = await this.getClient()
      .from('inscripciones')
      .select('*, materias(*)')
      .eq('estudiante_id', estudianteId);
    if (error) throw error;
    return data;
  }

  async findByDocenteMaterias(docenteId: string) {
    const { data, error } = await this.getClient()
      .from('inscripciones')
      .select('*, materias!inner(*)')
      .eq('materias.docente_id', docenteId);
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.getClient()
      .from('inscripciones')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findExisting(estudianteId: string, materiaId: string) {
    const { data, error } = await this.getClient()
      .from('inscripciones')
      .select('id')
      .eq('estudiante_id', estudianteId)
      .eq('materia_id', materiaId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async checkMateriaExists(materiaId: string) {
    const { data, error } = await this.getClient()
      .from('materias')
      .select('id')
      .eq('id', materiaId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async create(estudianteId: string, dto: CreateInscripcionDto) {
    const { data, error } = await this.getClient()
      .from('inscripciones')
      .insert({ estudiante_id: estudianteId, materia_id: dto.materia_id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.getClient()
      .from('inscripciones')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}