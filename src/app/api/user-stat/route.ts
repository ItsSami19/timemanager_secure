// app/api/user-stat/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Fehler beim Abrufen der Mitarbeiter:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Mitarbeiter' }, { status: 500 });
  }
}
