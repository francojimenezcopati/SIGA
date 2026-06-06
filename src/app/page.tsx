import { redirect } from "next/navigation";

export default function Home() {
  // El proxy se encarga de mandar a /login si no hay sesión.
  redirect("/dashboard");
}
