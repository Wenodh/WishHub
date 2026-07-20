import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';
import {
  listProductsService,
  saveProductService
} from '@wishhub/catalog';
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

    const result = await saveProductService.execute(session.user.id, validationResult.data);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const isDuplicate = !!result.value.isDuplicate;

    return NextResponse.json({
        product: result.value,
        duplicate: isDuplicate,
    }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
