// src/app/dashboard/inscripciones/page.tsx
import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import { InscripcionesView } from "./InscripcionesView";

export default async function InscripcionesPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);

  if (!auth) {
    redirect("/login");
  }

  if (auth.role !== "estudiante") {
    redirect("/dashboard");
  }

  return <InscripcionesView initialRole={auth.role} />;
}
