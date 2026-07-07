import { prisma } from '@wishhub/database';

export class ProductRepository {
  async findByUserIdAndCatalogId(userId: string, catalogProductId: string) {
    return prisma.savedProduct.findUnique({
      where: {
        userId_catalogProductId: { userId, catalogProductId }
      },
      include: {
        catalogProduct: {
          include: { images: true }
        }
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
            catalogProduct: {
                include: { images: true }
            }
        }
    });
  }

  async create(userId: string, catalogProductId: string) {
    return prisma.savedProduct.create({
      data: {
        userId,
        catalogProductId,
      },
      include: {
        catalogProduct: {
          include: { images: true }
        }
      }
    });
  }

  async findManyByUserId(userId: string) {
    return prisma.savedProduct.findMany({
      where: { userId },
      include: {
        catalogProduct: {
          include: { images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async delete(id: string) {
    return prisma.savedProduct.delete({
      where: { id }
    });
  }
}

export const productRepository = new ProductRepository();
