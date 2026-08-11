import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteProductService } from '../services/delete-product.service';
import { productRepository } from '../repository';

vi.mock('../repository');
vi.mock('@wishhub/telemetry', () => ({
  telemetry: {
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
    track: vi.fn(),
  }
}));

describe('DeleteProductService', () => {
  let service: DeleteProductService;

  beforeEach(() => {
    service = new DeleteProductService();
    vi.clearAllMocks();
  });

  it('should delete product successfully if owner calls it', async () => {
    const userId = 'user-1';
    const productId = 'saved-prod-1';
    const existingProduct = { id: productId, userId, catalogProductId: 'cat-1' };

    vi.mocked(productRepository.findById).mockResolvedValue(existingProduct as any);
    vi.mocked(productRepository.delete).mockResolvedValue({ id: productId } as any);

    const result = await service.execute(userId, productId);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(true);
    }
    expect(productRepository.findById).toHaveBeenCalledWith(productId);
    expect(productRepository.delete).toHaveBeenCalledWith(productId);
  });

  it('should return error if product does not exist', async () => {
    const userId = 'user-1';
    const productId = 'non-existent';

    vi.mocked(productRepository.findById).mockResolvedValue(null);

    const result = await service.execute(userId, productId);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Product not found or unauthorized');
    }
    expect(productRepository.delete).not.toHaveBeenCalled();
  });

  it('should prevent IDOR (return error) if another user tries to delete the product', async () => {
    const ownerId = 'user-owner';
    const attackerId = 'user-attacker';
    const productId = 'saved-prod-1';
    const existingProduct = { id: productId, userId: ownerId, catalogProductId: 'cat-1' };

    vi.mocked(productRepository.findById).mockResolvedValue(existingProduct as any);

    const result = await service.execute(attackerId, productId);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Product not found or unauthorized');
    }
    expect(productRepository.delete).not.toHaveBeenCalled();
  });
});
