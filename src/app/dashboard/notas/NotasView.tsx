"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNotas, useCreateNota, usePatchNota } from "@/hooks/useNotas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, Edit3, Plus, GraduationCap, Calendar, Award } from "lucide-react";

interface NotasViewProps {
  initialRole: string;
  userId: string;
}

export function NotasView({ initialRole, userId }: NotasViewProps) {
  const { data: notas, isLoading, refetch } = useNotas();
  const createNotaMutation = useCreateNota();
  const patchNotaMutation = usePatchNota();

  // Fetch enrollments (inscripciones) for the dropdown when creating/editing grades (docente/admin)
  const { data: inscripciones, isLoading: isLoadingInscripciones } = useQuery<any[]>({
    queryKey: ["inscripciones-for-notes"],
    queryFn: async () => {
      const res = await fetch("/api/inscripciones");
      if (!res.ok) throw new Error("No se pudieron cargar las inscripciones");
      return res.json();
    },
    enabled: initialRole !== "estudiante",
  });

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form states
  const [selectedInscripcionId, setSelectedInscripcionId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [editingNotaId, setEditingNotaId] = useState("");

  const handleCreateNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInscripcionId || !descripcion || valor < 0 || valor > 10) {
      toast.error("Por favor completa todos los campos correctamente (Nota entre 0 y 10)");
      return;
    }

    try {
      await createNotaMutation.mutateAsync({
        inscripcion_id: selectedInscripcionId,
        descripcion,
        valor,
      });
      toast.success("Calificación registrada con éxito");
      setIsCreateOpen(false);
      // Reset form
      setSelectedInscripcionId("");
      setDescripcion("");
      setValor(0);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Error al registrar la calificación");
    }
  };

  const handleEditNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion || valor < 0 || valor > 10) {
      toast.error("Por favor ingresa datos válidos (Nota entre 0 y 10)");
      return;
    }

    try {
      await patchNotaMutation.mutateAsync({
        id: editingNotaId,
        descripcion,
        valor,
      });
      toast.success("Calificación actualizada con éxito");
      setIsEditOpen(false);
      // Reset form
      setEditingNotaId("");
      setDescripcion("");
      setValor(0);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar la calificación");
    }
  };

  const openEditDialog = (nota: any) => {
    setEditingNotaId(nota.id);
    setDescripcion(nota.descripcion);
    setValor(nota.valor);
    setIsEditOpen(true);
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) return renderSkeleton();

  const isEstudiante = initialRole === "estudiante";

  // Group notas by materia (only for student view display)
  const groupedNotas = (notas || []).reduce((acc: any, nota: any) => {
    const materiaNombre = nota.inscripcion?.materia?.nombre || "Materia";
    const materiaCodigo = nota.inscripcion?.materia?.codigo || "";
    const key = `${materiaCodigo} - ${materiaNombre}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(nota);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calificaciones</h1>
          <p className="text-muted-foreground">
            {isEstudiante
              ? "Consulta tu historial de notas y promedios por materia"
              : "Registra y edita las calificaciones de los estudiantes"}
          </p>
        </div>

        {!isEstudiante && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Cargar Nota
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateNota}>
                <DialogHeader>
                  <DialogTitle>Registrar Calificación</DialogTitle>
                  <DialogDescription>
                    Carga una nueva calificación para un alumno en una materia.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="inscripcion">Estudiante e Inscripción</Label>
                    <select
                      id="inscripcion"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedInscripcionId}
                      onChange={(e) => setSelectedInscripcionId(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un alumno...</option>
                      {(inscripciones || []).map((ins) => (
                        <option key={ins.id} value={ins.id}>
                          {ins.estudiante?.full_name || ins.estudiante?.email} ({ins.materia?.nombre})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="descripcion">Descripción / Evaluación</Label>
                    <Input
                      id="descripcion"
                      placeholder="Ej: Primer Parcial, Integrador"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="valor">Nota (0 - 10)</Label>
                    <Input
                      id="valor"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={valor}
                      onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createNotaMutation.isPending}>
                    {createNotaMutation.isPending ? "Registrando..." : "Registrar Nota"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isEstudiante ? (
        Object.keys(groupedNotas).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">Sin calificaciones</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                Aún no tienes calificaciones registradas en ninguna materia.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(groupedNotas).map(([materiaKey, notasMateria]: [string, any]) => {
              const total = notasMateria.reduce((sum: number, n: any) => sum + n.valor, 0);
              const promedio = (total / notasMateria.length).toFixed(2);
              const esAprobado = parseFloat(promedio) >= 4;

              return (
                <Card key={materiaKey} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-accent/30 py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {materiaKey.split(" - ")[1]}
                      </CardTitle>
                      <CardDescription className="text-xs">Código: {materiaKey.split(" - ")[0]}</CardDescription>
                    </div>
                    <Badge variant={esAprobado ? "default" : "destructive"} className="text-sm font-semibold px-3 py-1">
                      Promedio: {promedio}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Evaluación</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right pr-6">Nota</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notasMateria.map((nota: any) => (
                          <TableRow key={nota.id} className="hover:bg-accent/10">
                            <TableCell className="font-medium pl-6">{nota.descripcion}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(nota.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Badge variant={nota.valor >= 4 ? "secondary" : "outline"} className="font-bold">
                                {nota.valor.toFixed(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* Docente / Admin View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Listado de Notas cargadas
            </CardTitle>
            <CardDescription>
              Aquí puedes visualizar y editar las calificaciones que has cargado.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {(!notas || notas.length === 0) ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay calificaciones cargadas aún.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Estudiante</TableHead>
                    <TableHead>Materia</TableHead>
                    <TableHead>Evaluación</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notas.map((nota: any) => (
                    <TableRow key={nota.id} className="hover:bg-accent/10">
                      <TableCell className="font-medium pl-6">
                        {nota.inscripcion?.estudiante?.full_name || nota.inscripcion?.estudiante?.email}
                      </TableCell>
                      <TableCell>{nota.inscripcion?.materia?.nombre}</TableCell>
                      <TableCell>{nota.descripcion}</TableCell>
                      <TableCell>
                        <Badge variant={nota.valor >= 4 ? "default" : "destructive"}>
                          {nota.valor.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(nota.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(nota)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditNota}>
            <DialogHeader>
              <DialogTitle>Editar Calificación</DialogTitle>
              <DialogDescription>
                Modifica los datos de la calificación del estudiante.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-descripcion">Descripción / Evaluación</Label>
                <Input
                  id="edit-descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-valor">Nota (0 - 10)</Label>
                <Input
                  id="edit-valor"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={valor}
                  onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={patchNotaMutation.isPending}>
                {patchNotaMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
