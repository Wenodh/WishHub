import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { mapDomainError } from '@/lib/api/errors';
import { wishlistServiceFactory } from '@/lib/services/wishlist';

export const DELETE = withApiHandler(async (req, { params, session }) => {
  const { id, savedProductId } = await params;

  const service = wishlistServiceFactory.removeProductFromWishlist();
  const result = await service.execute({
    userId: session.user.id,
    wishlistId: id,
    savedProductId,
  });

  if (!result.ok) {
    return mapDomainError(result.error);
  }

  return ApiResponse.noContent();
});
