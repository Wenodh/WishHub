import { prisma } from '@wishhub/database';
import { CatalogProduct } from '../domain/models';

export class CatalogRepository {
  async findByCanonicalUrl(canonicalUrl: string): Promise<CatalogProduct | null> {
    const data = await prisma.catalogProduct.findUnique({
      where: { canonicalUrl },
    });

    if (!data) return null;

    return new CatalogProduct({
      ...data,
      images: data.images as string[],
      metadata: data.metadata as Record<string, any>,
    }, data.id);
  }

  async save(product: CatalogProduct): Promise<CatalogProduct> {
    const data = await prisma.catalogProduct.upsert({
      where: { canonicalUrl: product.canonicalUrl },
      create: {
        id: product.id,
        store: product.store,
        externalId: product.externalId,
        canonicalUrl: product.canonicalUrl,
        title: product.title,
        description: product.description,
        brand: product.brand,
        images: product.images,
        category: product.category,
        metadata: product.metadata,
      },
      update: {
        title: product.title,
        description: product.description,
        brand: product.brand,
        images: product.images,
        category: product.category,
        metadata: product.metadata,
      },
    });

    return new CatalogProduct({
      ...data,
      images: data.images as string[],
      metadata: data.metadata as Record<string, any>,
    }, data.id);
  }
}

export const catalogRepository = new CatalogRepository();
