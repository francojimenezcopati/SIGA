import { Suspense } from "react";
import { GraduationCapIcon } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    /*
     * La página de login vive fuera del layout del dashboard — no recibe
     * la clase .dark automáticamente del layout. La ponemos aquí
     * directamente para que el panel de marca siempre sea oscuro.
     */
    <div className="dark flex min-h-screen bg-background">

      {/* ── Panel izquierdo — identidad de marca ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden bg-sidebar border-r border-sidebar-border">

        {/* Glows decorativos — sin gradientes reales, solo radial blur */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 280 / 20%) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.17 165 / 12%) 0%, transparent 65%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <GraduationCapIcon
            className="size-7"
            style={{ color: "oklch(0.72 0.17 165)" }}
          />
          <span className="text-xl font-semibold tracking-tight text-sidebar-foreground">
            SIGA
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-4">
          <p className="text-[2.4rem] font-semibold leading-tight tracking-tight text-sidebar-foreground">
            Sistema Integral<br />de Gestión<br />Académica
          </p>
          <p className="text-base leading-relaxed text-sidebar-foreground/45">
            Materias, notas, trabajos prácticos<br />
            y avisos en un solo lugar.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["Control de acceso por rol", "RLS en base de datos", "CI/CD automatizado"].map(
              (feat) => (
                <span
                  key={feat}
                  className="text-[11px] px-2.5 py-1 rounded-full border"
                  style={{
                    background:  "oklch(0.55 0.22 280 / 10%)",
                    borderColor: "oklch(0.55 0.22 280 / 20%)",
                    color:       "oklch(0.72 0.18 280)",
                  }}
                >
                  {feat}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Footer del panel */}
        <p className="relative z-10 text-xs text-sidebar-foreground/25">
          Programación de Vanguardia · 2026
        </p>
      </div>

      {/* ── Panel derecho — formulario ─────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo solo en mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <GraduationCapIcon
              className="size-5"
              style={{ color: "oklch(0.72 0.17 165)" }}
            />
            <span className="text-xl font-semibold text-foreground">SIGA</span>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>

    </div>
  );
}
