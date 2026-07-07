import { prisma } from '@wishhub/database';

export class WishlistRepository {
  async create(userId: string, name: string, isDefault: boolean = false) {
    return prisma.wishlist.create({
      data: {
        userId,
        name,
        isDefault,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDefault(userId: string) {
    return prisma.wishlist.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async findById(id: string) {
    return prisma.wishlist.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            savedProduct: {
              include: {
                catalogProduct: {
                  include: { images: true }
                }
              }
            }
          }
        }
      }
    });
  }

  async update(id: string, data: { name?: string; isDefault?: boolean }) {
    return prisma.wishlist.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.wishlist.delete({
      where: { id },
    });
  }

  async unsetOtherDefaults(userId: string, currentDefaultId: string) {
    return prisma.wishlist.updateMany({
      where: {
        userId,
        id: { not: currentDefaultId },
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }

  async count(userId: string) {
    return prisma.wishlist.count({
      where: { userId }
    });
  }
}

export const wishlistRepository = new WishlistRepository();
