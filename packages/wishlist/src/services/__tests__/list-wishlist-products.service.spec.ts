import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListWishlistProductsService } from '../list-wishlist-products.service';
import { WishlistRepository } from '../../repository/wishlist.repository';
import { WishlistItemRepository } from '../../repository/wishlist-item.repository';
import { SavedProductRepository } from '../../repository/saved-product.repository';
import { CatalogRepository } from '../../repository/catalog.repository';
import { Wishlist, WishlistItem, SavedProduct, CatalogProduct } from '../../domain/models';

describe('ListWishlistProductsService', () => {
  let service: ListWishlistProductsService;
  let wishlistRepo: any;
  let itemRepo: any;
  let savedProductRepo: any;
  let catalogRepo: any;

  beforeEach(() => {
    wishlistRepo = { findById: vi.fn() } as any;
    itemRepo = { findByWishlistIdPaginated: vi.fn(), countByWishlistId: vi.fn() } as any;
    savedProductRepo = { findByIds: vi.fn() } as any;
    catalogRepo = { findByIds: vi.fn() } as any;
    service = new ListWishlistProductsService(wishlistRepo, itemRepo, savedProductRepo, catalogRepo);
  });

  it('should return wishlist products with pagination', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Wishlist',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    const item = new WishlistItem({
      wishlistId: 'wishlist-1',
      savedProductId: 'saved-1',
      createdAt: new Date(),
    });

    const savedProduct = new SavedProduct({
      userId: 'user-1',
      catalogProductId: 'catalog-1',
      originalUrl: 'http://example.com',
      addedAt: new Date(),
    }, 'saved-1');

    const catalogProduct = new CatalogProduct({
      store: 'Amazon',
      canonicalUrl: 'http://amazon.com/p',
      title: 'Product Title',
      images: ['image.jpg'],
      metadata: { price: 10, currency: 'USD' },
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'catalog-1');

    wishlistRepo.findById.mockResolvedValue(wishlist);
    itemRepo.findByWishlistIdPaginated.mockResolvedValue([item]);
    itemRepo.countByWishlistId.mockResolvedValue(1);
    savedProductRepo.findByIds.mockResolvedValue([savedProduct]);
    catalogRepo.findByIds.mockResolvedValue([catalogProduct]);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
      page: 1,
      pageSize: 10,
    });

    expect(result.ok).toBe(true);
    if (result.ok && 'products' in result.value) {
      const value = result.value as any;
      expect(value.products).toHaveLength(1);
      expect(value.products[0].title).toBe('Product Title');
      expect(value.pagination.total).toBe(1);
    }
  });
});
