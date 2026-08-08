import {
  Wishlist,
  WishlistSummaryDto,
  WishlistDtoSchema,
  WishlistProductDto
} from '@wishhub/wishlist';

export function mapWishlistToDto(wishlist: any) {
  const createdAt = typeof wishlist.createdAt === 'string'
    ? wishlist.createdAt
    : wishlist.createdAt instanceof Date
      ? wishlist.createdAt.toISOString()
      : String(wishlist.createdAt);

  const updatedAt = typeof wishlist.updatedAt === 'string'
    ? wishlist.updatedAt
    : wishlist.updatedAt instanceof Date
      ? wishlist.updatedAt.toISOString()
      : String(wishlist.updatedAt);

  return {
    id: wishlist.id,
    userId: wishlist.userId,
    name: wishlist.name,
    isDefault: wishlist.isDefault,
    createdAt,
    updatedAt,
  };
}

export function mapWishlistSummaryToDto(summary: WishlistSummaryDto): WishlistSummaryDto {
  return summary;
}

export function mapWishlistProductToDto(product: WishlistProductDto): WishlistProductDto {
  return product;
}

export function mapPaginationToDto(pagination: any) {
    return pagination;
}
