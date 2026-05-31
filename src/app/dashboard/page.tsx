// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth"; // oder dein eigenes
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // falls nicht eingeloggt → Login
    redirect("/login");
  }

  const role = session.user.role; // z. B. "EMPLOYEE" | "SUPERVISOR" | "HR"

  // je nach Rolle zum richtigen Sub‑Dashboard weiterleiten
  switch (role) {
    case "EMPLOYEE":
      redirect("/dashboard/employee");
    case "SUPERVISOR":
      redirect("/dashboard/supervisor");
    case "HR":
      redirect("/dashboard/hr");
    default:
      // unvorhergesehene Rolle
      redirect("/dashboard/employee");
  }
}
