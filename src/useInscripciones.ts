// src/hooks/useInscripciones.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/server/lib/supabase/client';
import type { Database } from '@/server/lib/supabase/database.types';

type Inscripcion = Database['public']['Tables']['inscripciones']['Row'];
type Materia = Database['public']['Tables']['materias']['Row'];
type CreateInscripcionDTO = {
  materia_id: string;
};

interface InscripcionesData {
  materiasDisponibles: Materia[];
  materiasInscritas: (Inscripcion & { materia: Materia })[];
}

async function fetchInscripciones(): Promise<InscripcionesData> {
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Fetch enrolled subjects
  const { data: inscripciones, error: inscripcionesError } = await supabaseClient
    .from('inscripciones')
    .select(`
      *,
      materia:materias(*)
    `)
    .eq('estudiante_id', user.id);

  if (inscripcionesError) {
    throw new Error(inscripcionesError.message);
  }

  const enrolledMateriaIds = inscripciones?.map(ins => ins.materia_id) || [];

  // Fetch all available subjects
  const { data: allMaterias, error: materiasError } = await supabaseClient
    .from('materias')
    .select('*')
    .order('semestre', { ascending: true })
    .order('nombre', { ascending: true });

  if (materiasError) {
    throw new Error(materiasError.message);
  }

  // Filter available subjects (not enrolled)
  const materiasDisponibles = allMaterias?.filter(
    materia => !enrolledMateriaIds.includes(materia.id)
  ) || [];

  return {
    materiasDisponibles,
    materiasInscritas: inscripciones || [],
  };
}

async function createInscripcion(data: CreateInscripcionDTO): Promise<Inscripcion> {
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Check if already enrolled
  const { data: existing, error: checkError } = await supabaseClient
    .from('inscripciones')
    .select('id')
    .eq('estudiante_id', user.id)
    .eq('materia_id', data.materia_id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw new Error(checkError.message);
  }

  if (existing) {
    const error = new Error('Ya estás inscrito en esta materia');
    (error as any).status = 409;
    throw error;
  }

  const { data: inscripcion, error } = await supabaseClient
    .from('inscripciones')
    .insert({
      estudiante_id: user.id,
      materia_id: data.materia_id,
      fecha_inscripcion: new Date().toISOString(),
      estado: 'activa',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return inscripcion;
}

async function deleteInscripcion(inscripcionId: string): Promise<void> {
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { error } = await supabaseClient
    .from('inscripciones')
    .delete()
    .eq('id', inscripcionId)
    .eq('estudiante_id', user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export function useInscripciones() {
  return useQuery({
    queryKey: ['inscripciones'],
    queryFn: fetchInscripciones,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateInscripcion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createInscripcion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] });
    },
  });
}

export function useDeleteInscripcion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteInscripcion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] });
    },
  });
}