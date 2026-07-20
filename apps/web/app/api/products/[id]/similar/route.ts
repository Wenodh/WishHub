import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@wishhub/database';
import { auth } from '@wishhub/auth';
import { similarityService } from '@wishhub/ai';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Find the user's saved product
  const savedProduct = await prisma.savedProduct.findUnique({
    where: { id },
  });

  if (!savedProduct || savedProduct.userId !== session.user.id) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Find similar catalog products using Metadata similarity
  const similarProducts = await similarityService.findSimilar(savedProduct.catalogProductId);

  return NextResponse.json({
    success: true,
    similar: similarProducts
  });
}
