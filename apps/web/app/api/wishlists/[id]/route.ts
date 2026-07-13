import { NextRequest } from 'next/server';
import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { mapDomainError } from '@/lib/api/errors';
import { mapWishlistToDto } from '@/lib/api/mappers';
import { wishlistServiceFactory } from '@/lib/services/wishlist';
import { RenameWishlistRequestSchema } from '@wishhub/wishlist';

export const PATCH = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;
  const body = await req.json();
  const validated = RenameWishlistRequestSchema.safeParse(body);

  if (!validated.success) {
    return ApiResponse.badRequest('Validation Failed');
  }

  const service = wishlistServiceFactory.renameWishlist();
  const result = await service.execute({
    userId: session.user.id,
    wishlistId: id,
    newName: validated.data.name,
  });

  if (!result.ok) {
    return mapDomainError(result.error);
  }

  return ApiResponse.success(mapWishlistToDto(result.value));
});

export const DELETE = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;

  const service = wishlistServiceFactory.deleteWishlist();
  const result = await service.execute({
    userId: session.user.id,
    wishlistId: id,
  });

  if (!result.ok) {
    return mapDomainError(result.error);
  }

  return ApiResponse.noContent();
});
