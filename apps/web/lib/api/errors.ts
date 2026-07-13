import { DomainError } from '@wishhub/wishlist';
import { ApiResponse } from './responses';

export function mapDomainError(error: DomainError) {
  const code = error.code || 'DOMAIN_ERROR';
  const message = error.message;

  switch (error.constructor.name) {
    case 'WishlistNotFoundError':
    case 'SavedProductNotFoundError':
      return ApiResponse.notFound(message);

    case 'DuplicateWishlistNameError':
    case 'DuplicateWishlistItemError':
      return ApiResponse.conflict(message, code);

    case 'WishlistLimitExceededError':
      return ApiResponse.unprocessable(message, code);

    case 'UnauthorizedWishlistAccessError':
      return ApiResponse.forbidden(message);

    case 'InvalidWishlistNameError':
    case 'CannotDeleteOnlyWishlistError':
    case 'CannotDeleteDefaultWishlistError':
      return ApiResponse.badRequest(message, code);

    default:
      return ApiResponse.internalServerError(message);
  }
}
