"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTps, useCreateTp, useEntregas, useCreateEntrega } from "@/hooks/useTps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, FileText, Plus, Calendar, CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface TpsViewProps {
  initialRole: string;
  userId: string;
}

export function TpsView({ initialRole, userId }: TpsViewProps) {
  const { data: tps, isLoading, refetch } = useTps();
  const createTpMutation = useCreateTp();
  const createEntregaMutation = useCreateEntrega();

  // Fetch materias for the dropdown (only for docentes/admins)
  const { data: materias } = useQuery<any[]>({
    queryKey: ["materias-for-tps"],
    queryFn: async () => {
      const res = await fetch("/api/materias");
      if (!res.ok) throw new Error("No se pudieron cargar las materias");
      return res.json();
    },
    enabled: initialRole !== "estudiante",
  });

  // Dialog and expanded states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [expandedTpId, setExpandedTpId] = useState<string | null>(null);
  const [submitTpId, setSubmitTpId] = useState<string>("");

  // Create TP form states
  const [selectedMateriaId, setSelectedMateriaId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");

  // Submit Entrega form states
  const [archivoUrl, setArchivoUrl] = useState("");
  const [comentario, setComentario] = useState("");

  const isEstudiante = initialRole === "estudiante";

  const handleCreateTp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMateriaId || !titulo || titulo.length < 3) {
      toast.error("Por favor completa los campos correctamente (Título mínimo 3 caracteres)");
      return;
    }

    try {
      await createTpMutation.mutateAsync({
        materia_id: selectedMateriaId,
        titulo,
        descripcion: descripcion || undefined,
        fecha_entrega: fechaEntrega ? new Date(fechaEntrega).toISOString() : null,
      });
      toast.success("Trabajo práctico registrado con éxito");
      setIsCreateOpen(false);
      // Reset form
      setSelectedMateriaId("");
      setTitulo("");
      setDescripcion("");
      setFechaEntrega("");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Error al registrar el trabajo práctico");
    }
  };

  const handleSubmitEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoUrl) {
      toast.error("Por favor ingresa la URL del archivo de entrega");
      return;
    }

    try {
      await createEntregaMutation.mutateAsync({
        tp_id: submitTpId,
        archivo_url: archivoUrl,
        comentario: comentario || undefined,
      });
      toast.success("Trabajo práctico entregado con éxito");
      setIsSubmitOpen(false);
      // Reset form
      setSubmitTpId("");
      setArchivoUrl("");
      setComentario("");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Error al enviar la entrega");
    }
  };

  const openSubmitDialog = (tpId: string) => {
    setSubmitTpId(tpId);
    setIsSubmitOpen(true);
  };

  const toggleExpandTp = (tpId: string) => {
    setExpandedTpId(expandedTpId === tpId ? null : tpId);
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) return renderSkeleton();

  // Group TPs by materia
  const groupedTps = (tps || []).reduce((acc: any, tp: any) => {
    const materiaNombre = tp.materia?.nombre || "Materia";
    const materiaCodigo = tp.materia?.codigo || "";
    const key = `${materiaCodigo} - ${materiaNombre}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tp);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Trabajos Prácticos
          </h1>
          <p className="text-muted-foreground">
            {isEstudiante
              ? "Revisa las consignas y envía tus resoluciones"
              : "Gestiona los trabajos prácticos y revisa las entregas de los alumnos"}
          </p>
        </div>

        {!isEstudiante && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo TP
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <form onSubmit={handleCreateTp}>
                <DialogHeader>
                  <DialogTitle>Crear Trabajo Práctico</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo trabajo práctico para una materia.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="materia">Materia</Label>
                    <select
                      id="materia"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedMateriaId}
                      onChange={(e) => setSelectedMateriaId(e.target.value)}
                      required
                    >
                      <option value="">Selecciona una materia...</option>
                      {(materias || []).map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.nombre} ({mat.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      placeholder="Ej: TP 1: Introducción a React"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="descripcion">Consigna / Descripción</Label>
                    <textarea
                      id="descripcion"
                      placeholder="Escribe la consigna del trabajo práctico..."
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fecha_entrega">Fecha de Entrega (Opcional)</Label>
                    <Input
                      id="fecha_entrega"
                      type="date"
                      value={fechaEntrega}
                      onChange={(e) => setFechaEntrega(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createTpMutation.isPending}>
                    {createTpMutation.isPending ? "Creando..." : "Crear Trabajo Práctico"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {Object.keys(groupedTps).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg">Sin trabajos prácticos</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              No se han registrado trabajos prácticos para tus materias hasta el momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTps).map(([materiaKey, tpsMateria]: [string, any]) => (
            <div key={materiaKey} className="space-y-4">
              <div className="border-b pb-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/90">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {materiaKey.split(" - ")[1]}
                  <span className="text-xs font-normal text-muted-foreground">({materiaKey.split(" - ")[0]})</span>
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {tpsMateria.map((tp: any) => {
                  const hasSubmitted = tp.entregas && tp.entregas.length > 0;
                  const formattedDate = tp.fecha_entrega
                    ? new Date(tp.fecha_entrega).toLocaleDateString()
                    : "Sin fecha límite";

                  return (
                    <Card key={tp.id} className="flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg font-bold">{tp.titulo}</CardTitle>
                          {isEstudiante && (
                            <Badge variant={hasSubmitted ? "default" : "outline"} className="shrink-0">
                              {hasSubmitted ? "Entregado ✓" : "Pendiente"}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-1 text-xs mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Límite: {formattedDate}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                          {tp.consigna || <span className="italic text-muted-foreground">Sin consigna detallada</span>}
                        </p>
                      </CardContent>
                      <CardFooter className="flex-col items-stretch pt-2 border-t gap-2">
                        {isEstudiante ? (
                          !hasSubmitted ? (
                            <Button onClick={() => openSubmitDialog(tp.id)} className="w-full">
                              Entregar Trabajo
                            </Button>
                          ) : (
                            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-accent/20 border text-xs">
                              <p className="font-semibold flex items-center gap-1 text-success">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Entregado correctamente
                              </p>
                              <p className="text-muted-foreground break-all">
                                <strong>Archivo:</strong>{" "}
                                <a
                                  href={tp.entregas[0].archivo_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {tp.entregas[0].archivo_path}
                                </a>
                              </p>
                              {tp.entregas[0].comentario && (
                                <p className="text-muted-foreground">
                                  <strong>Comentario:</strong> {tp.entregas[0].comentario}
                                </p>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="w-full space-y-2">
                            <Button
                              variant="outline"
                              onClick={() => toggleExpandTp(tp.id)}
                              className="w-full justify-between gap-2"
                            >
                              <span>Ver entregas de alumnos</span>
                              {expandedTpId === tp.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            {expandedTpId === tp.id && <EntregaList tpId={tp.id} />}
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Entrega Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmitEntrega}>
            <DialogHeader>
              <DialogTitle>Enviar Entrega</DialogTitle>
              <DialogDescription>
                Proporciona la URL de resolución de tu trabajo práctico.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="archivo_url">URL del archivo</Label>
                <Input
                  id="archivo_url"
                  type="url"
                  placeholder="https://github.com/... o https://drive.google.com/..."
                  value={archivoUrl}
                  onChange={(e) => setArchivoUrl(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="comentario">Comentario (Opcional)</Label>
                <textarea
                  id="comentario"
                  placeholder="Mensaje para el docente..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createEntregaMutation.isPending}>
                {createEntregaMutation.isPending ? "Enviando..." : "Enviar Entrega"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EntregaList({ tpId }: { tpId: string }) {
  const { data: entregas, isLoading } = useEntregas(tpId);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2 border rounded-lg bg-muted/10">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (!entregas || entregas.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg bg-muted/10">
        No hay entregas registradas para este trabajo práctico.
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-muted/10 overflow-hidden">
      <div className="px-4 py-2 border-b bg-muted/20">
        <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Entregas de Estudiantes:</h4>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs h-8 pl-4">Estudiante</TableHead>
            <TableHead className="text-xs h-8">Archivo / URL</TableHead>
            <TableHead className="text-xs h-8">Comentario</TableHead>
            <TableHead className="text-xs h-8 pr-4">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entregas.map((entrega: any) => (
            <TableRow key={entrega.id} className="hover:bg-accent/5">
              <TableCell className="font-medium text-xs py-2 pl-4">
                {entrega.estudiante?.full_name || entrega.estudiante?.email || "Estudiante"}
              </TableCell>
              <TableCell className="text-xs py-2">
                <a
                  href={entrega.archivo_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Ver resolución
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs py-2 max-w-[120px] truncate" title={entrega.comentario || ""}>
                {entrega.comentario || <span className="italic">Sin comentario</span>}
              </TableCell>
              <TableCell className="text-[10px] text-muted-foreground py-2 pr-4">
                {new Date(entrega.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
