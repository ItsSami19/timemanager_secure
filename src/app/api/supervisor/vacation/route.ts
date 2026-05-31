// src/app/api/supervisor/vacation/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  
    const teams = await prisma.team.findMany({
      where: { supervisorId: userId },
      include: {
        members: {
          include: {
            vacationRequests: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                status: true,
                reason: true,
              },
            },
          },
        },
      },
    });
  
    const requests = teams.flatMap((team) =>
      team.members
        .filter((member) => member.id !== userId) // exclude supervisor from list
        .flatMap((member) =>
          member.vacationRequests.map((req) => ({
            id: req.id,
            worker: member.name,
            workerId: member.id,
            from: req.startDate.toISOString(),
            to: req.endDate.toISOString(),
            status: req.status,
            reason: req.reason,
          }))
        )
    );
    
  
    return NextResponse.json({ requests });
  }
  
