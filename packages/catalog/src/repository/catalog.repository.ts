import { prisma } from '@wishhub/database';

export class CatalogRepository {
  async findByCanonicalUrl(canonicalUrl: string) {
    return prisma.catalogProduct.findUnique({
      where: { canonicalUrl },
    });
  }

  async create(data: any) {
    const imagesArray = Array.isArray(data.images)
      ? data.images.map((img: any) => (typeof img === 'string' ? { url: img } : img))
      : [];

    const metadataObj = {
      price: data.price,
      currency: data.currency,
      ...(data.rawMetadata || {}),
    };

    return prisma.catalogProduct.create({
      data: {
        canonicalUrl: data.canonicalUrl,
        title: data.title || data.name || 'Saved Product',
        description: data.description,
        brand: data.brand,
        category: data.category,
        store: data.store || data.storeName || 'unknown',
        externalId: data.externalId,
        images: imagesArray,
        metadata: metadataObj,
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
