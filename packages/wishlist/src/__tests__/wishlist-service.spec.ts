import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateWishlistService } from '../services/create-wishlist.service';
import { wishlistRepository } from '../repository/wishlist.repository';

vi.mock('../repository/wishlist.repository');

describe('CreateWishlistService', () => {
  let service: CreateWishlistService;

  beforeEach(() => {
    service = new CreateWishlistService();
    vi.clearAllMocks();
  });

  it('should create a wishlist with trimmed name', async () => {
    const userId = 'user-1';
    const name = '  Holiday Gifts  ';
    const mockWishlist = { id: '1', userId, name: 'Holiday Gifts', isDefault: true };

    vi.mocked(wishlistRepository.count).mockResolvedValue(0);
    vi.mocked(wishlistRepository.findByUserId).mockResolvedValue([]);
    vi.mocked(wishlistRepository.create).mockResolvedValue(mockWishlist as any);

    const result = await service.execute(userId, name);

    expect(result.ok).toBe(true);
    expect(wishlistRepository.create).toHaveBeenCalledWith(userId, 'Holiday Gifts', true);
  });

  it('should reject duplicate names', async () => {
    const userId = 'user-1';
    const name = 'Holiday';
    const existing = [{ id: '1', name: 'holiday' }];

    vi.mocked(wishlistRepository.findByUserId).mockResolvedValue(existing as any);

    const result = await service.execute(userId, name);

    expect(result.ok).toBe(false);
    if (!result.ok) {
        expect(result.error).toBe('A wishlist with this name already exists');
    }
  });
});
