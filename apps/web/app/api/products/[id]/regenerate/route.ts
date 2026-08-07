import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { prisma } from '@wishhub/database';

export const POST = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;

  // Find the user's saved product
  const savedProduct = await prisma.savedProduct.findUnique({
    where: { id },
  });

  if (!savedProduct || savedProduct.userId !== session.user.id) {
    return ApiResponse.notFound('Product not found');
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

  return ApiResponse.success({
    message: 'Regeneration job enqueued successfully.'
  });
});
