import { type Result, ok, err } from '@wishhub/core';
import { productRepository } from '../repository';
import { telemetry } from '@wishhub/telemetry';

export class ListProductsService {
  async execute(
    userId: string,
    params?: { limit?: number; cursor?: string }
  ): Promise<Result<any[], string>> {
    const start = performance.now();
    try {
      const products = await productRepository.findManyByUserId(userId);

      telemetry.logger.info('Listed user products', {
        userId,
        count: products.length,
        durationMs: performance.now() - start,
      });

      return ok(products);
    } catch (error: any) {
      telemetry.logger.error('Failed to list products', { userId, error: error.message });
      return err('Could not list products');
    }
  }
}

export const listProductsService = new ListProductsService();
