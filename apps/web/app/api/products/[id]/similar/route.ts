import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { prisma } from '@wishhub/database';
import { similarityService } from '@wishhub/ai';

export const GET = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;

  // Find the user's saved product
  const savedProduct = await prisma.savedProduct.findUnique({
    where: { id },
  });

  if (!savedProduct || savedProduct.userId !== session.user.id) {
    return ApiResponse.notFound('Product not found');
  }

  // Find similar catalog products using Metadata similarity
  const similarProducts = await similarityService.findSimilar(savedProduct.catalogProductId);

  return ApiResponse.success({
    similar: similarProducts
  });
});
