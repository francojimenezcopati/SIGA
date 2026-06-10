"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAvisos, useCreateAviso } from "@/hooks/useAvisos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Megaphone, Plus, BookOpen, User, Calendar, Info } from "lucide-react";

interface AvisosViewProps {
  initialRole: string;
  userId: string;
}

export function AvisosView({ initialRole, userId }: AvisosViewProps) {
  const { data: avisos, isLoading, refetch } = useAvisos();
  const createAvisoMutation = useCreateAviso();

  // Fetch materias for the dropdown (only for docentes/admins)
  const { data: materias } = useQuery<any[]>({
    queryKey: ["materias-for-avisos"],
    queryFn: async () => {
      const res = await fetch("/api/materias");
      if (!res.ok) throw new Error("No se pudieron cargar las materias");
      return res.json();
    },
    enabled: initialRole !== "estudiante",
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [selectedMateriaId, setSelectedMateriaId] = useState("");

  const handleCreateAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !contenido) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    try {
      await createAvisoMutation.mutateAsync({
        titulo,
        contenido,
        materia_id: selectedMateriaId || null,
      });
      toast.success("Aviso publicado con éxito");
      setIsCreateOpen(false);
      // Reset form
      setTitulo("");
      setContenido("");
      setSelectedMateriaId("");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Error al publicar el aviso");
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-5 w-1/2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) return renderSkeleton();

  const canCreate = initialRole === "docente" || initialRole === "administrador";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Avisos y Comunicados
          </h1>
          <p className="text-muted-foreground">
            Mantente al tanto de las novedades globales y de tus materias
          </p>
        </div>

        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateAviso}>
                <DialogHeader>
                  <DialogTitle>Publicar Nuevo Aviso</DialogTitle>
                  <DialogDescription>
                    Crea un comunicado para los estudiantes. Si seleccionas una materia, solo los inscriptos en ella lo verán.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      placeholder="Ej: Reprogramación de examen, Lectura obligatoria"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="materia">Materia (Opcional - Vacío para aviso global)</Label>
                    <select
                      id="materia"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedMateriaId}
                      onChange={(e) => setSelectedMateriaId(e.target.value)}
                    >
                      <option value="">Aviso Global (Todos los usuarios)</option>
                      {(materias || []).map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.nombre} ({mat.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contenido">Contenido del Comunicado</Label>
                    <textarea
                      id="contenido"
                      placeholder="Escribe el mensaje detallado aquí..."
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createAvisoMutation.isPending}>
                    {createAvisoMutation.isPending ? "Publicando..." : "Publicar Aviso"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {(!avisos || avisos.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg">No hay avisos</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              No se han publicado comunicados en el sistema hasta el momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {avisos.map((aviso: any) => (
            <Card key={aviso.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl font-bold leading-none">{aviso.titulo}</CardTitle>
                  <Badge variant={aviso.materia ? "secondary" : "default"} className="shrink-0 text-xs">
                    {aviso.materia ? aviso.materia.nombre : "Global"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs mt-1">
                  <User className="h-3 w-3" />
                  <span>Por {aviso.autor?.full_name || aviso.autor?.email || "Sistema"}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="py-3 flex-grow">
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{aviso.contenido}</p>
              </CardContent>
              <CardFooter className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(aviso.created_at).toLocaleDateString()} a las {new Date(aviso.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {aviso.materia && (
                  <span className="flex items-center gap-1 font-semibold text-primary/80">
                    <BookOpen className="h-3 w-3" />
                    {aviso.materia.codigo}
                  </span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
