// api/supervisor/vacation/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await request.json();
  const { status, rejectionReason } = body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updateData: any = { status: status as RequestStatus };

    if (status === "REJECTED" && rejectionReason) {
      updateData.reason = rejectionReason;
    }

    const updatedRequest = await prisma.vacationRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      updated: {
        id: updatedRequest.id,
        worker: updatedRequest.user.name,
        workerId: updatedRequest.user.id,
        from: updatedRequest.startDate.toISOString(),
        to: updatedRequest.endDate.toISOString(),
        status: updatedRequest.status,
        reason: updatedRequest.reason,
      },
    });
  } catch (err) {
    console.error("Fehler beim Update:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}



