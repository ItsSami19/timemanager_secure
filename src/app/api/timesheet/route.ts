// app/api/timesheet/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const newTimesheet = await prisma.timesheet.create({
    data,
  });

  return NextResponse.json(newTimesheet);
}
