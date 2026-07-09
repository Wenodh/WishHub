import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteWishlistService } from '../delete-wishlist.service';
import { WishlistRepository } from '../../repository/wishlist.repository';
import { WishlistItemRepository } from '../../repository/wishlist-item.repository';
import { Wishlist } from '../../domain/models';
import { CannotDeleteOnlyWishlistError, CannotDeleteDefaultWishlistError } from '../../domain/errors';

vi.mock('@wishhub/database', () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb('mock-tx')),
  },
}));

describe('DeleteWishlistService', () => {
  let service: DeleteWishlistService;
  let wishlistRepo: any;
  let itemRepo: any;

  beforeEach(() => {
    wishlistRepo = {
      findById: vi.fn(),
      countByUserId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      unsetOtherDefaults: vi.fn(),
    } as any;
    itemRepo = {
      removeAllByWishlistId: vi.fn(),
    } as any;
    service = new DeleteWishlistService(wishlistRepo, itemRepo);
  });

  it('should delete non-default wishlist', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Wishlist',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    wishlistRepo.findById.mockResolvedValue(wishlist);
    wishlistRepo.countByUserId.mockResolvedValue(2);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
    });

    expect(result.ok).toBe(true);
    expect(itemRepo.removeAllByWishlistId).toHaveBeenCalledWith('wishlist-1', 'mock-tx');
    expect(wishlistRepo.delete).toHaveBeenCalledWith('wishlist-1', 'mock-tx');
  });

  it('should fail when deleting the only wishlist', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Only Wishlist',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    wishlistRepo.findById.mockResolvedValue(wishlist);
    wishlistRepo.countByUserId.mockResolvedValue(1);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
        expect(result.error).toBeInstanceOf(CannotDeleteOnlyWishlistError);
    }
  });

  it('should promote replacement when deleting default', async () => {
    const defaultWishlist = new Wishlist({
      userId: 'user-1',
      name: 'Default',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-default');

    const replacementWishlist = new Wishlist({
      userId: 'user-1',
      name: 'Replacement',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-replacement');

    wishlistRepo.findById
      .mockResolvedValueOnce(defaultWishlist) // for ownership check
      .mockResolvedValueOnce(defaultWishlist) // for fetching wishlist
      .mockResolvedValueOnce(replacementWishlist) // for replacement ownership check
      .mockResolvedValueOnce(replacementWishlist); // for fetching replacement
    wishlistRepo.countByUserId.mockResolvedValue(2);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-default',
      replacementWishlistId: 'wishlist-replacement',
    });

    expect(result.ok).toBe(true);
    expect(wishlistRepo.save).toHaveBeenCalled();
    expect(wishlistRepo.delete).toHaveBeenCalledWith('wishlist-default', 'mock-tx');
  });

  it('should fail when deleting default without replacement', async () => {
    const defaultWishlist = new Wishlist({
      userId: 'user-1',
      name: 'Default',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-default');

    wishlistRepo.findById.mockResolvedValue(defaultWishlist);
    wishlistRepo.countByUserId.mockResolvedValue(2);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-default',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
        expect(result.error).toBeInstanceOf(CannotDeleteDefaultWishlistError);
    }
  });
});
