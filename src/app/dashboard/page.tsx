import Link from "next/link";
import {
  BookOpenIcon,
  FileTextIcon,
  GraduationCapIcon,
  MegaphoneIcon,
  UsersIcon,
  ListChecksIcon,
} from "lucide-react";

import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/server/lib/auth";

/* ── Módulos por rol ─────────────────────────────────────────────────────── */
type ModuleCard = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

const MODULES: Record<UserRole, ModuleCard[]> = {
  estudiante: [
    { href: "/dashboard/materias",      icon: BookOpenIcon,      title: "Materias",             desc: "Consultá las materias disponibles" },
    { href: "/dashboard/inscripciones", icon: ListChecksIcon,    title: "Inscripciones",        desc: "Tus materias inscriptas" },
    { href: "/dashboard/notas",         icon: GraduationCapIcon, title: "Notas",                desc: "Tus calificaciones por materia" },
    { href: "/dashboard/tps",           icon: FileTextIcon,      title: "Trabajos prácticos",   desc: "Entregas pendientes y realizadas" },
    { href: "/dashboard/avisos",        icon: MegaphoneIcon,     title: "Avisos",               desc: "Comunicados institucionales" },
  ],
  docente: [
    { href: "/dashboard/materias",      icon: BookOpenIcon,      title: "Mis materias",         desc: "Materias a tu cargo" },
    { href: "/dashboard/notas",         icon: GraduationCapIcon, title: "Notas",                desc: "Cargá calificaciones" },
    { href: "/dashboard/tps",           icon: FileTextIcon,      title: "Trabajos prácticos",   desc: "Creá y revisá TPs" },
    { href: "/dashboard/avisos",        icon: MegaphoneIcon,     title: "Avisos",               desc: "Publicá comunicados" },
  ],
  administrador: [
    { href: "/dashboard/materias",       icon: BookOpenIcon,      title: "Materias",             desc: "Gestión global de materias" },
    { href: "/dashboard/admin/usuarios", icon: UsersIcon,         title: "Usuarios",             desc: "ABM de cuentas del sistema" },
    { href: "/dashboard/avisos",         icon: MegaphoneIcon,     title: "Avisos",               desc: "Comunicados institucionales" },
  ],
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function displayName(email: string | null) {
  if (!email) return "usuario";
  return email.split("@")[0];
}

/* ── Componente ──────────────────────────────────────────────────────────── */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  if (!auth) return null;

  const cards = MODULES[auth.role] ?? [];

  return (
    <div className="max-w-4xl space-y-8">

      {/* ── Encabezado ──────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {greeting()}, {displayName(auth.email)}
        </h1>
        <p className="text-muted-foreground text-[15px]">
          ¿Qué querés hacer hoy?
        </p>
      </div>

      {/* ── Grid de módulos ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className={cn(
                "module-card group flex flex-col gap-4 rounded-xl border border-border bg-card p-5",
              )}
            >
              <div className="module-icon">
                <Icon />
              </div>
              <div className="space-y-0.5">
                <p className="font-medium text-[13px] text-card-foreground">
                  {card.title}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {card.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
