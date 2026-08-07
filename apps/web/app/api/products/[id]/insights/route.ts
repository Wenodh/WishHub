import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { prisma } from '@wishhub/database';

export const GET = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;

  // Find the user's saved product
  const savedProduct = await prisma.savedProduct.findUnique({
    where: { id },
    include: { catalogProduct: true }
  });

  if (!savedProduct || savedProduct.userId !== session.user.id) {
    return ApiResponse.notFound('Product not found');
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
    return ApiResponse.success({
      status: jobStatus === 'PROCESSING' ? 'generating' : 'pending',
      insight: null,
      tags: []
    });
  }

  return ApiResponse.success({
    status: 'completed',
    insight,
    tags: tags.map(t => t.name)
  });
});
