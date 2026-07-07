import { prisma } from '@wishhub/database';
import { normalizeUrl } from '@wishhub/scraper';

export class CatalogRepository {
  async findByCanonicalUrl(canonicalUrl: string) {
    return prisma.catalogProduct.findUnique({
      where: { canonicalUrl },
      include: { images: true }
    });
  }

  async create(data: any) {
    const { images, ...rest } = data;
    return prisma.catalogProduct.create({
      data: {
        ...rest,
        images: {
          create: images?.map((url: string) => ({ url })) || []
        }
      },
      include: { images: true }
    });
  }

  async update(id: string, data: any) {
    // Basic update for now, image sync can be added later
    return prisma.catalogProduct.update({
      where: { id },
      data,
      include: { images: true }
    });
  }
}

export const catalogRepository = new CatalogRepository();
