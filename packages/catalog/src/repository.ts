import { prisma } from '@wishhub/database';
import { type ProductEntity } from './domain';
import { type CreateProductRequest } from '@wishhub/contracts';

export class ProductRepository {
  async create(data: CreateProductRequest & { userId: string; canonicalUrl: string }): Promise<ProductEntity> {
    const product = await prisma.savedProduct.create({
      data: {
        userId: data.userId,
        name: data.name,
        url: data.url,
        canonicalUrl: data.canonicalUrl,
        description: data.description,
        price: data.price,
        currency: data.currency,
        storeName: data.storeName,
        rawMetadata: data.rawMetadata,
        metadataVersion: data.metadataVersion,
        images: {
          create: data.images?.map((url) => ({ url })) ?? (data.imageUrl ? [{ url: data.imageUrl }] : []),
        },
      },
      include: { images: true },
    });

    return this.mapToDomain(product);
  }

  async findByCanonicalUrl(userId: string, canonicalUrl: string): Promise<ProductEntity | null> {
    const product = await prisma.savedProduct.findUnique({
      where: {
        userId_canonicalUrl: { userId, canonicalUrl },
      },
      include: { images: true },
    });

    return product ? this.mapToDomain(product) : null;
  }

  async listByUser(userId: string, options: { limit: number; cursor?: string }): Promise<ProductEntity[]> {
    const products = await prisma.savedProduct.findMany({
      where: { userId },
      take: options.limit,
      skip: options.cursor ? 1 : 0,
      cursor: options.cursor ? { id: options.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });

    return products.map(p => this.mapToDomain(p));
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.savedProduct.delete({
      where: { id, userId },
    });
  }

  private mapToDomain(dbProduct: any): ProductEntity {
    return {
      id: dbProduct.id,
      userId: dbProduct.userId,
      name: dbProduct.name,
      url: dbProduct.url,
      canonicalUrl: dbProduct.canonicalUrl,
      description: dbProduct.description,
      price: dbProduct.price,
      currency: dbProduct.currency,
      storeName: dbProduct.storeName,
      images: dbProduct.images.map((img: any) => ({
        url: img.url,
        type: img.type,
      })),
      rawMetadata: dbProduct.rawMetadata,
      metadataVersion: dbProduct.metadataVersion,
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }
}

export const productRepository = new ProductRepository();
