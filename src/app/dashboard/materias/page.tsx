import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { MateriasView } from "@/features/materias/materias-view";

export default async function MateriasPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);
  const canCreate = auth?.role === "docente" || auth?.role === "administrador";

  return <MateriasView canCreate={canCreate} />;
}
