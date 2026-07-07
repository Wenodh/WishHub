import { type Result, ok, err } from '@wishhub/core';
import { wishlistItemRepository } from '../repository/wishlist-item.repository';
import { wishlistRepository } from '../repository/wishlist.repository';

export class RemoveProductFromWishlistService {
  async execute(userId: string, wishlistId: string, savedProductId: string): Promise<Result<boolean, string>> {
    const wishlist = await wishlistRepository.findById(wishlistId);
    if (!wishlist || wishlist.userId !== userId) return err('Wishlist not found');

    try {
        await wishlistItemRepository.remove(wishlistId, savedProductId);
        return ok(true);
    } catch (error) {
        return err('Could not remove product from wishlist');
    }
  }
}

export const removeProductFromWishlistService = new RemoveProductFromWishlistService();
