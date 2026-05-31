import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, arrival, departure, breakMinutes } = body;

    // Validation (basic)
    if (!date || !arrival || !departure) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Create Timesheet Entry
    const timesheet = await prisma.timesheet.create({
      data: {
        userId: token.id as string,
        date: new Date(date),
        start: new Date(arrival),
        end: new Date(departure),
        break: breakMinutes ?? 0,
        status: "SUBMITTED", // Default status
      },
    });

    return NextResponse.json(timesheet, { status: 201 });
  } catch (error) {
    console.error("Error creating timesheet:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await prisma.timesheet.findMany({
      where: { userId: token.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
