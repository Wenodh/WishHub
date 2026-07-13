import {
  Wishlist,
  WishlistSummaryDto,
  WishlistDtoSchema,
  WishlistProductDto
} from '@wishhub/wishlist';

export function mapWishlistToDto(wishlist: Wishlist) {
  return {
    id: wishlist.id,
    userId: wishlist.userId,
    name: wishlist.name,
    isDefault: wishlist.isDefault,
    createdAt: wishlist.createdAt.toISOString(),
    updatedAt: wishlist.updatedAt.toISOString(),
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
