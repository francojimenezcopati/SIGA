"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createMateria, fetchMaterias, type CreateMateriaInput } from "./api";

export function useMaterias(search: string) {
  return useQuery({
    queryKey: ["materias", search],
    queryFn: () => fetchMaterias(search || undefined),
  });
}

export function useCreateMateria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMateriaInput) => createMateria(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materias"] });
    },
  });
}
