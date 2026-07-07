import { type Result, ok, err } from '@wishhub/core';
import { wishlistRepository } from '../repository/wishlist.repository';

export class RenameWishlistService {
  async execute(userId: string, wishlistId: string, newName: string): Promise<Result<any, string>> {
    const trimmedName = newName.trim();
    if (!trimmedName) return err('Name cannot be empty');

    const wishlist = await wishlistRepository.findById(wishlistId);
    if (!wishlist || wishlist.userId !== userId) return err('Wishlist not found');

    // Check uniqueness
    const userWishlists = await wishlistRepository.findByUserId(userId);
    if (userWishlists.some(w => w.name.toLowerCase() === trimmedName.toLowerCase() && w.id !== wishlistId)) {
        return err('A wishlist with this name already exists');
    }

    const updated = await wishlistRepository.update(wishlistId, { name: trimmedName });
    return ok(updated);
  }
}

export const renameWishlistService = new RenameWishlistService();
