import { Result, ok, err } from '@wishhub/core';
import { DomainError, WishlistNotFoundError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistItemRepository } from '../repository/wishlist-item.repository';
import { SavedProductRepository } from '../repository/saved-product.repository';
import { CatalogRepository } from '../repository/catalog.repository';
import { WishlistValidators } from '../validation';
import { WishlistProductsResponse } from '../contracts';

export interface ListWishlistProductsInput {
  userId: string;
  wishlistId: string;
  page: number;
  pageSize: number;
}

export class ListWishlistProductsService {
  constructor(
    private wishlistRepository: WishlistRepository,
    private wishlistItemRepository: WishlistItemRepository,
    private savedProductRepository: SavedProductRepository,
    private catalogRepository: CatalogRepository
  ) {}

  async execute(input: ListWishlistProductsInput): Promise<Result<WishlistProductsResponse, DomainError>> {
    // 1. Ownership check
    const ownershipResult = await WishlistValidators.checkOwnership(
      input.userId,
      input.wishlistId,
      this.wishlistRepository
    );
    if (!ownershipResult.ok) return err(ownershipResult.error);

    const wishlist = await this.wishlistRepository.findById(input.wishlistId);
    if (!wishlist) return err(new WishlistNotFoundError(input.wishlistId));

    // 2. Fetch paginated items
    const skip = (input.page - 1) * input.pageSize;
    const items = await this.wishlistItemRepository.findByWishlistIdPaginated(
      input.wishlistId,
      skip,
      input.pageSize
    );
    const total = await this.wishlistItemRepository.countByWishlistId(input.wishlistId);

    // 3. Fetch products and catalog data
    const savedProductIds = items.map(i => i.savedProductId);
    const savedProducts = await this.savedProductRepository.findByIds(savedProductIds);

    const catalogProductIds = savedProducts.map(p => p.catalogProductId);
    const catalogProducts = await this.catalogRepository.findByIds(catalogProductIds);

    // 4. Map to DTOs
    const products = items.map(item => {
      const savedProduct = savedProducts.find(p => p.id === item.savedProductId);
      const catalogProduct = savedProduct ? catalogProducts.find(cp => cp.id === savedProduct.catalogProductId) : null;

      return {
        savedProductId: item.savedProductId,
        catalogProductId: catalogProduct?.id ?? '',
        title: catalogProduct?.title ?? 'Unknown Product',
        brand: catalogProduct?.brand,
        store: catalogProduct?.store ?? 'Unknown Store',
        price: (catalogProduct?.metadata as any)?.price,
        currency: (catalogProduct?.metadata as any)?.currency,
        imageUrl: catalogProduct?.images[0],
        addedAt: item.createdAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(total / input.pageSize);

    return ok({
      wishlist: {
        id: wishlist.id,
        userId: wishlist.userId,
        name: wishlist.name,
        isDefault: wishlist.isDefault,
        createdAt: wishlist.createdAt.toISOString(),
        updatedAt: wishlist.updatedAt.toISOString(),
      },
      products,
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages,
        hasNextPage: input.page < totalPages,
        hasPreviousPage: input.page > 1,
      },
    });
  }
}
