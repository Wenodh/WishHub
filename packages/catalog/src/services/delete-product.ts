import { productRepository } from '../repository';

export class DeleteProductService {
  async execute(userId: string, productId: string): Promise<void> {
    // Repository method already filters by userId, providing implicit ownership check
    await productRepository.delete(productId, userId);
  }
}

export const deleteProductService = new DeleteProductService();
