import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';
import {
  renameWishlistService,
  setDefaultWishlistService,
  deleteWishlistService,
  wishlistRepository
} from '@wishhub/wishlist';
import { UpdateWishlistRequestSchema } from '@wishhub/contracts';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const validation = UpdateWishlistRequestSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Validation Failed' }, { status: 400 });

    if (validation.data.name) {
        const result = await renameWishlistService.execute(session.user.id, id, validation.data.name);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (validation.data.isDefault) {
        const result = await setDefaultWishlistService.execute(session.user.id, id);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const updated = await wishlistRepository.findById(id);
    return NextResponse.json({ wishlist: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const result = await deleteWishlistService.execute(session.user.id, id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ success: true });
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const wishlist = await wishlistRepository.findById(id);

    if (!wishlist || wishlist.userId !== session.user.id) {
        return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    return NextResponse.json({ wishlist });
}
