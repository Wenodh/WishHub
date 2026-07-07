import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';
import { wishlistRepository } from '@wishhub/wishlist';

export async function GET(req: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const wishlist = await wishlistRepository.findDefault(session.user.id);
  if (!wishlist) return NextResponse.json({ error: 'No default wishlist found' }, { status: 404 });

  return NextResponse.json({ wishlist });
}
