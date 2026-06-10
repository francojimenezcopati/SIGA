import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsuariosView } from "./UsuariosView";

export default async function AdminUsuariosPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);

  if (!auth) {
    redirect("/login");
  }

  if (auth.role !== "administrador") {
    redirect("/dashboard");
  }

  return <UsuariosView userId={auth.userId} />;
}
