import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';
import { saveProductService, productRepository } from '@wishhub/catalog';
import { CreateProductSchema, PaginationSchema } from '@wishhub/contracts';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const { limit, cursor } = PaginationSchema.parse({
    limit: Number(searchParams.get('limit')) || undefined,
    cursor: searchParams.get('cursor') || undefined,
  });

  const products = await productRepository.list({ userId: session.user.id, limit, cursor });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = CreateProductSchema.parse(body);
    const product = await saveProductService.execute(session.user.id, data);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
