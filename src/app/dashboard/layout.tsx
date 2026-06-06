import { redirect } from "next/navigation";

import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthContext(supabase);

  // Doble chequeo además del proxy: sin sesión, a /login.
  if (!auth) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role={auth.role} email={auth.email} />
      <main className="flex-1 overflow-x-auto p-6">{children}</main>
    </div>
  );
}
