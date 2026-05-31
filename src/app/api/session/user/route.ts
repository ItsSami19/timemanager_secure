// app/api/session/user/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
 const session = await getServerSession(authOptions);

if (!session || !session.user?.id) {
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

return NextResponse.json({ userId: session.user.id }); // <- String!
}