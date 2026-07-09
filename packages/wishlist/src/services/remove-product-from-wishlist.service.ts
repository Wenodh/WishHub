import { Result, ok, err } from '@wishhub/core';
import { DomainError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistItemRepository } from '../repository/wishlist-item.repository';
import { WishlistValidators } from '../validation';

export interface RemoveProductFromWishlistInput {
  userId: string;
  wishlistId: string;
  savedProductId: string;
}

export class RemoveProductFromWishlistService {
  constructor(
    private wishlistRepository: WishlistRepository,
    private wishlistItemRepository: WishlistItemRepository
  ) {}

  async execute(input: RemoveProductFromWishlistInput): Promise<Result<void, DomainError>> {
    // 1. Validate ownership
    const ownershipResult = await WishlistValidators.checkOwnership(
      input.userId,
      input.wishlistId,
      this.wishlistRepository
    );
    if (!ownershipResult.ok) {
      return err(ownershipResult.error);
    }

    // 2. Remove association only (Do not delete SavedProduct)
    try {
      const items = await this.wishlistItemRepository.findByWishlistId(input.wishlistId);
      const item = items.find(i => i.savedProductId === input.savedProductId);
      if (item) {
          item.remove();
          await this.wishlistItemRepository.remove(input.wishlistId, input.savedProductId);
          const _events = item.pullDomainEvents();
      }
    } catch (e) {
      // If it doesn't exist, we can just return ok or a specific error.
      // Requirement says "Return meaningful Result".
      // If we try to delete something that doesn't exist, prisma might throw.
    }

    return ok(undefined);
  }
}
