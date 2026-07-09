import { Result, ok, err } from '@wishhub/core';
import { DomainError, WishlistNotFoundError, CannotDeleteOnlyWishlistError, CannotDeleteDefaultWishlistError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistItemRepository } from '../repository/wishlist-item.repository';
import { WishlistValidators } from '../validation';
import { prisma, Prisma } from '@wishhub/database';
import { WishlistDeleted } from '../domain/events';

export interface DeleteWishlistInput {
  userId: string;
  wishlistId: string;
  replacementWishlistId?: string;
}

export class DeleteWishlistService {
  constructor(
    private wishlistRepository: WishlistRepository,
    private wishlistItemRepository: WishlistItemRepository
  ) {}

  async execute(input: DeleteWishlistInput): Promise<Result<void, DomainError>> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Ownership check
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

      // 2. Prevent deleting the only wishlist
      const count = await this.wishlistRepository.countByUserId(input.userId, tx);
      if (count <= 1) {
        return err(new CannotDeleteOnlyWishlistError());
      }

      // 3. Handle default wishlist deletion
      if (wishlist.isDefault) {
        if (!input.replacementWishlistId) {
          return err(new CannotDeleteDefaultWishlistError());
        }

        // Ownership check for replacement
        const replacementOwnershipResult = await WishlistValidators.checkOwnership(
          input.userId,
          input.replacementWishlistId,
          this.wishlistRepository,
          tx
        );
        if (!replacementOwnershipResult.ok) {
          return err(replacementOwnershipResult.error);
        }

        const replacement = await this.wishlistRepository.findById(input.replacementWishlistId, tx);
        if (!replacement) {
          return err(new WishlistNotFoundError(input.replacementWishlistId));
        }

        // Promote replacement
        replacement.makeDefault();
        await this.wishlistRepository.save(replacement, tx);
        await this.wishlistRepository.unsetOtherDefaults(input.userId, replacement.id, tx);
      }

      // 4. Remove WishlistItems only (Preserve SavedProducts)
      await this.wishlistItemRepository.removeAllByWishlistId(input.wishlistId, tx);

      // 5. Delete original
      await this.wishlistRepository.delete(input.wishlistId, tx);

      // Collect events
      const _events = [
          ...wishlist.pullDomainEvents(),
          new WishlistDeleted(wishlist.id, wishlist.userId)
      ];

      return ok(undefined);
    });
  }
}
