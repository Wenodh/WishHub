import { prisma, Prisma } from '@wishhub/database';
import { WishlistItem } from '../domain/models';

export class WishlistItemRepository {
  async add(item: WishlistItem, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.wishlistItem.upsert({
      where: {
        wishlistId_savedProductId: {
          wishlistId: item.wishlistId,
          savedProductId: item.savedProductId,
        },
      },
      create: {
        wishlistId: item.wishlistId,
        savedProductId: item.savedProductId,
        createdAt: item.createdAt,
      },
      update: {},
    });
  }

  async remove(wishlistId: string, savedProductId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.wishlistItem.delete({
      where: {
        wishlistId_savedProductId: { wishlistId, savedProductId },
      },
    });
  }

  async removeAllByWishlistId(wishlistId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.wishlistItem.deleteMany({
      where: { wishlistId },
    });
  }

  async findByWishlistId(wishlistId: string, tx?: Prisma.TransactionClient): Promise<WishlistItem[]> {
    const client = tx || prisma;
    const data = await client.wishlistItem.findMany({
      where: { wishlistId },
      orderBy: { createdAt: 'desc' },
    });

    return data.map((item: any) => new WishlistItem(item, item.id));
  }

  async findByWishlistIdPaginated(wishlistId: string, skip: number, take: number, tx?: Prisma.TransactionClient): Promise<WishlistItem[]> {
    const client = tx || prisma;
    const data = await client.wishlistItem.findMany({
      where: { wishlistId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return data.map((item: any) => new WishlistItem(item, item.id));
  }

  async countByWishlistId(wishlistId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx || prisma;
    return await client.wishlistItem.count({
      where: { wishlistId },
    });
  }

  async exists(wishlistId: string, savedProductId: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx || prisma;
    const count = await client.wishlistItem.count({
      where: { wishlistId, savedProductId },
    });
    return count > 0;
  }
}

export const wishlistItemRepository = new WishlistItemRepository();
