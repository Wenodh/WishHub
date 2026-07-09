import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListWishlistsService } from '../list-wishlists.service';
import { WishlistRepository } from '../../repository/wishlist.repository';
import { WishlistItemRepository } from '../../repository/wishlist-item.repository';
import { Wishlist } from '../../domain/models';

describe('ListWishlistsService', () => {
  let service: ListWishlistsService;
  let wishlistRepo: any;
  let itemRepo: any;

  beforeEach(() => {
    wishlistRepo = { findByUserId: vi.fn() } as any;
    itemRepo = { countByWishlistId: vi.fn() } as any;
    service = new ListWishlistsService(wishlistRepo, itemRepo);
  });

  it('should return wishlist summaries', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Wishlist 1',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    wishlistRepo.findByUserId.mockResolvedValue([wishlist]);
    itemRepo.countByWishlistId.mockResolvedValue(5);

    const result = await service.execute({ userId: 'user-1' });

    expect(result.ok).toBe(true);
    if (result.ok && Array.isArray(result.value)) {
      const value = result.value as any[];
      expect(value).toHaveLength(1);
      expect(value[0].itemCount).toBe(5);
      expect(value[0].name).toBe('Wishlist 1');
    }
  });
});
