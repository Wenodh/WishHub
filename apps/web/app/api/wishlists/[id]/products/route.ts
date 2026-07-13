import { NextRequest } from 'next/server';
import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { mapDomainError } from '@/lib/api/errors';
import { mapWishlistProductToDto, mapWishlistToDto, mapPaginationToDto } from '@/lib/api/mappers';
import { wishlistServiceFactory } from '@/lib/services/wishlist';
import { z } from 'zod';

export const GET = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
    return ApiResponse.badRequest('Invalid pagination parameters');
  }

  const service = wishlistServiceFactory.listWishlistProducts();
  const result = await service.execute({
    userId: session.user.id,
    wishlistId: id,
    page,
    pageSize,
  });

  if (!result.ok) {
    return mapDomainError(result.error);
  }

  return ApiResponse.success({
    wishlist: mapWishlistToDto(result.value.wishlist as any),
    products: result.value.products.map(mapWishlistProductToDto),
    pagination: mapPaginationToDto(result.value.pagination),
  });
});

const AddProductToWishlistRequestSchema = z.object({
  savedProductId: z.string().min(1),
});

export const POST = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;
  const body = await req.json();
  const validated = AddProductToWishlistRequestSchema.safeParse(body);

  if (!validated.success) {
    return ApiResponse.badRequest('Validation Failed');
  }

  const service = wishlistServiceFactory.addProductToWishlist();
  const result = await service.execute({
    userId: session.user.id,
    wishlistId: id,
    savedProductId: validated.data.savedProductId,
  });

  if (!result.ok) {
    return mapDomainError(result.error);
  }

  return ApiResponse.success({ success: true }, 201);
});
