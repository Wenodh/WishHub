import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';
import { listWishlistsService, createWishlistService } from '@wishhub/wishlist';
import { CreateWishlistRequestSchema } from '@wishhub/contracts';

export async function GET(req: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await listWishlistsService.execute(session.user.id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ wishlists: result.value });
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validation = CreateWishlistRequestSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Validation Failed', issues: validation.error.issues }, { status: 400 });

    const result = await createWishlistService.execute(session.user.id, validation.data.name, validation.data.isDefault);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({ wishlist: result.value }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
