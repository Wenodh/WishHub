import { prisma, type Wishlist } from "@wishhub/database";

export class WishlistRepository {
  async findById(id: string): Promise<Wishlist | null> {
    return prisma.wishlist.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Wishlist[]> {
    return prisma.wishlist.findMany({ where: { userId } });
  }
}

export const wishlistRepository = new WishlistRepository();
