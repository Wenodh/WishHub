import { prisma } from '@wishhub/database';

export class WishlistItemRepository {
  async add(wishlistId: string, savedProductId: string) {
    return prisma.wishlistItem.upsert({
      where: {
        wishlistId_savedProductId: { wishlistId, savedProductId },
      },
      create: {
        wishlistId,
        savedProductId,
      },
      update: {},
    });
  }

  async remove(wishlistId: string, savedProductId: string) {
    return prisma.wishlistItem.delete({
      where: {
        wishlistId_savedProductId: { wishlistId, savedProductId },
      },
    });
  }

  async move(savedProductId: string, fromWishlistId: string, toWishlistId: string) {
    return prisma.$transaction([
      prisma.wishlistItem.delete({
        where: {
          wishlistId_savedProductId: { wishlistId: fromWishlistId, savedProductId },
        },
      }),
      prisma.wishlistItem.create({
        data: {
          wishlistId: toWishlistId,
          savedProductId,
        },
      }),
    ]);
  }
}

export const wishlistItemRepository = new WishlistItemRepository();
