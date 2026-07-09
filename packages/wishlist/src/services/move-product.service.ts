import { Result, ok, err } from '@wishhub/core';
import { DomainError, WishlistNotFoundError } from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistItemRepository } from '../repository/wishlist-item.repository';
import { WishlistValidators } from '../validation';
import { prisma, Prisma } from '@wishhub/database';
import { WishlistItem } from '../domain/models';
import { ProductMovedBetweenWishlists } from '../domain/events';

export interface MoveProductInput {
  userId: string;
  fromWishlistId: string;
  toWishlistId: string;
  savedProductId: string;
}

export class MoveProductService {
  constructor(
    private wishlistRepository: WishlistRepository,
    private wishlistItemRepository: WishlistItemRepository
  ) {}

  async execute(input: MoveProductInput): Promise<Result<void, DomainError>> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Ownership check (From)
      const fromOwnership = await WishlistValidators.checkOwnership(
        input.userId,
        input.fromWishlistId,
        this.wishlistRepository,
        tx
      );
      if (!fromOwnership.ok) return err(fromOwnership.error);

      // 2. Ownership check (To)
      const toOwnership = await WishlistValidators.checkOwnership(
        input.userId,
        input.toWishlistId,
        this.wishlistRepository,
        tx
      );
      if (!toOwnership.ok) return err(toOwnership.error);

      // 3. Prevent duplicates in target
      const duplicateResult = await WishlistValidators.checkDuplicateItem(
        input.toWishlistId,
        input.savedProductId,
        this.wishlistItemRepository,
        tx
      );

      if (!duplicateResult.ok) {
          // If already in target, just remove from source
          await this.wishlistItemRepository.remove(input.fromWishlistId, input.savedProductId, tx);
          return ok(undefined);
      }

      // 4. Remove association
      await this.wishlistItemRepository.remove(input.fromWishlistId, input.savedProductId, tx);

      // 5. Add association
      const newItem = new WishlistItem({
          wishlistId: input.toWishlistId,
          savedProductId: input.savedProductId,
          createdAt: new Date()
      });
      await this.wishlistItemRepository.add(newItem, tx);

      // Collect events
      const fromEvents = (await this.wishlistItemRepository.findByWishlistId(input.fromWishlistId, tx))
          .find(i => i.savedProductId === input.savedProductId);
      if (fromEvents) fromEvents.remove(); // This is a bit hacky because it's already deleted in DB

      // Move event is a special case as it involves two wishlists
      // We'll just use a placeholder here or rely on the add/remove events
      const _events = [
          ...newItem.pullDomainEvents(),
          new ProductMovedBetweenWishlists(input.fromWishlistId, input.toWishlistId, input.savedProductId)
      ];

      return ok(undefined);
    });
  }
}
