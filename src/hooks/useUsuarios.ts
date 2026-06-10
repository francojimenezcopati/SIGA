import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/server/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PatchUsuarioRoleDTO = {
  id: string;
  role: Database["public"]["Enums"]["user_role"];
};

async function fetchUsuarios(): Promise<Profile[]> {
  const res = await fetch("/api/admin/usuarios");
  if (!res.ok) {
    throw new Error("No se pudo cargar el listado de usuarios");
  }
  return res.json();
}

async function patchUsuarioRole(data: PatchUsuarioRoleDTO): Promise<Profile> {
  const { id, role } = data;
  const res = await fetch(`/api/admin/usuarios/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Error al actualizar el rol de usuario");
  }

  return res.json();
}

export function useUsuarios() {
  return useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: fetchUsuarios,
  });
}

export function usePatchUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchUsuarioRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
      // Invalida también notas e inscripciones por las dudas
      queryClient.invalidateQueries({ queryKey: ["notas"] });
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] });
    },
  });
}
