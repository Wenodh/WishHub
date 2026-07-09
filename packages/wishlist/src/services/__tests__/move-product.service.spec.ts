import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MoveProductService } from '../move-product.service';
import { WishlistRepository } from '../../repository/wishlist.repository';
import { WishlistItemRepository } from '../../repository/wishlist-item.repository';
import { Wishlist } from '../../domain/models';

vi.mock('@wishhub/database', () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb('mock-tx')),
  },
}));

describe('MoveProductService', () => {
  let service: MoveProductService;
  let wishlistRepo: any;
  let itemRepo: any;

  beforeEach(() => {
    wishlistRepo = { findById: vi.fn() } as any;
    itemRepo = { add: vi.fn(), remove: vi.fn(), exists: vi.fn(), findByWishlistId: vi.fn() } as any;
    service = new MoveProductService(wishlistRepo, itemRepo);
  });

  it('should move product between wishlists', async () => {
    const fromWishlist = new Wishlist({
      userId: 'user-1',
      name: 'From',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-from');

    const toWishlist = new Wishlist({
      userId: 'user-1',
      name: 'To',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-to');

    wishlistRepo.findById
      .mockResolvedValueOnce(fromWishlist)
      .mockResolvedValueOnce(toWishlist);
    itemRepo.exists.mockResolvedValue(false);
    itemRepo.findByWishlistId.mockResolvedValue([]);

    const result = await service.execute({
      userId: 'user-1',
      fromWishlistId: 'wishlist-from',
      toWishlistId: 'wishlist-to',
      savedProductId: 'saved-1',
    });

    expect(result.ok).toBe(true);
    expect(itemRepo.remove).toHaveBeenCalledWith('wishlist-from', 'saved-1', 'mock-tx');
    expect(itemRepo.add).toHaveBeenCalled();
  });
});
