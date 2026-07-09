import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AddProductToWishlistService } from '../add-product-to-wishlist.service';
import { WishlistRepository } from '../../repository/wishlist.repository';
import { WishlistItemRepository } from '../../repository/wishlist-item.repository';
import { SavedProductRepository } from '../../repository/saved-product.repository';
import { Wishlist, SavedProduct, WishlistItem } from '../../domain/models';
import { DuplicateWishlistItemError, SavedProductNotFoundError } from '../../domain/errors';

describe('AddProductToWishlistService', () => {
  let service: AddProductToWishlistService;
  let wishlistRepo: any;
  let itemRepo: any;
  let savedProductRepo: any;

  beforeEach(() => {
    wishlistRepo = { findById: vi.fn() } as any;
    itemRepo = { add: vi.fn(), exists: vi.fn(), findByWishlistId: vi.fn() } as any;
    savedProductRepo = { findById: vi.fn() } as any;
    service = new AddProductToWishlistService(wishlistRepo, itemRepo, savedProductRepo);
  });

  it('should add product to wishlist', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Wishlist',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    const savedProduct = new SavedProduct({
      userId: 'user-1',
      catalogProductId: 'catalog-1',
      originalUrl: 'http://example.com',
      addedAt: new Date(),
    }, 'saved-1');

    wishlistRepo.findById.mockResolvedValue(wishlist);
    savedProductRepo.findById.mockResolvedValue(savedProduct);
    itemRepo.exists.mockResolvedValue(false);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
      savedProductId: 'saved-1',
    });

    expect(result.ok).toBe(true);
    expect(itemRepo.add).toHaveBeenCalled();
  });

  it('should return existing association if duplicate', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Wishlist',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    const savedProduct = new SavedProduct({
      userId: 'user-1',
      catalogProductId: 'catalog-1',
      originalUrl: 'http://example.com',
      addedAt: new Date(),
    }, 'saved-1');

    const existingItem = new WishlistItem({
        wishlistId: 'wishlist-1',
        savedProductId: 'saved-1',
        createdAt: new Date()
    });

    wishlistRepo.findById.mockResolvedValue(wishlist);
    savedProductRepo.findById.mockResolvedValue(savedProduct);
    itemRepo.exists.mockResolvedValue(true);
    itemRepo.findByWishlistId.mockResolvedValue([existingItem]);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
      savedProductId: 'saved-1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
        expect(result.value).toBe(existingItem);
    }
  });

  it('should fail if saved product belongs to another user', async () => {
    const wishlist = new Wishlist({
        userId: 'user-1',
        name: 'Wishlist',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, 'wishlist-1');

      const savedProduct = new SavedProduct({
        userId: 'other-user',
        catalogProductId: 'catalog-1',
        originalUrl: 'http://example.com',
        addedAt: new Date(),
      }, 'saved-1');

      wishlistRepo.findById.mockResolvedValue(wishlist);
      savedProductRepo.findById.mockResolvedValue(savedProduct);

      const result = await service.execute({
        userId: 'user-1',
        wishlistId: 'wishlist-1',
        savedProductId: 'saved-1',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
          expect(result.error).toBeInstanceOf(SavedProductNotFoundError);
      }
  });
});
