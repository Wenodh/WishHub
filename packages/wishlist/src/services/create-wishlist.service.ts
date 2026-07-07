import { type Result, ok, err } from '@wishhub/core';
import { wishlistRepository } from '../repository/wishlist.repository';

export class CreateWishlistService {
  async execute(userId: string, name: string, isDefault: boolean = false): Promise<Result<any, string>> {
    const trimmedName = name.trim();
    if (!trimmedName) return err('Wishlist name cannot be empty');
    if (trimmedName.length > 50) return err('Wishlist name too long');

    const count = await wishlistRepository.count(userId);
    if (count >= 50) return err('Maximum wishlists reached (50)');

    // Check uniqueness (case-insensitive)
    const wishlists = await wishlistRepository.findByUserId(userId);
    const exists = wishlists.some(w => w.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) return err('A wishlist with this name already exists');

    // If it's the first wishlist, make it default regardless of input
    const shouldBeDefault = isDefault || count === 0;

    const wishlist = await wishlistRepository.create(userId, trimmedName, shouldBeDefault);

    if (shouldBeDefault) {
      await wishlistRepository.unsetOtherDefaults(userId, wishlist.id);
    }

    return ok(wishlist);
  }
}

export const createWishlistService = new CreateWishlistService();
