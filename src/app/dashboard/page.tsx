import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Por ahora el dashboard entra directo a Materias (módulo implementado).
  redirect("/dashboard/materias");
}
