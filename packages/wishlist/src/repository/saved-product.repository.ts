import { prisma, Prisma } from '@wishhub/database';
import { SavedProduct } from '../domain/models';

export class SavedProductRepository {
  async findById(id: string, tx?: Prisma.TransactionClient): Promise<SavedProduct | null> {
    const client = tx || prisma;
    const data = await client.savedProduct.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new SavedProduct(data, data.id);
  }

  async findByUserIdAndCatalogId(userId: string, catalogProductId: string, tx?: Prisma.TransactionClient): Promise<SavedProduct | null> {
    const client = tx || prisma;
    const data = await client.savedProduct.findUnique({
      where: {
        userId_catalogProductId: { userId, catalogProductId },
      },
    });

    if (!data) return null;

    return new SavedProduct(data, data.id);
  }

  async findByIds(ids: string[], tx?: Prisma.TransactionClient): Promise<SavedProduct[]> {
    const client = tx || prisma;
    const data = await client.savedProduct.findMany({
      where: {
        id: { in: ids },
      },
    });

    return data.map((d: any) => new SavedProduct(d, d.id));
  }

  async save(product: SavedProduct, tx?: Prisma.TransactionClient): Promise<SavedProduct> {
    const client = tx || prisma;
    const data = await client.savedProduct.upsert({
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

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.savedProduct.delete({
      where: { id },
    });
  }
}

export const savedProductRepository = new SavedProductRepository();
