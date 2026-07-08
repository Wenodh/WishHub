import { prisma } from '@wishhub/database';
import { SavedProduct } from '../domain/models';

export class SavedProductRepository {
  async findByUserIdAndCatalogId(userId: string, catalogProductId: string): Promise<SavedProduct | null> {
    const data = await prisma.savedProduct.findUnique({
      where: {
        userId_catalogProductId: { userId, catalogProductId },
      },
    });

    if (!data) return null;

    return new SavedProduct(data, data.id);
  }

  async save(product: SavedProduct): Promise<SavedProduct> {
    const data = await prisma.savedProduct.upsert({
      where: {
        userId_catalogProductId: {
          userId: product.userId,
          catalogProductId: product.catalogProductId,
        },
      },
      create: {
        id: product.id,
        userId: product.userId,
        catalogProductId: product.catalogProductId,
        originalUrl: product.originalUrl,
        addedAt: product.addedAt,
        archivedAt: product.archivedAt,
      },
      update: {
        archivedAt: product.archivedAt,
      },
    });

    return new SavedProduct(data, data.id);
  }

  async delete(id: string): Promise<void> {
    await prisma.savedProduct.delete({
      where: { id },
    });
  }
}

export const savedProductRepository = new SavedProductRepository();
