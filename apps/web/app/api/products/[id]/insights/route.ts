import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@wishhub/database';
import { auth } from '@wishhub/auth';

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
    include: { catalogProduct: true }
  });

  if (!savedProduct || savedProduct.userId !== session.user.id) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Fetch the latest product insight
  const insight = await prisma.productInsight.findFirst({
    where: { catalogProductId: savedProduct.catalogProductId },
    orderBy: { generatedAt: 'desc' }
  });

  // Fetch tag names associated with this catalog product
  const tags = await prisma.productTag.findMany({
    where: { catalogProductId: savedProduct.catalogProductId }
  });

  // Fetch the status of the associated AI Job
  const aiJob = await prisma.aIJob.findFirst({
    where: { catalogProductId: savedProduct.catalogProductId },
    orderBy: { createdAt: 'desc' }
  });

  const jobStatus = aiJob?.status || 'PENDING';

  if (!insight) {
    return NextResponse.json({
      success: true,
      status: jobStatus === 'PROCESSING' ? 'generating' : 'pending',
      insight: null,
      tags: []
    });
  }

  return NextResponse.json({
    success: true,
    status: 'completed',
    insight,
    tags: tags.map(t => t.name)
  });
}
