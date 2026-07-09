import { Result, ok, err } from '@wishhub/core';
import {
  DuplicateWishlistNameError,
  WishlistLimitExceededError,
  UnauthorizedWishlistAccessError,
  DuplicateWishlistItemError,
  InvalidWishlistNameError,
  DomainError
} from '../domain/errors';
import { WishlistRepository } from '../repository/wishlist.repository';
import { WishlistItemRepository } from '../repository/wishlist-item.repository';
import { Prisma } from '@wishhub/database';

export class WishlistValidators {
  static validateName(name: string): Result<string, InvalidWishlistNameError> {
    const trimmed = name.trim().replace(/\s+/g, ' ');

    if (trimmed.length < 1) {
      return err(new InvalidWishlistNameError('Wishlist name cannot be empty'));
    }

    if (trimmed.length > 50) {
      return err(new InvalidWishlistNameError('Wishlist name cannot exceed 50 characters'));
    }

    // Check for control characters
    if (/[\u0000-\u001F\u007F-\u009F]/.test(trimmed)) {
        return err(new InvalidWishlistNameError('Wishlist name contains invalid characters'));
    }

    return ok(trimmed);
  }

  static async checkDuplicateName(
    userId: string,
    name: string,
    wishlistRepository: WishlistRepository,
    excludeId?: string,
    tx?: Prisma.TransactionClient
  ): Promise<Result<void, DuplicateWishlistNameError>> {
    const wishlists = await wishlistRepository.findByUserId(userId, tx);
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, ' ');

    const exists = wishlists.some(w =>
        w.id !== excludeId &&
        w.name.trim().toLowerCase().replace(/\s+/g, ' ') === normalizedName
    );

    if (exists) {
      return err(new DuplicateWishlistNameError(name));
    }

    return ok(undefined);
  }

  static async checkLimit(
    userId: string,
    wishlistRepository: WishlistRepository,
    tx?: Prisma.TransactionClient
  ): Promise<Result<void, WishlistLimitExceededError>> {
    const count = await wishlistRepository.countByUserId(userId, tx);
    const MAX_WISHLISTS = 50;

    if (count >= MAX_WISHLISTS) {
      return err(new WishlistLimitExceededError(MAX_WISHLISTS));
    }

    return ok(undefined);
  }

  static async checkOwnership(
    userId: string,
    wishlistId: string,
    wishlistRepository: WishlistRepository,
    tx?: Prisma.TransactionClient
  ): Promise<Result<void, UnauthorizedWishlistAccessError>> {
    const wishlist = await wishlistRepository.findById(wishlistId, tx);

    if (!wishlist || wishlist.userId !== userId) {
      return err(new UnauthorizedWishlistAccessError(wishlistId, userId));
    }

    return ok(undefined);
  }

  static async checkDuplicateItem(
    wishlistId: string,
    savedProductId: string,
    wishlistItemRepository: WishlistItemRepository,
    tx?: Prisma.TransactionClient
  ): Promise<Result<void, DuplicateWishlistItemError>> {
    const exists = await wishlistItemRepository.exists(wishlistId, savedProductId, tx);

    if (exists) {
      return err(new DuplicateWishlistItemError(wishlistId, savedProductId));
    }

    return ok(undefined);
  }
}
