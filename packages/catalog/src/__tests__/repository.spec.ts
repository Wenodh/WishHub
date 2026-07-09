import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductRepository } from '../repository';
import { prisma } from '@wishhub/database';

vi.mock('@wishhub/database', () => ({
  prisma: {
    savedProduct: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('ProductRepository', () => {
  let repository: ProductRepository;

  beforeEach(() => {
    repository = new ProductRepository();
    vi.clearAllMocks();
  });

  it('should find product by canonical url', async () => {
    const userId = 'user-1';
    const canonicalUrl = 'https://example.com/p1';
    const mockProduct = { id: '1', userId, catalogProduct: { canonicalUrl } };

    vi.mocked(prisma.savedProduct.findFirst).mockResolvedValue(mockProduct as any);

    const result = await repository.findByCanonicalUrl(userId, canonicalUrl);

    expect(result).toEqual(mockProduct);
    expect(prisma.savedProduct.findFirst).toHaveBeenCalledWith({
      where: {
        userId,
        catalogProduct: { canonicalUrl },
      },
      include: {
        catalogProduct: true,
      },
    });
  });
});
