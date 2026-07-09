import { Result, ok, err } from '@wishhub/core';
import { WishlistItem } from '../domain/models';
import { DomainError, SavedProductNotFoundError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistItemRepository } from '../repository/wishlist-item.repository';
import { SavedProductRepository } from '../repository/saved-product.repository';
import { WishlistValidators } from '../validation';

export interface AddProductToWishlistInput {
  userId: string;
  wishlistId: string;
  savedProductId: string;
}

export class AddProductToWishlistService {
  constructor(
    private wishlistRepository: WishlistRepository,
    private wishlistItemRepository: WishlistItemRepository,
    private savedProductRepository: SavedProductRepository
  ) {}

  async execute(input: AddProductToWishlistInput): Promise<Result<WishlistItem, DomainError>> {
    // 1. Validate ownership (Wishlist)
    const ownershipResult = await WishlistValidators.checkOwnership(
      input.userId,
      input.wishlistId,
      this.wishlistRepository
    );
    if (!ownershipResult.ok) {
      return err(ownershipResult.error);
    }

    // 2. Validate ownership (SavedProduct)
    const savedProduct = await this.savedProductRepository.findById(input.savedProductId);
    if (!savedProduct || savedProduct.userId !== input.userId) {
      return err(new SavedProductNotFoundError(input.savedProductId));
    }

    // 3. Avoid duplicate WishlistItems
    const duplicateResult = await WishlistValidators.checkDuplicateItem(
      input.wishlistId,
      input.savedProductId,
      this.wishlistItemRepository
    );

    if (!duplicateResult.ok) {
      // 4. Return existing association if duplicate
      const items = await this.wishlistItemRepository.findByWishlistId(input.wishlistId);
      const existing = items.find(i => i.savedProductId === input.savedProductId);
      if (existing) {
          return ok(existing);
      }
      // This should ideally not happen if checkDuplicateItem failed, but for safety:
      return err(duplicateResult.error);
    }

    // 5. Create WishlistItem
    const item = new WishlistItem({
      wishlistId: input.wishlistId,
      savedProductId: input.savedProductId,
      createdAt: new Date(),
    });

    await this.wishlistItemRepository.add(item);

    // Collect events
    const _events = item.pullDomainEvents();

    return ok(item);
  }
}
