import { DomainError } from '@wishhub/wishlist';
import { ApiResponse } from './responses';

export function mapDomainError(error: DomainError) {
  const code = error.code || 'DOMAIN_ERROR';
  const message = error.message;

  switch (code) {
    case 'WISHLIST_NOT_FOUND':
    case 'SAVED_PRODUCT_NOT_FOUND':
      return ApiResponse.notFound(message);

    case 'DUPLICATE_WISHLIST_NAME':
    case 'DUPLICATE_WISHLIST_ITEM':
      return ApiResponse.conflict(message, code);

    case 'WISHLIST_LIMIT_EXCEEDED':
      return ApiResponse.unprocessable(message, code);

    case 'UNAUTHORIZED_WISHLIST_ACCESS':
      return ApiResponse.forbidden(message);

    case 'INVALID_WISHLIST_NAME':
    case 'CANNOT_DELETE_ONLY_WISHLIST':
    case 'CANNOT_DELETE_DEFAULT_WISHLIST':
      return ApiResponse.badRequest(message, code);

    default:
      return ApiResponse.internalServerError(message);
  }
}
