// app/api/team-timesheets/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const allowedActions = ["APPROVED", "REJECTED"] as const;
type TimesheetAction = (typeof allowedActions)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json();
  if (!allowedActions.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { id } = await params;
  const resolvedId = String(id || "");
  if (!resolvedId) {
    return NextResponse.json({ error: "Missing timesheet ID" }, { status: 400 });
  }

  try {
    const result = await prisma.timesheet.updateMany({
      where: {
        id: resolvedId,
        user: {
          team: {
            supervisorId: session.user.id,
          },
        },
      },
      data: { status: action as TimesheetAction },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Timesheet not found or not owned by your team" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: result.count });
  } catch (e) {
    console.error("Error updating timesheet status:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
