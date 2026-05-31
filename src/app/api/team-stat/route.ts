// app/api/team-stat/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const team = await prisma.team.findFirst({
      where: { supervisorId: session.user.id },
      include: {
        members: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(team?.members ?? []);
  } catch (error) {
    console.error("Fehler beim Abrufen der Teammitglieder:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Teamdaten" },
      { status: 500 }
    );
  }
}
