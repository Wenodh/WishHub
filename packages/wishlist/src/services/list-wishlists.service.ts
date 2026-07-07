import { type Result, ok, err } from '@wishhub/core';
import { wishlistRepository } from '../repository/wishlist.repository';

export class ListWishlistsService {
  async execute(userId: string): Promise<Result<any[], string>> {
    const wishlists = await wishlistRepository.findByUserId(userId);
    return ok(wishlists);
  }
}

export const listWishlistsService = new ListWishlistsService();
