import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/* example output
{
  "vacation": {
    "PENDING": 5,
    "APPROVED": 10,
    "MAX": 25,
    "REMAINING": 10
  },
  "workHoursByMonth": {
    "2025-01": 152,
    "2025-02": 134.5,
    "2025-03": 143
  }
}
*/
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // get user and maximum vacation days of user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, vacationDays: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserID = user.id;

    // calculate start and end date of current year
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1); // z. B. 2025-01-01
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 2025-12-31 23:59:59

    // get vacation days of current year from vacationRequest table
    const vacationRequests = (await prisma.vacationRequest.findMany({
      where: {
        userId: currentUserID,
        startDate: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      select: { status: true, startDate: true, endDate: true },
    })) as { status: "PENDING" | "APPROVED"; startDate: Date; endDate: Date }[];
    // get working times from timesheet table
    const timesheets = await prisma.timesheet.findMany({
      where: {
        userId: currentUserID,
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
    // Calculate how many vacation days have each status
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

    // calculate remaining vacation days
    let REMAINING = 0;
    if (user != null) {
      REMAINING = Math.max(user.vacationDays - vacationSummary.APPROVED, 0);
    } else {
      throw new Error("User not found");
    }

    // calculate working time per month
    const workHoursByMonth: Record<string, number> = {};
    for (const entry of timesheets) {
      const start = new Date(entry.start);
      const end = new Date(entry.end);
      const durationMs = end.getTime() - start.getTime();
      const hours = durationMs / (1000 * 60 * 60); // ms -> h

      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`; // z. B. "2025-03"

      if (!workHoursByMonth[monthKey]) {
        workHoursByMonth[monthKey] = 0;
      }

      workHoursByMonth[monthKey] += hours;
    }

    // put together return values
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
    console.error("Error fetching vacation summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch vacation summary" },
      { status: 500 }
    );
  }
}
