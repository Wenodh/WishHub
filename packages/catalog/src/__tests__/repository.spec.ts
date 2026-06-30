import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductRepository } from '../repository';
import { prisma } from '@wishhub/database';

vi.mock('@wishhub/database', () => ({
  prisma: {
    savedProduct: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('ProductRepository', () => {
  let repo: ProductRepository;

  beforeEach(() => {
    repo = new ProductRepository();
    vi.clearAllMocks();
  });

  it('should find product by canonical url', async () => {
    const mockProduct = {
      id: '1',
      userId: 'u1',
      name: 'P1',
      url: 'url',
      canonicalUrl: 'curl',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadataVersion: 1,
    };

    vi.mocked(prisma.savedProduct.findUnique).mockResolvedValue(mockProduct as any);

    const result = await repo.findByCanonicalUrl('u1', 'curl');

    expect(result?.id).toBe('1');
    expect(prisma.savedProduct.findUnique).toHaveBeenCalledWith({
      where: { userId_canonicalUrl: { userId: 'u1', canonicalUrl: 'curl' } },
      include: { images: true },
    });
  });
});
