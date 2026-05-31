// app/api/team-timesheets/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, TimesheetStatus } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json(); // { action: "APPROVED" | "REJECTED" }
  if (!["APPROVED", "REJECTED"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const id = params.id;
  try {
    const updated = await prisma.timesheet.update({
      where: { id },
      data: { status: action as TimesheetStatus },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
