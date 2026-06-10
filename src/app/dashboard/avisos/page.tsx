import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvisosView } from "./AvisosView";

export default async function AvisosPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);

  if (!auth) {
    redirect("/login");
  }

  return <AvisosView initialRole={auth.role} userId={auth.userId} />;
}
