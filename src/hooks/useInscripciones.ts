import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/server/lib/supabase/database.types";

type Inscripcion = Database["public"]["Tables"]["inscripciones"]["Row"];
type Materia = Database["public"]["Tables"]["materias"]["Row"];
type CreateInscripcionDTO = {
  materia_id: string;
};

interface InscripcionesData {
  materiasDisponibles: Materia[];
  materiasInscritas: (Inscripcion & { materia: Materia })[];
}

async function fetchInscripciones(): Promise<InscripcionesData> {
  const resInscripciones = await fetch("/api/inscripciones");
  if (!resInscripciones.ok) {
    throw new Error("No se pudieron cargar tus inscripciones");
  }
  const inscripciones = (await resInscripciones.json()) as (Inscripcion & {
    materia: Materia;
  })[];

  const resMaterias = await fetch("/api/materias");
  if (!resMaterias.ok) {
    throw new Error("No se pudieron cargar las materias");
  }
  const allMaterias = (await resMaterias.json()) as Materia[];

  const enrolledMateriaIds = inscripciones.map((ins) => ins.materia_id);

  const materiasDisponibles = allMaterias.filter(
    (materia) => !enrolledMateriaIds.includes(materia.id),
  );

  return {
    materiasDisponibles,
    materiasInscritas: inscripciones,
  };
}

async function createInscripcion(
  data: CreateInscripcionDTO,
): Promise<Inscripcion> {
  const res = await fetch("/api/inscripciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const error = new Error(errorBody?.error ?? "Error al inscribirse");
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
}

async function deleteInscripcion(inscripcionId: string): Promise<void> {
  const res = await fetch(`/api/inscripciones/${inscripcionId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Error al dar de baja");
  }
}

export function useInscripciones() {
  return useQuery({
    queryKey: ["inscripciones"],
    queryFn: fetchInscripciones,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateInscripcion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInscripcion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] });
    },
  });
}

export function useDeleteInscripcion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInscripcion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] });
    },
  });
}