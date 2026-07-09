import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateWishlistService } from '../create-wishlist.service';
import { WishlistRepository } from '../../repository/wishlist.repository';
import { DuplicateWishlistNameError, WishlistLimitExceededError } from '../../domain/errors';
import { Wishlist } from '../../domain/models';

describe('CreateWishlistService', () => {
  let service: CreateWishlistService;
  let repository: any;

  beforeEach(() => {
    repository = {
      findByUserId: vi.fn(),
      countByUserId: vi.fn(),
      save: vi.fn(),
      unsetOtherDefaults: vi.fn(),
    } as any;
    service = new CreateWishlistService(repository);
  });

  it('should create a wishlist successfully', async () => {
    repository.findByUserId.mockResolvedValue([]);
    repository.countByUserId.mockResolvedValue(1);
    repository.save.mockImplementation(async (w: any) => w);

    const result = await service.execute({
      userId: 'user-1',
      name: 'My Wishlist',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('My Wishlist');
      expect(result.value.userId).toBe('user-1');
      expect(result.value.isDefault).toBe(false);
    }
  });

  it('should create the first wishlist as default automatically', async () => {
    repository.findByUserId.mockResolvedValue([]);
    repository.countByUserId.mockResolvedValue(0);
    repository.save.mockImplementation(async (w: any) => w);

    const result = await service.execute({
      userId: 'user-1',
      name: 'My First Wishlist',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isDefault).toBe(true);
    }
  });

  it('should fail if name is duplicate', async () => {
    repository.findByUserId.mockResolvedValue([
      new Wishlist({
        userId: 'user-1',
        name: 'Existing',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const result = await service.execute({
      userId: 'user-1',
      name: 'Existing',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(DuplicateWishlistNameError);
    }
  });

  it('should fail if wishlist limit is exceeded', async () => {
    repository.findByUserId.mockResolvedValue([]);
    repository.countByUserId.mockResolvedValue(50);

    const result = await service.execute({
      userId: 'user-1',
      name: 'New Wishlist',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(WishlistLimitExceededError);
    }
  });

  it('should trim whitespace from name', async () => {
    repository.findByUserId.mockResolvedValue([]);
    repository.countByUserId.mockResolvedValue(1);
    repository.save.mockImplementation(async (w: any) => w);

    const result = await service.execute({
      userId: 'user-1',
      name: '  My Trimmed Wishlist  ',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('My Trimmed Wishlist');
    }
  });
});
