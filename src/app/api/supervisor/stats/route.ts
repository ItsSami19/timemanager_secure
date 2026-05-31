// api/supervisor/stats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const teams = await prisma.team.findMany({
    where: { supervisorId: userId },
    include: {
      members: {
        include: {
          vacationRequests: true,
        },
      },
    },
  });

  const stats = teams.flatMap(team => team.members.map(member => {
    const approved = member.vacationRequests.filter(r => r.status === "APPROVED");
    const requested = member.vacationRequests.filter(r => r.status === "PENDING");

    const totalApprovedDays = approved.reduce((sum, r) => {
      const days = (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
      return sum + days;
    }, 0);

    const totalRequestedDays = requested.reduce((sum, r) => {
      const days = (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
      return sum + days;
    }, 0);

    return {
      name: member.name,
      vacationDays: member.vacationDays,
      approved: totalApprovedDays,
      requested: totalRequestedDays,
    };
  }));

  return NextResponse.json({ stats });
}
