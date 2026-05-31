// app/api/team-timesheets/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supervisorId = session.user.id;

  // Finde Team-IDs, die der Supervisor leitet
  const teams = await prisma.team.findMany({
    where: { supervisorId },
    select: { id: true },
  });
  const teamIds = teams.map((t) => t.id);

  // Lade alle Timesheets mit status SUBMITTED von Nutzern in diesen Teams
  const pending = await prisma.timesheet.findMany({
    where: {
      status: "SUBMITTED",
      user: {
        teamId: { in: teamIds },
      },
    },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(pending);
}
