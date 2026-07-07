import { type Result, ok, err } from '@wishhub/core';
import { wishlistRepository } from '../repository/wishlist.repository';
import { wishlistItemRepository } from '../repository/wishlist-item.repository';

export class MoveProductService {
  async execute(
    userId: string,
    savedProductId: string,
    fromWishlistId: string,
    toWishlistId: string
  ): Promise<Result<boolean, string>> {
    // Permission checks
    const fromWishlist = await wishlistRepository.findById(fromWishlistId);
    const toWishlist = await wishlistRepository.findById(toWishlistId);

    if (!fromWishlist || fromWishlist.userId !== userId) return err('Source wishlist not found');
    if (!toWishlist || toWishlist.userId !== userId) return err('Target wishlist not found');

    try {
        await wishlistItemRepository.move(savedProductId, fromWishlistId, toWishlistId);
        return ok(true);
    } catch (error) {
        return err('Could not move product');
    }
  }
}

export const moveProductService = new MoveProductService();
