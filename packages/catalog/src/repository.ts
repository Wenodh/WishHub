import { prisma } from '@wishhub/database';
import { type DomainProduct } from './domain';
import { type CreateProductDTO } from '@wishhub/contracts';

export class ProductRepository {
  async findById(id: string, userId: string): Promise<DomainProduct | null> {
    const product = await prisma.savedProduct.findUnique({
      where: { id, userId },
      include: { images: true },
    });
    return product ? this.mapToDomain(product) : null;
  }

  async findByCanonicalUrl(userId: string, canonicalUrl: string): Promise<DomainProduct | null> {
    const product = await prisma.savedProduct.findUnique({
      where: { userId_canonicalUrl: { userId, canonicalUrl } },
      include: { images: true },
    });
    return product ? this.mapToDomain(product) : null;
  }

  async list(params: { userId: string; limit: number; cursor?: string }): Promise<DomainProduct[]> {
    const products = await prisma.savedProduct.findMany({
      where: { userId: params.userId },
      take: params.limit,
      skip: params.cursor ? 1 : 0,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });
    return products.map((p) => this.mapToDomain(p));
  }

  async create(data: CreateProductDTO & { userId: string; canonicalUrl: string }): Promise<DomainProduct> {
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

  async delete(id: string, userId: string): Promise<void> {
    await prisma.savedProduct.delete({
      where: { id, userId },
    });
  }

  private mapToDomain(dbProduct: any): DomainProduct {
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
      images: dbProduct.images.map((img: any) => ({ url: img.url, type: img.type })),
      rawMetadata: dbProduct.rawMetadata,
      metadataVersion: dbProduct.metadataVersion,
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }
}

export const productRepository = new ProductRepository();
