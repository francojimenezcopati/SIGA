import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/server/lib/supabase/database.types";

type TrabajosPracticos = Database["public"]["Tables"]["trabajos_practicos"]["Row"];
type Entrega = Database["public"]["Tables"]["entregas"]["Row"];

type CreateTpDTO = {
  materia_id: string;
  titulo: string;
  descripcion?: string;
  fecha_entrega?: string | null;
};

type CreateEntregaDTO = {
  tp_id: string;
  archivo_url: string;
  comentario?: string;
};

async function fetchTps(materiaId?: string): Promise<any[]> {
  const qs = materiaId ? `?materia_id=${encodeURIComponent(materiaId)}` : "";
  const res = await fetch(`/api/tps${qs}`);
  if (!res.ok) {
    throw new Error("No se pudieron cargar los trabajos prácticos");
  }
  return res.json();
}

async function createTp(data: CreateTpDTO): Promise<TrabajosPracticos> {
  const res = await fetch("/api/tps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Error al registrar el trabajo práctico");
  }

  return res.json();
}

async function fetchEntregas(tpId: string): Promise<any[]> {
  const res = await fetch(`/api/tps/${tpId}/entregas`);
  if (!res.ok) {
    throw new Error("No se pudieron cargar las entregas");
  }
  return res.json();
}

async function createEntrega(data: CreateEntregaDTO): Promise<Entrega> {
  const { tp_id, ...body } = data;
  const res = await fetch(`/api/tps/${tp_id}/entregas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Error al enviar la entrega");
  }

  return res.json();
}

export function useTps(materiaId?: string) {
  return useQuery({
    queryKey: ["tps", materiaId],
    queryFn: () => fetchTps(materiaId),
  });
}

export function useCreateTp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tps"] });
    },
  });
}

export function useEntregas(tpId: string) {
  return useQuery({
    queryKey: ["entregas", tpId],
    queryFn: () => fetchEntregas(tpId),
    enabled: !!tpId,
  });
}

export function useCreateEntrega() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntrega,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entregas", variables.tp_id] });
      queryClient.invalidateQueries({ queryKey: ["tps"] });
    },
  });
}
