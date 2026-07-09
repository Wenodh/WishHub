import { prisma, Prisma } from '@wishhub/database';
import { CatalogProduct } from '../domain/models';

export class CatalogRepository {
  async findById(id: string, tx?: Prisma.TransactionClient): Promise<CatalogProduct | null> {
    const client = tx || prisma;
    const data = await client.catalogProduct.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new CatalogProduct({
      ...data,
      images: data.images as string[],
      metadata: data.metadata as Record<string, any>,
    }, data.id);
  }

  async findByCanonicalUrl(canonicalUrl: string, tx?: Prisma.TransactionClient): Promise<CatalogProduct | null> {
    const client = tx || prisma;
    const data = await client.catalogProduct.findUnique({
      where: { canonicalUrl },
    });

    if (!data) return null;

    return new CatalogProduct({
      ...data,
      images: data.images as string[],
      metadata: data.metadata as Record<string, any>,
    }, data.id);
  }

  async findByIds(ids: string[], tx?: Prisma.TransactionClient): Promise<CatalogProduct[]> {
    const client = tx || prisma;
    const data = await client.catalogProduct.findMany({
      where: {
        id: { in: ids },
      },
    });

    return data.map((d: any) => new CatalogProduct({
      ...d,
      images: d.images as string[],
      metadata: d.metadata as Record<string, any>,
    }, d.id));
  }

  async save(product: CatalogProduct, tx?: Prisma.TransactionClient): Promise<CatalogProduct> {
    const client = tx || prisma;
    const data = await client.catalogProduct.upsert({
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
