/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/absence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.floor(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // 1) Urlaub
    const vacations = await prisma.vacationRequest.findMany({
      where: { userId },
      select: { id: true, startDate: true, endDate: true, status: true },
    });

    // 2) Krankheit
    const sicknesses = await prisma.sickness.findMany({
      where: { userId },
      select: { id: true, fromDate: true, toDate: true },
    });

    // 3) Flextime
    const flextimes = await prisma.flextimeAbsence.findMany({
      where: { userId },
      select: { id: true, date: true, hours: true },
      orderBy: { date: "desc" },
    });

    // Kontostand
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { flexTime: true, vacationDays: true },
    });

    const absences = [
      ...vacations.map((v: { id: string; startDate: Date; endDate: Date; status: string }) => ({
        id: v.id,
        type: "VACATION" as const,
        startDate: v.startDate.toISOString(),
        endDate: v.endDate.toISOString(),
        status: v.status,
      })),
      ...sicknesses.map((s: { id: string; fromDate: Date; toDate: Date }) => ({
        id: s.id,
        type: "SICKNESS" as const,
        startDate: s.fromDate.toISOString(),
        endDate: s.toDate.toISOString(),
        status: "SUBMITTED",
      })),
      ...flextimes.map((f: { id: string; date: Date; hours: number }) => ({
        id: f.id,
        type: "FLEXTIME" as const,
        startDate: f.date.toISOString(),
        endDate: f.date.toISOString(),
        status: "SUBMITTED",
        hours: f.hours,
      })),
    ];

    return NextResponse.json({
      absences,
      flexTime: user?.flexTime ?? 0,
      vacationDays: user?.vacationDays ?? 0,
    });
  } catch (error) {
    console.error("Error fetching absences:", error);
    return NextResponse.json({ error: "Failed to fetch absences" }, { status: 500 });
  }
}

type AbsenceBody = {
  type?: unknown;
  from?: unknown;
  until?: unknown;
  date?: unknown;
  hours?: unknown;
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const typedBody = body as AbsenceBody;
  const type = String(typedBody.type ?? "").toUpperCase();
  if (!["VACATION", "SICKNESS", "FLEXTIME"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vacationDays: true, flexTime: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (type === "VACATION") {
      const fromDate = parseDate(typedBody.from);
      const untilDate = parseDate(typedBody.until);
      if (!fromDate || !untilDate || fromDate > untilDate) {
        return NextResponse.json({ error: "Invalid vacation dates" }, { status: 400 });
      }
      if (user.vacationDays <= 0) {
        return NextResponse.json({ error: "Not enough vacation days" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.vacationRequest.create({
          data: {
            userId,
            startDate: fromDate,
            endDate: untilDate,
            status: "PENDING",
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { vacationDays: { decrement: 1 } },
        }),
      ]);
    } else if (type === "SICKNESS") {
      const fromDate = parseDate(typedBody.from);
      const untilDate = parseDate(typedBody.until);
      if (!fromDate || !untilDate || fromDate > untilDate) {
        return NextResponse.json({ error: "Invalid sickness dates" }, { status: 400 });
      }

      await prisma.sickness.create({
        data: { userId, fromDate, toDate: untilDate },
      });
    } else {
      const date = parseDate(typedBody.date);
      const hours = typedBody.hours === undefined ? 8 : parsePositiveInt(typedBody.hours);
      if (!date || hours === null || hours <= 0 || hours > 24) {
        return NextResponse.json({ error: "Invalid flextime entry" }, { status: 400 });
      }
      if (user.flexTime < hours) {
        return NextResponse.json({ error: "Not enough flex time available" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.flextimeAbsence.create({
          data: { userId, date, hours },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { flexTime: { decrement: hours } },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating absence:", error);
    return NextResponse.json({ error: "Failed to create absence" }, { status: 500 });
  }
}
