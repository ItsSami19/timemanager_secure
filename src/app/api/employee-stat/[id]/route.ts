import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "User ID fehlt" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          select: {
            name: true,
            supervisor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User nicht gefunden" },
        { status: 404 }
      );
    }

    // Beispielwerte zusammensetzen
    const responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team?.name || "Kein Team",
      supervisor: user.team?.supervisor?.name || "Kein Vorgesetzter",
      lastActive: new Date(), // Platzhalter → hier könntest du Logik einbauen
      projectsCompleted: 0, // Platzhalter → wenn du sowas berechnen willst
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Fehler beim Abrufen des Users:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
