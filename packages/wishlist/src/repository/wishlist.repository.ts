import { prisma, Prisma } from '@wishhub/database';
import { Wishlist } from '../domain/models';

export class WishlistRepository {
  async findById(id: string, tx?: Prisma.TransactionClient): Promise<Wishlist | null> {
    const client = tx || prisma;
    const data = await client.wishlist.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new Wishlist(data, data.id);
  }

  async findDefault(userId: string, tx?: Prisma.TransactionClient): Promise<Wishlist | null> {
    const client = tx || prisma;
    const data = await client.wishlist.findFirst({
      where: { userId, isDefault: true },
    });

    if (!data) return null;

    return new Wishlist(data, data.id);
  }

  async findByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<Wishlist[]> {
    const client = tx || prisma;
    const data = await client.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return data.map((w: any) => new Wishlist(w, w.id));
  }

  async countByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx || prisma;
    return await client.wishlist.count({
      where: { userId },
    });
  }

  async save(wishlist: Wishlist, tx?: Prisma.TransactionClient): Promise<Wishlist> {
    const client = tx || prisma;
    const data = await client.wishlist.upsert({
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

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.wishlist.delete({
      where: { id },
    });
  }

  async unsetOtherDefaults(userId: string, currentDefaultId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.wishlist.updateMany({
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
