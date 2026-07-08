import { prisma } from '@wishhub/database';

export class CatalogRepository {
  async findByCanonicalUrl(canonicalUrl: string) {
    return prisma.catalogProduct.findUnique({
      where: { canonicalUrl },
    });
  }

  async create(data: any) {
    const { images, ...rest } = data;
    return prisma.catalogProduct.create({
      data: {
        ...rest,
        images: images || [],
        store: data.store || data.storeName || 'unknown'
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.catalogProduct.update({
      where: { id },
      data,
    });
  }
}

export const catalogRepository = new CatalogRepository();
