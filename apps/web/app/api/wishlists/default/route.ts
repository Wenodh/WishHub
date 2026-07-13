import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { mapWishlistToDto } from '@/lib/api/mappers';
import { mapDomainError } from '@/lib/api/errors';
import { wishlistServiceFactory } from '@/lib/services/wishlist';

export const GET = withApiHandler(async (req, { session }) => {
  const repository = wishlistServiceFactory.wishlistRepository();
  const wishlist = await repository.findDefault(session.user.id);

  if (!wishlist) {
    return ApiResponse.notFound('Default wishlist not found');
  }

  return ApiResponse.success(mapWishlistToDto(wishlist));
});

export const PATCH = withApiHandler(async (req, { session }) => {
  const body = await req.json();
  const { wishlistId } = body;

  if (!wishlistId) {
    return ApiResponse.badRequest('wishlistId is required');
  }

  const service = wishlistServiceFactory.setDefaultWishlist();
  const result = await service.execute({
    userId: session.user.id,
    wishlistId,
  });

  if (!result.ok) {
    return mapDomainError(result.error);
  }

  return ApiResponse.success({ success: true });
});
