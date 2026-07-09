import { Result, ok, err } from '@wishhub/core';
import { Wishlist, WishlistProps } from '../domain/models';
import { DomainError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistValidators } from '../validation';

export interface CreateWishlistInput {
  userId: string;
  name: string;
  isDefault?: boolean;
}

export class CreateWishlistService {
  constructor(private wishlistRepository: WishlistRepository) {}

  async execute(input: CreateWishlistInput): Promise<Result<Wishlist, DomainError>> {
    // 1. Trim whitespace and validate name
    const nameResult = WishlistValidators.validateName(input.name);
    if (!nameResult.ok) {
      return nameResult as any;
    }
    const name = nameResult.value;

    // 2. Check duplicate names (case-insensitive, per-user)
    const duplicateResult = await WishlistValidators.checkDuplicateName(
      input.userId,
      name,
      this.wishlistRepository
    );
    if (!duplicateResult.ok) {
      return err(duplicateResult.error);
    }

    // 3. Enforce max wishlist count (50)
    const limitResult = await WishlistValidators.checkLimit(input.userId, this.wishlistRepository);
    if (!limitResult.ok) {
      return err(limitResult.error);
    }

    // 4. Create first default wishlist automatically
    const count = await this.wishlistRepository.countByUserId(input.userId);
    const isFirst = count === 0;
    const isDefault = isFirst || (input.isDefault ?? false);

    const wishlist = new Wishlist({
      userId: input.userId,
      name,
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. If setting as default, unset others (though if it's first, none exist)
    // Actually, if we are marking this one as default, we should ensure others are not default
    if (isDefault && !isFirst) {
        // We'll use a transaction if we had to unset others, but here we can keep it simple or use one anyway
        // For CreateWishlist, if isDefault is true, we should unset others.
    }

    const savedWishlist = await this.wishlistRepository.save(wishlist);

    if (isDefault) {
        await this.wishlistRepository.unsetOtherDefaults(input.userId, savedWishlist.id);
    }

    // Collect events (optional, for later use)
    const _events = savedWishlist.pullDomainEvents();

    return ok(savedWishlist);
  }
}
