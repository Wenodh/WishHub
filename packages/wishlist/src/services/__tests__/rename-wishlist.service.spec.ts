import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RenameWishlistService } from '../rename-wishlist.service';
import { WishlistRepository } from '../../repository/wishlist.repository';
import { DuplicateWishlistNameError, WishlistNotFoundError, UnauthorizedWishlistAccessError } from '../../domain/errors';
import { Wishlist } from '../../domain/models';

describe('RenameWishlistService', () => {
  let service: RenameWishlistService;
  let repository: any;

  beforeEach(() => {
    repository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn(),
    } as any;
    service = new RenameWishlistService(repository);
  });

  it('should rename a wishlist successfully', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Old Name',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    repository.findById.mockResolvedValue(wishlist);
    repository.findByUserId.mockResolvedValue([wishlist]);
    repository.save.mockImplementation(async (w: any) => w);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
      newName: 'New Name',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('New Name');
    }
  });

  it('should fail if wishlist does not belong to user', async () => {
    const wishlist = new Wishlist({
      userId: 'other-user',
      name: 'Old Name',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    repository.findById.mockResolvedValue(wishlist);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
      newName: 'New Name',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(UnauthorizedWishlistAccessError);
    }
  });

  it('should fail if new name is duplicate', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'My Wishlist',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    const otherWishlist = new Wishlist({
      userId: 'user-1',
      name: 'Existing',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-2');

    repository.findById.mockResolvedValue(wishlist);
    repository.findByUserId.mockResolvedValue([wishlist, otherWishlist]);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
      newName: 'Existing',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(DuplicateWishlistNameError);
    }
  });
});
