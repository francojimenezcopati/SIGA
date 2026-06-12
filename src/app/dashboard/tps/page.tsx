import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import { TpsView } from "./TpsView";

export default async function TpsPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);

  if (!auth) {
    redirect("/login");
  }

  return <TpsView initialRole={auth.role} userId={auth.userId} />;
}
