import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, name, team, role, password, isNewTeam, supervisorId, employeeIds } = body;

  if (!isNewTeam && (!email || !name || !role || !password)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    let teamId = null;

    // If creating a new team
    if (isNewTeam && team) {
      if (!supervisorId) {
        return NextResponse.json({ error: "Supervisor ID is required for new team" }, { status: 400 });
      }

      // Check if team with same name already exists
      const existingTeam = await prisma.team.findUnique({
        where: { name: team }
      });

      if (existingTeam) {
        return NextResponse.json({ error: "A team with this name already exists" }, { status: 400 });
      }

      // Create the team first
      const newTeam = await prisma.team.create({
        data: {
          name: team,
          supervisorId: supervisorId,
        },
      });
      teamId = newTeam.id;

      // If there are employees to assign, update their team
      if (employeeIds && employeeIds.length > 0) {
        await prisma.user.updateMany({
          where: {
            id: {
              in: employeeIds,
            },
          },
          data: {
            teamId,
          },
        });
      }

      // Return the created team instead of creating a new user
      return NextResponse.json(newTeam);
    } else if (team) {
      // If using existing team
      const existingTeam = await prisma.team.findUnique({
        where: { name: team },
      });
      if (existingTeam) {
        teamId = existingTeam.id;
      }
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        teamId,
        role,
        password,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
