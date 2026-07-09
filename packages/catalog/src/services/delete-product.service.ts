import { type Result, ok, err } from '@wishhub/core';
import { productRepository } from '../repository';
import { telemetry } from '@wishhub/telemetry';

export class DeleteProductService {
  async execute(userId: string, productId: string): Promise<Result<boolean, string>> {
    const start = performance.now();
    try {
      // Check ownership
      const product = await productRepository.findByUserIdAndCatalogId(userId, productId);
      if (!product || product.userId !== userId) {
        return err('Product not found or unauthorized');
      }

      await productRepository.delete(product.id);

      telemetry.logger.info('Product deleted', {
        userId,
        productId,
        durationMs: performance.now() - start,
      });

      telemetry.track('product.deleted', { productId, userId });

      return ok(true);
    } catch (error: any) {
      telemetry.logger.error('Failed to delete product', { userId, productId, error: error.message });
      return err('Could not delete product');
    }
  }
}

export const deleteProductService = new DeleteProductService();
