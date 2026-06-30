import { type Result, ok, err } from '@wishhub/core';
import { productRepository } from '../repository';
import { type ProductEntity } from '../domain';
import { logger } from '@wishhub/telemetry';

export class ListProductsService {
  async execute(
    userId: string,
    options: { limit: number; cursor?: string }
  ): Promise<Result<ProductEntity[], string>> {
    try {
      const products = await productRepository.listByUser(userId, options);
      return ok(products);
    } catch (error: any) {
      logger.error('Failed to list products', { userId, error: error.message });
      return err('Could not retrieve products');
    }
  }
}

export const listProductsService = new ListProductsService();
