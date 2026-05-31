// src/app/api/hr/sickness/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Importiere die auth() Funktion
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();

  // Wenn keine gültige Session oder nicht als HR angemeldet
  if (!session || session.user.role !== "HR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const employees = await prisma.user.findMany({
    select: { id: true, name: true, role: true },
  });

  return NextResponse.json(employees);
}


export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "HR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { from, until, targetUserId } = body;

  if (!from || !until || !targetUserId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.sickness.create({
    data: {
      userId: targetUserId,
      fromDate: new Date(from),
      toDate: new Date(until),
    },
  });

  return NextResponse.json({ success: true });
}

