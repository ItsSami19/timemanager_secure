// api/supervisor/team-members/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supervisorId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { supervisorId },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          vacationDays: true,
          vacationRequests: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    return NextResponse.json({ members: [] });
  }

  const members = team.members.map((member) => {
    const approvedDays = member.vacationRequests
      .filter((req) => req.status === "APPROVED")
      .reduce((sum, req) => {
        const diff = (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
        return sum + diff;
      }, 0);

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      vacationDays: member.vacationDays,
      approvedDays,
    };
  });

  return NextResponse.json({ members });
}


