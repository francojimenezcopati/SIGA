"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateMateriaDialog } from "./create-materia-dialog";
import { useMaterias } from "./use-materias";

export function MateriasView({ canCreate }: { canCreate: boolean }) {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error } = useMaterias(search);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Materias</h1>
          <p className="text-sm text-muted-foreground">
            {canCreate
              ? "Gestioná las materias disponibles."
              : "Consultá las materias disponibles."}
          </p>
        </div>
        {canCreate && <CreateMateriaDialog />}
      </div>

      <Input
        placeholder="Buscar por nombre o código..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-24 text-center">Cupo</TableHead>
              <TableHead className="w-28">Período</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-destructive"
                >
                  {(error as Error).message}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No hay materias para mostrar.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              data?.map((materia) => (
                <TableRow key={materia.id}>
                  <TableCell>
                    <Badge variant="secondary">{materia.codigo}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{materia.nombre}</TableCell>
                  <TableCell className="text-center">{materia.cupo}</TableCell>
                  <TableCell>{materia.periodo ?? "—"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
