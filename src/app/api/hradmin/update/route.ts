import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { id, role, teamId } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // If changing team, validate the change
    if (teamId !== undefined) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { role: true }
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // If user is a supervisor, check if they're the supervisor of the target team
      if (user.role === 'SUPERVISOR' && teamId) {
        const targetTeam = await prisma.team.findUnique({
          where: { id: teamId },
          select: { supervisorId: true }
        });

        if (targetTeam && targetTeam.supervisorId !== id) {
          return NextResponse.json(
            { error: "Supervisors can only be assigned to teams they supervise" },
            { status: 400 }
          );
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(teamId !== undefined && { teamId }),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
