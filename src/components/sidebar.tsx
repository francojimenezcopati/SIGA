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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/server/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
};

const NAV: Record<UserRole, NavItem[]> = {
  estudiante: [
    { href: "/dashboard",             label: "Inicio",             icon: GraduationCapIcon, enabled: true  },
    { href: "/dashboard/materias",    label: "Materias",           icon: BookOpenIcon,      enabled: true  },
    { href: "/dashboard/inscripciones",label:"Inscripciones",      icon: BookOpenIcon,      enabled: true  },
    { href: "/dashboard/notas",       label: "Notas",              icon: GraduationCapIcon, enabled: true  },
    { href: "/dashboard/tps",         label: "Trabajos prácticos", icon: FileTextIcon,      enabled: true  },
    { href: "/dashboard/avisos",      label: "Avisos",             icon: MegaphoneIcon,     enabled: true  },
    { href: "/dashboard/calendario",  label: "Calendario",         icon: CalendarIcon,      enabled: false },
  ],
  docente: [
    { href: "/dashboard",             label: "Inicio",             icon: GraduationCapIcon, enabled: true  },
    { href: "/dashboard/materias",    label: "Materias",           icon: BookOpenIcon,      enabled: true  },
    { href: "/dashboard/notas",       label: "Notas",              icon: GraduationCapIcon, enabled: true  },
    { href: "/dashboard/tps",         label: "Trabajos prácticos", icon: FileTextIcon,      enabled: true  },
    { href: "/dashboard/avisos",      label: "Avisos",             icon: MegaphoneIcon,     enabled: true  },
    { href: "/dashboard/calendario",  label: "Calendario",         icon: CalendarIcon,      enabled: false },
  ],
  administrador: [
    { href: "/dashboard",             label: "Inicio",             icon: GraduationCapIcon, enabled: true  },
    { href: "/dashboard/materias",    label: "Materias",           icon: BookOpenIcon,      enabled: true  },
    { href: "/dashboard/admin/usuarios",label:"Usuarios",          icon: UsersIcon,         enabled: true  },
    { href: "/dashboard/avisos",      label: "Avisos",             icon: MegaphoneIcon,     enabled: true  },
    { href: "/dashboard/periodos",    label: "Períodos",           icon: CalendarIcon,      enabled: false },
  ],
};

const ROLE_BADGE: Record<UserRole, { label: string; cls: string }> = {
  estudiante:    { label: "Estudiante", cls: "bg-slate-500/20  text-slate-300  border-slate-500/25"  },
  docente:       { label: "Docente",    cls: "bg-teal-500/15   text-teal-300   border-teal-500/25"   },
  administrador: { label: "Admin",      cls: "bg-violet-500/20 text-violet-300 border-violet-500/25" },
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

  const badge  = ROLE_BADGE[role];
  const initial = email?.charAt(0).toUpperCase() ?? "U";

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">

      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-sidebar-border">
        <GraduationCapIcon
          className="size-[18px] shrink-0"
          style={{ color: "oklch(0.72 0.17 165)" /* turquesa */ }}
        />
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
          SIGA
        </span>
        <span
          className={cn(
            "ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full border",
            badge.cls,
          )}
        >
          {badge.label}
        </span>
      </div>

      {/* ── Navegación ────────────────────────────────────────────────── */}
      <nav className="flex-1 py-2.5 px-2 space-y-0.5 overflow-y-auto">
        {NAV[role].map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          /* Items deshabilitados — ocultos en demo */
          if (!item.enabled) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors",
                active
                  ? [
                      "bg-sidebar-primary/15 text-sidebar-foreground font-medium",
                      "border-l-2 border-sidebar-primary pl-[10px]",
                    ]
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon
                className={cn(
                  "size-[15px] shrink-0",
                  active ? "text-sidebar-primary" : "text-sidebar-foreground/35",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* Avatar + email */}
        <div className="flex items-center gap-2.5 px-1">
          <div
            className="size-[26px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{
              background: "oklch(0.55 0.22 280 / 20%)",
              color:      "oklch(0.80 0.15 280)",
            }}
          >
            {initial}
          </div>
          <p className="truncate text-[11px] text-sidebar-foreground/40">
            {email}
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[12px] text-sidebar-foreground/35 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
        >
          <LogOutIcon className="size-3.5 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
