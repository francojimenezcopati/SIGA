// src/app/dashboard/inscripciones/InscripcionesView.tsx
'use client';

import { useInscripciones, useCreateInscripcion, useDeleteInscripcion } from '@/hooks/useInscripciones';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { BookOpen, Trash2, Plus } from 'lucide-react';

interface InscripcionesViewProps {
  initialRole: string;
}

interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: number;
  cupos_disponibles: number;
}

export function InscripcionesView({ initialRole }: InscripcionesViewProps) {
  const { data: inscripcionesData, isLoading: isLoadingInscripciones, refetch: refetchInscripciones } = useInscripciones();
  const createInscripcion = useCreateInscripcion();
  const deleteInscripcion = useDeleteInscripcion();

  const { materiasDisponibles, materiasInscritas } = inscripcionesData || {
    materiasDisponibles: [],
    materiasInscritas: [],
  };

  const handleInscribirse = async (materiaId: string, materiaNombre: string) => {
    try {
      await createInscripcion.mutateAsync({ materia_id: materiaId });
      toast.success(`Inscripción exitosa`, {
        description: `Te has inscrito en ${materiaNombre}`,
      });
      await refetchInscripciones();
    } catch (error: any) {
      if (error?.status === 409) {
        toast.error('Ya estás inscrito', {
          description: 'Ya te encuentras inscrito en esta materia',
        });
      } else {
        toast.error('Error al inscribir', {
          description: error?.message || 'No se pudo completar la inscripción',
        });
      }
    }
  };

  const handleDarDeBaja = async (inscripcionId: string, materiaNombre: string) => {
    try {
      await deleteInscripcion.mutateAsync(inscripcionId);
      toast.success(`Baja exitosa`, {
        description: `Te has dado de baja de ${materiaNombre}`,
      });
      await refetchInscripciones();
    } catch (error: any) {
      toast.error('Error al dar de baja', {
        description: error?.message || 'No se pudo completar la baja',
      });
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoadingInscripciones) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inscripciones</h1>
        <p className="text-muted-foreground">
          Gestiona tu inscripción a materias
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Materias Disponibles Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Materias Disponibles
            </CardTitle>
            <CardDescription>
              Materias a las que puedes inscribirte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {materiasDisponibles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay materias disponibles para inscripción
              </div>
            ) : (
              <div className="space-y-4">
                {materiasDisponibles.map((materia: Materia) => (
                  <div
                    key={materia.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{materia.nombre}</h3>
                        <Badge variant="outline">{materia.codigo}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Semestre {materia.semestre} • {materia.creditos} créditos
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          Cupos: {materia.cupos_disponibles}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleInscribirse(materia.id, materia.nombre)}
                      disabled={createInscripcion.isPending}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Inscribirse
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mis Inscripciones Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mis Inscripciones
            </CardTitle>
            <CardDescription>
              Materias en las que estás inscrito
            </CardDescription>
          </CardHeader>
          <CardContent>
            {materiasInscritas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No estás inscrito en ninguna materia
              </div>
            ) : (
              <div className="space-y-4">
                {materiasInscritas.map((inscripcion: any) => (
                  <div
                    key={inscripcion.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{inscripcion.materia.nombre}</h3>
                        <Badge variant="outline">{inscripcion.materia.codigo}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Semestre {inscripcion.materia.semestre} • {inscripcion.materia.creditos} créditos
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Inscrito: {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleDarDeBaja(inscripcion.id, inscripcion.materia.nombre)}
                      disabled={deleteInscripcion.isPending}
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Dar de baja
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}