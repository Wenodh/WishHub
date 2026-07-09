import { Result, ok, err } from '@wishhub/core';
import { Wishlist } from '../domain/models';
import { DomainError, WishlistNotFoundError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistValidators } from '../validation';

export interface RenameWishlistInput {
  userId: string;
  wishlistId: string;
  newName: string;
}

export class RenameWishlistService {
  constructor(private wishlistRepository: WishlistRepository) {}

  async execute(input: RenameWishlistInput): Promise<Result<Wishlist, DomainError>> {
    // 1. Ownership check
    const ownershipResult = await WishlistValidators.checkOwnership(
      input.userId,
      input.wishlistId,
      this.wishlistRepository
    );
    if (!ownershipResult.ok) {
      return err(ownershipResult.error);
    }

    // 2. Validate name
    const nameResult = WishlistValidators.validateName(input.newName);
    if (!nameResult.ok) {
      return nameResult as any;
    }
    const newName = nameResult.value;

    // 3. Prevent duplicate names (excluding current wishlist)
    const duplicateResult = await WishlistValidators.checkDuplicateName(
      input.userId,
      newName,
      this.wishlistRepository,
      input.wishlistId
    );
    if (!duplicateResult.ok) {
      return err(duplicateResult.error);
    }

    const wishlist = await this.wishlistRepository.findById(input.wishlistId);
    if (!wishlist) {
      return err(new WishlistNotFoundError(input.wishlistId));
    }

    // 4. Update name and timestamps (preserve default flag)
    wishlist.rename(newName);

    const savedWishlist = await this.wishlistRepository.save(wishlist);

    // Collect events
    const _events = savedWishlist.pullDomainEvents();

    return ok(savedWishlist);
  }
}
