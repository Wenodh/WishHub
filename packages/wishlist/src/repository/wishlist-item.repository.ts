import { prisma } from '@wishhub/database';
import { WishlistItem } from '../domain/models';

export class WishlistItemRepository {
  async add(item: WishlistItem): Promise<void> {
    await prisma.wishlistItem.upsert({
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

  async remove(wishlistId: string, savedProductId: string): Promise<void> {
    await prisma.wishlistItem.delete({
      where: {
        wishlistId_savedProductId: { wishlistId, savedProductId },
      },
    });
  }

  async findByWishlistId(wishlistId: string): Promise<WishlistItem[]> {
    const data = await prisma.wishlistItem.findMany({
      where: { wishlistId },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(item => new WishlistItem(item));
  }
}

export const wishlistItemRepository = new WishlistItemRepository();
