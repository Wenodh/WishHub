import { prisma } from '@wishhub/database';

export class ProductRepository {
  async findById(id: string) {
    return prisma.savedProduct.findUnique({
      where: { id },
      include: {
        catalogProduct: true
      }
    });
  }

  async findByUserIdAndCatalogId(userId: string, catalogProductId: string) {
    return prisma.savedProduct.findUnique({
      where: {
        userId_catalogProductId: { userId, catalogProductId }
      },
      include: {
        catalogProduct: true
      }
    });
  }

  async findByCanonicalUrl(userId: string, canonicalUrl: string) {
    return prisma.savedProduct.findFirst({
        where: {
            userId,
            catalogProduct: { canonicalUrl }
        },
        include: {
            catalogProduct: true
        }
    });
  }

  async create(userId: string, catalogProductId: string, originalUrl: string) {
    return prisma.savedProduct.create({
      data: {
        userId,
        catalogProductId,
        originalUrl,
      },
      include: {
        catalogProduct: true
      }
    });
  }

  async findManyByUserId(userId: string) {
    return prisma.savedProduct.findMany({
      where: { userId },
      include: {
        catalogProduct: true,
        wishlistItems: true
      },
      orderBy: { addedAt: 'desc' }
    });
  }

  async delete(id: string) {
    return prisma.savedProduct.delete({
      where: { id }
    });
  }
}

export const productRepository = new ProductRepository();
