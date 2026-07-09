import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WishlistRepository } from '../wishlist.repository';
import { prisma } from '@wishhub/database';
import { Wishlist } from '../../domain/models';

vi.mock('@wishhub/database', () => ({
  prisma: {
    wishlist: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe('WishlistRepository', () => {
  let repository: WishlistRepository;

  beforeEach(() => {
    repository = new WishlistRepository();
    vi.clearAllMocks();
  });

  it('should find wishlist by id', async () => {
    const mockData = { id: '1', userId: 'user-1', name: 'My List', isDefault: true };
    vi.mocked(prisma.wishlist.findUnique).mockResolvedValue(mockData as any);

    const result = await repository.findById('1');

    expect(result).toBeInstanceOf(Wishlist);
    expect(result?.id).toBe('1');
    expect(result?.name).toBe('My List');
  });

  it('should save a wishlist', async () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'New List',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'new-id');

    const mockData = { id: 'new-id', userId: 'user-1', name: 'New List', isDefault: false };
    vi.mocked(prisma.wishlist.upsert).mockResolvedValue(mockData as any);

    const result = await repository.save(wishlist);

    expect(result.id).toBe('new-id');
    expect(prisma.wishlist.upsert).toHaveBeenCalled();
  });
});
