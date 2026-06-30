import { productRepository } from '../repository';
import { urlNormalizerService } from './url-normalizer';
import { type CreateProductDTO } from '@wishhub/contracts';
import { type DomainProduct } from '../domain';
import { logger } from '@wishhub/telemetry';

export class SaveProductService {
  async execute(userId: string, data: CreateProductDTO): Promise<DomainProduct> {
    const canonicalUrl = urlNormalizerService.normalize(data.url);

    // Check for existing product (Idempotency)
    const existing = await productRepository.findByCanonicalUrl(userId, canonicalUrl);
    if (existing) {
      logger.info('Product already exists, returning existing', { userId, canonicalUrl });
      return existing;
    }

    logger.info('Saving new product', {
      userId,
      store: data.storeName,
      url: canonicalUrl,
      metadataVersion: data.metadataVersion
    });

    return productRepository.create({
      ...data,
      userId,
      canonicalUrl,
    });
  }
}

export const saveProductService = new SaveProductService();
