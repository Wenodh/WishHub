import { Result, ok } from '@wishhub/core';
import { DomainError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistItemRepository } from '../repository/wishlist-item.repository';
import { WishlistSummaryDto } from '../contracts';

export interface ListWishlistsInput {
  userId: string;
}

export class ListWishlistsService {
  constructor(
    private wishlistRepository: WishlistRepository,
    private wishlistItemRepository: WishlistItemRepository
  ) {}

  async execute(input: ListWishlistsInput): Promise<Result<WishlistSummaryDto[], DomainError>> {
    const wishlists = await this.wishlistRepository.findByUserId(input.userId);

    const summaries: WishlistSummaryDto[] = await Promise.all(
      wishlists.map(async (w) => {
        const itemCount = await this.wishlistItemRepository.countByWishlistId(w.id);
        return {
          id: w.id,
          name: w.name,
          isDefault: w.isDefault,
          itemCount,
        };
      })
    );

    return ok(summaries);
  }
}
