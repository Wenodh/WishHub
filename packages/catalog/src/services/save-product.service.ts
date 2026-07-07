import { type Result, ok, err } from '@wishhub/core';
import { type CreateProductRequest } from '@wishhub/contracts';
import { productRepository } from '../repository';
import { catalogRepository } from '../repository/catalog.repository';
import { urlNormalizerService } from './url-normalizer.service';
import { telemetry } from '@wishhub/telemetry';

export class SaveProductService {
  async execute(
    userId: string,
    data: CreateProductRequest
  ): Promise<Result<any, string>> {
    const start = performance.now();
    try {
      const canonicalUrl = urlNormalizerService.normalize(data.url);

      // 1. Get or Create Catalog Product
      let catalogProduct = await catalogRepository.findByCanonicalUrl(canonicalUrl);
      if (!catalogProduct) {
        catalogProduct = await catalogRepository.create({
          canonicalUrl,
          name: data.name,
          description: data.description,
          storeName: data.storeName,
          price: data.price,
          currency: data.currency,
          images: data.images || (data.imageUrl ? [data.imageUrl] : []),
          rawMetadata: data.rawMetadata,
        });
      }

      // 2. Link to User (SavedProduct)
      const existingSaved = await productRepository.findByUserIdAndCatalogId(userId, catalogProduct.id);
      if (existingSaved) {
        telemetry.logger.info('Product already saved, returning existing entity', {
          userId,
          operation: 'save-product',
          durationMs: performance.now() - start,
          productId: existingSaved.id,
        });
        telemetry.track('product.duplicate', {
            productId: existingSaved.id,
            userId,
            store: data.storeName || 'unknown'
        });
        return ok(existingSaved);
      }

      const savedProduct = await productRepository.create(userId, catalogProduct.id);

      telemetry.logger.info('New product saved', {
        userId,
        operation: 'save-product',
        durationMs: performance.now() - start,
        productId: savedProduct.id,
      });

      telemetry.track('product.saved', {
        productId: savedProduct.id,
        userId,
        store: data.storeName || 'unknown'
      });

      return ok(savedProduct);
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
