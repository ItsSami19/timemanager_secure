import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    const userIdToQuery = idParam ? idParam : session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userIdToQuery },
      select: { id: true, vacationDays: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const yearEnd = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const vacationRequests = await prisma.vacationRequest.findMany({
      where: {
        userId: user.id,
        startDate: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      select: { status: true, startDate: true, endDate: true },
    });

    const timesheets = await prisma.timesheet.findMany({
      where: {
        userId: user.id,
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      select: {
        start: true,
        end: true,
        date: true,
      },
    });

    const vacationSummary = vacationRequests.reduce(
      (acc, req) => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const vacationDays =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;

        if (req.status === "PENDING" || req.status === "APPROVED") {
          acc[req.status] += vacationDays;
        }
        return acc;
      },
      {
        PENDING: 0,
        APPROVED: 0,
      }
    );

    const REMAINING = Math.max(user.vacationDays - vacationSummary.APPROVED, 0);

    const workHoursByMonth: Record<string, number> = {};
    for (const entry of timesheets) {
      const start = new Date(entry.start);
      const end = new Date(entry.end);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const monthKey = `${entry.date.getFullYear()}-${String(
        entry.date.getMonth() + 1
      ).padStart(2, "0")}`;
      workHoursByMonth[monthKey] = (workHoursByMonth[monthKey] || 0) + hours;
    }

    const result = {
      vacation: {
        ...vacationSummary,
        MAX: user.vacationDays,
        REMAINING,
      },
      workHoursByMonth,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch vacation summary" },
      { status: 500 }
    );
  }
}
