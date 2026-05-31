/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/absence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

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

  // Zusammenführen
  const absences = [
    ...vacations.map((v) => ({
      id: v.id,
      type: "VACATION" as const,
      startDate: v.startDate.toISOString(),
      endDate: v.endDate.toISOString(),
      status: v.status,
    })),
    ...sicknesses.map((s) => ({
      id: s.id,
      type: "SICKNESS" as const,
      startDate: s.fromDate.toISOString(),
      endDate: s.toDate.toISOString(),
      status: "SUBMITTED",
    })),
    ...flextimes.map((f) => ({
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
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await request.json();

  if (body.type === "VACATION") {
    const { from, until } = body;
    if (!from || !until) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.vacationRequest.create({
        data: {
          userId,
          startDate: new Date(from),
          endDate: new Date(until),
          status: "PENDING",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { vacationDays: { decrement: 1 } },
      }),
    ]);
  } else if (body.type === "SICKNESS") {
    const { from, until } = body;
    if (!from || !until) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await prisma.sickness.create({
      data: { userId, fromDate: new Date(from), toDate: new Date(until) },
    });
  } else if (body.type === "FLEXTIME") {
    const { date, hours } = body;
    if (!date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }
    const h = typeof hours === "number" ? hours : 8;
    await prisma.$transaction([
      prisma.flextimeAbsence.create({
        data: { userId, date: new Date(date), hours: h },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { flexTime: { decrement: h } },
      }),
    ]);
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
