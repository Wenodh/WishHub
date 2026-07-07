import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveProductService } from '../services/save-product.service';
import { productRepository } from '../repository';
import { urlNormalizerService } from '../services/url-normalizer.service';

vi.mock('../repository');
vi.mock('../services/url-normalizer.service');
vi.mock('@wishhub/telemetry', () => ({
  telemetry: {
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
    track: vi.fn(),
    errorReporting: {
      captureException: vi.fn(),
    }
  }
}));

describe('SaveProductService', () => {
  let service: SaveProductService;

  beforeEach(() => {
    service = new SaveProductService();
    vi.clearAllMocks();
  });

  it('should return existing product if already saved', async () => {
    const userId = 'user-1';
    const data = { name: 'Product 1', url: 'https://example.com/p1' };
    const existing = { id: 'prod-1', ...data, canonicalUrl: 'https://example.com/p1' };

    vi.mocked(urlNormalizerService.normalize).mockReturnValue(data.url);
    vi.mocked(productRepository.findByCanonicalUrl).mockResolvedValue(existing as any);

    const result = await service.execute(userId, data as any);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('prod-1');
    }
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('should create new product if not exists', async () => {
    const userId = 'user-1';
    const data = { name: 'Product 1', url: 'https://example.com/p1' };
    const created = { id: 'new-prod', ...data, canonicalUrl: 'https://example.com/p1' };

    vi.mocked(urlNormalizerService.normalize).mockReturnValue(data.url);
    vi.mocked(productRepository.findByCanonicalUrl).mockResolvedValue(null);
    vi.mocked(productRepository.create).mockResolvedValue(created as any);

    const result = await service.execute(userId, data as any);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('new-prod');
    }
    expect(productRepository.create).toHaveBeenCalled();
  });
});
