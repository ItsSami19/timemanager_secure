// app/page.tsx (Server Component)

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  // Session server-seitig auslesen
  const session = await getServerSession(authOptions);

  if (!session) {
    // Kein Login → zur Login-Seite
    redirect("/login");
  }

  // Je nach Rolle weiterleiten
  switch (session.user.role) {
    case "HR":
      redirect("/dashboard/hr");
    case "SUPERVISOR":
      redirect("/dashboard/supervisor");
    case "EMPLOYEE":
    default:
      redirect("/dashboard/employee");
  }
}
