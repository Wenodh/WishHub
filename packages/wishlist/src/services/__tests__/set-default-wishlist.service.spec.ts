import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SetDefaultWishlistService } from '../set-default-wishlist.service';
import { WishlistRepository } from '../../repository/wishlist.repository';
import { Wishlist } from '../../domain/models';

vi.mock('@wishhub/database', () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb('mock-tx')),
  },
}));

describe('SetDefaultWishlistService', () => {
  let service: SetDefaultWishlistService;
  let repository: any;

  beforeEach(() => {
    repository = {
      findById: vi.fn(),
      save: vi.fn(),
      unsetOtherDefaults: vi.fn(),
    } as any;
    service = new SetDefaultWishlistService(repository);
  });

  it('should set wishlist as default and unset others', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Wishlist',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'wishlist-1');

    repository.findById.mockResolvedValue(wishlist);

    const result = await service.execute({
      userId: 'user-1',
      wishlistId: 'wishlist-1',
    });

    expect(result.ok).toBe(true);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ isDefault: true }), 'mock-tx');
    expect(repository.unsetOtherDefaults).toHaveBeenCalledWith('user-1', 'wishlist-1', 'mock-tx');
  });
});
