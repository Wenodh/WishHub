import { NextRequest } from 'next/server';
import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { mapDomainError } from '@/lib/api/errors';
import { mapWishlistSummaryToDto, mapWishlistToDto } from '@/lib/api/mappers';
import { wishlistServiceFactory } from '@/lib/services/wishlist';
import { CreateWishlistRequestSchema } from '@wishhub/wishlist';

export const GET = withApiHandler(async (req, { session }) => {
  const service = wishlistServiceFactory.listWishlists();
  const result = await service.execute({ userId: session.user.id });

  if (!result.ok) {
    return mapDomainError(result.error);
  }

  return ApiResponse.success({
    wishlists: result.value.map(mapWishlistSummaryToDto),
  });
});

export const POST = withApiHandler(async (req, { session }) => {
  const body = await req.json();
  const validated = CreateWishlistRequestSchema.safeParse(body);

  if (!validated.success) {
    return ApiResponse.badRequest('Validation Failed');
  }

  const service = wishlistServiceFactory.createWishlist();
  const result = await service.execute({
    userId: session.user.id,
    name: validated.data.name,
    isDefault: validated.data.isDefault,
  });

  if (!result.ok) {
    return mapDomainError(result.error);
  }

  return ApiResponse.created(mapWishlistToDto(result.value));
});
