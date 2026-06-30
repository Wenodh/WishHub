import { type Result, ok, err } from '@wishhub/core';
import { type CreateProductRequest, type ProductResponse } from '@wishhub/contracts';
import { productRepository } from '../repository';
import { urlNormalizerService } from './url-normalizer.service';
import { type ProductEntity } from '../domain';
import { logger } from '@wishhub/telemetry';

export class SaveProductService {
  async execute(
    userId: string,
    data: CreateProductRequest
  ): Promise<Result<ProductEntity, string>> {
    try {
      const canonicalUrl = urlNormalizerService.normalize(data.url);

      // Idempotency: check if product already exists for this user
      const existingProduct = await productRepository.findByCanonicalUrl(userId, canonicalUrl);
      if (existingProduct) {
        logger.info('Product already saved, returning existing entity', {
          userId,
          canonicalUrl,
          productId: existingProduct.id,
        });
        return ok(existingProduct);
      }

      logger.info('Saving new product', {
        userId,
        storeName: data.storeName,
        canonicalUrl,
      });

      const product = await productRepository.create({
        ...data,
        userId,
        canonicalUrl,
      });

      return ok(product);
    } catch (error: any) {
      logger.error('Failed to save product', { userId, url: data.url, error: error.message });
      return err('Could not save product');
    }
  }
}

export const saveProductService = new SaveProductService();
