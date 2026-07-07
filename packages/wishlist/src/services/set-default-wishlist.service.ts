import { type Result, ok, err } from '@wishhub/core';
import { wishlistRepository } from '../repository/wishlist.repository';

export class SetDefaultWishlistService {
  async execute(userId: string, wishlistId: string): Promise<Result<any, string>> {
    const wishlist = await wishlistRepository.findById(wishlistId);
    if (!wishlist || wishlist.userId !== userId) return err('Wishlist not found');

    const updated = await wishlistRepository.update(wishlistId, { isDefault: true });
    await wishlistRepository.unsetOtherDefaults(userId, wishlistId);

    return ok(updated);
  }
}

export const setDefaultWishlistService = new SetDefaultWishlistService();
