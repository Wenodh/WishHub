import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({ user: session.user });
}
