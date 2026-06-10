"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenIcon,
  CalendarIcon,
  FileTextIcon,
  GraduationCapIcon,
  LogOutIcon,
  MegaphoneIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/server/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
};

// Navegación por rol (README). Solo "Materias" está implementado en esta fase;
// el resto queda visible como "Próximamente" (deshabilitado).
const NAV: Record<UserRole, NavItem[]> = {
  estudiante: [
    { href: "/dashboard/materias", label: "Materias", icon: BookOpenIcon, enabled: true },
    { href: "/dashboard/inscripciones", label: "Inscripciones", icon: BookOpenIcon, enabled: true },
    { href: "/dashboard/notas", label: "Notas", icon: GraduationCapIcon, enabled: true },
    { href: "/dashboard/tps", label: "Trabajos prácticos", icon: FileTextIcon, enabled: false },
    { href: "/dashboard/calendario", label: "Calendario", icon: CalendarIcon, enabled: false },
    { href: "/dashboard/avisos", label: "Avisos", icon: MegaphoneIcon, enabled: true },
  ],
  docente: [
    { href: "/dashboard/materias", label: "Materias", icon: BookOpenIcon, enabled: true },
    { href: "/dashboard/notas", label: "Notas", icon: GraduationCapIcon, enabled: true },
    { href: "/dashboard/avisos", label: "Avisos", icon: MegaphoneIcon, enabled: true },
    { href: "/dashboard/calendario", label: "Calendario", icon: CalendarIcon, enabled: false },
  ],
  administrador: [
    { href: "/dashboard/materias", label: "Materias", icon: BookOpenIcon, enabled: true },
    { href: "/dashboard/admin/usuarios", label: "Usuarios", icon: UsersIcon, enabled: true },
    { href: "/dashboard/avisos", label: "Avisos", icon: MegaphoneIcon, enabled: true },
    { href: "/dashboard/periodos", label: "Períodos", icon: CalendarIcon, enabled: false },
  ],
};

const ROLE_LABEL: Record<UserRole, string> = {
  estudiante: "Estudiante",
  docente: "Docente",
  administrador: "Administrador",
};

export function Sidebar({
  role,
  email,
}: {
  role: UserRole;
  email: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b p-4">
        <p className="text-lg font-semibold">SIGA</p>
        <p className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</p>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {NAV[role].map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          if (!item.enabled) {
            return (
              <span
                key={item.href}
                title="Próximamente"
                className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground/60"
              >
                <Icon className="size-4" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent",
                active && "bg-sidebar-accent font-medium",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t p-4">
        <p className="truncate text-xs text-muted-foreground">{email}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
