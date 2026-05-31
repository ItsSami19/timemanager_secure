import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, role } = await req.json(); // Changed from action/userId to id/role

  try {
    // Update role directly
    await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
