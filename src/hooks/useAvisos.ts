import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/server/lib/supabase/database.types";

type Aviso = Database["public"]["Tables"]["avisos"]["Row"];
type CreateAvisoDTO = {
  titulo: string;
  contenido: string;
  materia_id?: string | null;
};

async function fetchAvisos(materiaId?: string): Promise<any[]> {
  const qs = materiaId ? `?materia_id=${encodeURIComponent(materiaId)}` : "";
  const res = await fetch(`/api/avisos${qs}`);
  if (!res.ok) {
    throw new Error("No se pudieron cargar los avisos");
  }
  return res.json();
}

async function createAviso(data: CreateAvisoDTO): Promise<Aviso> {
  const res = await fetch("/api/avisos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Error al publicar el aviso");
  }

  return res.json();
}

export function useAvisos(materiaId?: string) {
  return useQuery({
    queryKey: ["avisos", materiaId],
    queryFn: () => fetchAvisos(materiaId),
  });
}

export function useCreateAviso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAviso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avisos"] });
    },
  });
}
