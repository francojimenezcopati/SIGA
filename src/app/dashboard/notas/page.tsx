import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotasView } from "./NotasView";

export default async function NotasPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);

  if (!auth) {
    redirect("/login");
  }

  return <NotasView initialRole={auth.role} userId={auth.userId} />;
}
