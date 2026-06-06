"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateMateria } from "./use-materias";

export function CreateMateriaDialog() {
  const [open, setOpen] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cupo, setCupo] = useState("30");
  const [periodo, setPeriodo] = useState("");

  const { mutate, isPending } = useCreateMateria();

  function reset() {
    setCodigo("");
    setNombre("");
    setDescripcion("");
    setCupo("30");
    setPeriodo("");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutate(
      {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        cupo: Number(cupo),
        periodo: periodo.trim() || null,
      },
      {
        onSuccess: (materia) => {
          toast.success(`Materia "${materia.nombre}" creada`);
          reset();
          setOpen(false);
        },
        onError: (err) => {
          toast.error("No se pudo crear la materia", {
            description: (err as Error).message,
          });
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="size-4" /> Nueva materia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva materia</DialogTitle>
          <DialogDescription>Completá los datos de la materia.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                required
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="MAT201"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cupo">Cupo</Label>
              <Input
                id="cupo"
                type="number"
                min={0}
                value={cupo}
                onChange={(event) => setCupo(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              required
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Álgebra"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
            <Input
              id="periodo"
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
              placeholder="2026-1"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear materia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
