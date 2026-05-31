// app/api/vacation/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
 const session = await auth();
 if (!session) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

const userId = session.user.id;

try {
   const user = await prisma.user.findUnique({
     where: { id: userId },
     select: { vacationDays: true },
   });

const allRequests = await prisma.vacationRequest.findMany({
     where: { userId },
     select: { startDate: true, endDate: true, status: true },
   });

let requested = 0, approved = 0, taken = 0;
   allRequests.forEach(r => {
     const days = Math.floor((r.endDate.getTime() - r.startDate.getTime())/(10006060*24)) + 1;
     if (r.status === "PENDING") requested += days;
     else if (r.status === "APPROVED") {
       approved += days;
       taken += days;
     }
   });

return NextResponse.json({
     available: user?.vacationDays ?? 0,
     requested,
     approved,
     taken,
   });
 } catch {
   return NextResponse.json({ error: "Server error" }, { status: 500 });
 }
}