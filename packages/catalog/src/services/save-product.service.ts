import { type Result, ok, err } from '@wishhub/core';
import { type CreateProductRequest } from '@wishhub/contracts';
import { productRepository } from '../repository';
import { urlNormalizerService } from './url-normalizer.service';
import { type ProductEntity } from '../domain';
import { telemetry } from '@wishhub/telemetry';

export class SaveProductService {
  async execute(
    userId: string,
    data: CreateProductRequest
  ): Promise<Result<ProductEntity, string>> {
    const start = performance.now();
    try {
      const canonicalUrl = urlNormalizerService.normalize(data.url);

      // Idempotency: check if product already exists for this user
      const existingProduct = await productRepository.findByCanonicalUrl(userId, canonicalUrl);
      if (existingProduct) {
        telemetry.logger.info('Product already saved, returning existing entity', {
          userId,
          operation: 'save-product',
          durationMs: performance.now() - start,
          productId: existingProduct.id,
        });
        telemetry.track('product.duplicate', {
            productId: existingProduct.id,
            userId,
            store: data.storeName || 'unknown'
        });
        return ok(existingProduct);
      }

      const product = await productRepository.create({
        ...data,
        userId,
        canonicalUrl,
      });

      telemetry.logger.info('New product saved', {
        userId,
        operation: 'save-product',
        durationMs: performance.now() - start,
        productId: product.id,
      });

      telemetry.track('product.saved', {
        productId: product.id,
        userId,
        store: data.storeName || 'unknown'
      });

      return ok(product);
    } catch (error: any) {
      telemetry.logger.error('Failed to save product', {
        userId,
        operation: 'save-product',
        durationMs: performance.now() - start,
        error: error.message
      });
      telemetry.errorReporting.captureException(error, { userId, url: data.url });
      return err('Could not save product');
    }
  }
}

export const saveProductService = new SaveProductService();
