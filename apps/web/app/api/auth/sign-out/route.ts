import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';

export async function POST(req: Request) {
  // Neon Auth handles sign-out via its main handler, but we can provide this endpoint for the SDK
  return NextResponse.json({ success: true });
}
