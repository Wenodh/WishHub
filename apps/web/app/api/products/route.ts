import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';
import {
  listProductsService,
} from '@wishhub/catalog';
import { addProductToWishlistService } from '@wishhub/wishlist';
import { CreateProductRequestSchema, PaginationSchema } from '@wishhub/contracts';

export async function GET(req: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const paginationResult = PaginationSchema.safeParse({
    limit: Number(searchParams.get('limit')) || undefined,
    cursor: searchParams.get('cursor') || undefined,
  });

  if (!paginationResult.success) {
    return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
  }

  const result = await listProductsService.execute(session.user.id, paginationResult.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ products: result.value });
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validationResult = CreateProductRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation Failed',
        issues: validationResult.error.issues
      }, { status: 400 });
    }

    // Default to Milestone 2 flow: Add to Wishlist
    const result = await addProductToWishlistService.execute(
        session.user.id,
        validationResult.data,
        (body as any).wishlistId
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
        product: result.value.savedProduct,
        wishlistId: result.value.wishlistId
    }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
