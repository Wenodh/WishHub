import { prisma } from '@wishhub/database';
import { Wishlist } from '../domain/models';

export class WishlistRepository {
  async findById(id: string): Promise<Wishlist | null> {
    const data = await prisma.wishlist.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new Wishlist(data, data.id);
  }

  async findDefault(userId: string): Promise<Wishlist | null> {
    const data = await prisma.wishlist.findFirst({
      where: { userId, isDefault: true },
    });

    if (!data) return null;

    return new Wishlist(data, data.id);
  }

  async findByUserId(userId: string): Promise<Wishlist[]> {
    const data = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return data.map(w => new Wishlist(w, w.id));
  }

  async save(wishlist: Wishlist): Promise<Wishlist> {
    const data = await prisma.wishlist.upsert({
      where: { id: wishlist.id },
      create: {
        id: wishlist.id,
        userId: wishlist.userId,
        name: wishlist.name,
        isDefault: wishlist.isDefault,
      },
      update: {
        name: wishlist.name,
        isDefault: wishlist.isDefault,
      },
    });

    return new Wishlist(data, data.id);
  }

  async delete(id: string): Promise<void> {
    await prisma.wishlist.delete({
      where: { id },
    });
  }

  async unsetOtherDefaults(userId: string, currentDefaultId: string): Promise<void> {
    await prisma.wishlist.updateMany({
      where: {
        userId,
        id: { not: currentDefaultId },
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }
}

export const wishlistRepository = new WishlistRepository();
