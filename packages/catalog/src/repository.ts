import { prisma, type Product } from "@wishhub/database";

export class CatalogRepository {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async create(data: any): Promise<Product> {
    return prisma.product.create({ data });
  }
}

export const catalogRepository = new CatalogRepository();
