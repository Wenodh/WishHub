import { type Result, ok, err } from '@wishhub/core';
import { productRepository } from '../repository';
import { logger } from '@wishhub/telemetry';

export class DeleteProductService {
  async execute(userId: string, productId: string): Promise<Result<boolean, string>> {
    try {
      // Find first to verify ownership (repository.delete also uses userId for safety)
      await productRepository.delete(productId, userId);

      logger.info('Product deleted', { userId, productId });
      return ok(true);
    } catch (error: any) {
      logger.error('Failed to delete product', { userId, productId, error: error.message });
      return err('Could not delete product');
    }
  }
}

export const deleteProductService = new DeleteProductService();
