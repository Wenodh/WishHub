import { type Result, ok, err } from '@wishhub/core';
import { wishlistRepository } from '../repository/wishlist.repository';

export class DeleteWishlistService {
  async execute(userId: string, wishlistId: string): Promise<Result<boolean, string>> {
    const wishlist = await wishlistRepository.findById(wishlistId);
    if (!wishlist || wishlist.userId !== userId) return err('Wishlist not found');

    const totalCount = await wishlistRepository.count(userId);
    if (totalCount <= 1) return err('Cannot delete your only wishlist');

    if (wishlist.isDefault) {
      // Find another wishlist to make default
      const others = await wishlistRepository.findByUserId(userId);
      const nextDefault = others.find(w => w.id !== wishlistId);
      if (nextDefault) {
        await wishlistRepository.update(nextDefault.id, { isDefault: true });
      }
    }

    await wishlistRepository.delete(wishlistId);
    return ok(true);
  }
}

export const deleteWishlistService = new DeleteWishlistService();
