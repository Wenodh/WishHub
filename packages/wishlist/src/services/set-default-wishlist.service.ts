import { Result, ok, err } from '@wishhub/core';
import { DomainError, WishlistNotFoundError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistValidators } from '../validation';
import { prisma, Prisma } from '@wishhub/database';

export interface SetDefaultWishlistInput {
  userId: string;
  wishlistId: string;
}

export class SetDefaultWishlistService {
  constructor(private wishlistRepository: WishlistRepository) {}

  async execute(input: SetDefaultWishlistInput): Promise<Result<void, DomainError>> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Ensure target belongs to user
      const ownershipResult = await WishlistValidators.checkOwnership(
        input.userId,
        input.wishlistId,
        this.wishlistRepository,
        tx
      );
      if (!ownershipResult.ok) {
        return err(ownershipResult.error);
      }

      const wishlist = await this.wishlistRepository.findById(input.wishlistId, tx);
      if (!wishlist) {
        return err(new WishlistNotFoundError(input.wishlistId));
      }

      // 2. Set new default
      wishlist.makeDefault();
      await this.wishlistRepository.save(wishlist, tx);

      // 3. Remove previous default
      await this.wishlistRepository.unsetOtherDefaults(input.userId, wishlist.id, tx);

      // Collect events
      const _events = wishlist.pullDomainEvents();

      return ok(undefined);
    });
  }
}
