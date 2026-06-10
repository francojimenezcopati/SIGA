"use client";

import { useState } from "react";
import { useUsuarios, usePatchUsuario } from "@/hooks/useUsuarios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, ShieldAlert, Edit2 } from "lucide-react";
import type { Database } from "@/server/lib/supabase/database.types";

interface UsuariosViewProps {
  userId: string;
}

type UserRole = Database["public"]["Enums"]["user_role"];

export function UsuariosView({ userId }: UsuariosViewProps) {
  const { data: usuarios, isLoading, refetch } = useUsuarios();
  const patchUsuarioMutation = usePatchUsuario();

  // Dialog state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("estudiante");

  const handleOpenRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Prevents self-demotion
    if (selectedUser.id === userId && selectedRole !== "administrador") {
      toast.error("No puedes quitarte el rol de administrador a ti mismo.");
      return;
    }

    try {
      await patchUsuarioMutation.mutateAsync({
        id: selectedUser.id,
        role: selectedRole,
      });
      toast.success(`Rol de ${selectedUser.full_name || selectedUser.email} actualizado a ${selectedRole}`);
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar el rol de usuario");
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) return renderSkeleton();

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "administrador":
        return "default";
      case "docente":
        return "secondary";
      case "estudiante":
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Administración de Usuarios
        </h1>
        <p className="text-muted-foreground">
          Gestiona los accesos y roles (estudiantes, docentes y administradores) a nivel de plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado Global de Usuarios</CardTitle>
          <CardDescription>
            Visualiza los perfiles de usuario y cambia sus privilegios en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {(!usuarios || usuarios.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron usuarios registrados en la base de datos.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol Actual</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-accent/10">
                    <TableCell className="font-medium pl-6">
                      {user.full_name || <span className="text-muted-foreground italic">Sin registrar</span>}
                    </TableCell>
                    <TableCell>{user.email || <span className="text-muted-foreground italic">Desconocido</span>}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleOpenRoleDialog(user)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Cambiar Rol
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Selector Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          {selectedUser && (
            <form onSubmit={handleUpdateRole}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-warning" />
                  Modificar Rol de Usuario
                </DialogTitle>
                <DialogDescription>
                  Cambia los permisos y accesos de **{selectedUser.full_name || selectedUser.email}**.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role-select">Selecciona el nuevo Rol</Label>
                  <select
                    id="role-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  >
                    <option value="estudiante">estudiante</option>
                    <option value="docente">docente</option>
                    <option value="administrador">administrador</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsRoleDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={patchUsuarioMutation.isPending}>
                  {patchUsuarioMutation.isPending ? "Aplicando..." : "Confirmar Cambio"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
