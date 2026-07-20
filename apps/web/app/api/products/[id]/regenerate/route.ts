import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@wishhub/database';
import { auth } from '@wishhub/auth';

export async function POST(
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

  // Delete existing ProductInsight for this catalog product
  await prisma.productInsight.deleteMany({
    where: { catalogProductId: savedProduct.catalogProductId }
  });

  // Find or create the AI Job back to PENDING
  const existingJob = await prisma.aIJob.findFirst({
    where: { catalogProductId: savedProduct.catalogProductId }
  });

  if (existingJob) {
    await prisma.aIJob.update({
      where: { id: existingJob.id },
      data: {
        status: 'PENDING',
        attempts: 0,
        priority: 2, // higher priority for manual regenerations
        lockedAt: null,
        lockedBy: null,
        processingTime: null,
        errorLog: null
      }
    });
  } else {
    await prisma.aIJob.create({
      data: {
        catalogProductId: savedProduct.catalogProductId,
        status: 'PENDING',
        attempts: 0,
        priority: 2,
      }
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Regeneration job enqueued successfully.'
  });
}
