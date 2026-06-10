import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/server/lib/supabase/database.types";

type Nota = Database["public"]["Tables"]["notas"]["Row"];
type CreateNotaDTO = {
  inscripcion_id: string;
  descripcion: string;
  valor: number;
};
type PatchNotaDTO = {
  id: string;
  descripcion?: string;
  valor?: number;
};

async function fetchNotas(materiaId?: string): Promise<any[]> {
  const qs = materiaId ? `?materia_id=${encodeURIComponent(materiaId)}` : "";
  const res = await fetch(`/api/notas${qs}`);
  if (!res.ok) {
    throw new Error("No se pudieron cargar las calificaciones");
  }
  return res.json();
}

async function createNota(data: CreateNotaDTO): Promise<Nota> {
  const res = await fetch("/api/notas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Error al registrar la calificación");
  }

  return res.json();
}

async function patchNota(data: PatchNotaDTO): Promise<Nota> {
  const { id, ...body } = data;
  const res = await fetch(`/api/notas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Error al actualizar la calificación");
  }

  return res.json();
}

export function useNotas(materiaId?: string) {
  return useQuery({
    queryKey: ["notas", materiaId],
    queryFn: () => fetchNotas(materiaId),
  });
}

export function useCreateNota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNota,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });
    },
  });
}

export function usePatchNota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchNota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });
    },
  });
}
