export abstract class DomainError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateWishlistNameError extends DomainError {
  public readonly code = 'DUPLICATE_WISHLIST_NAME';
  constructor(name: string) {
    super(`Wishlist with name "${name}" already exists`);
  }
}

export class WishlistLimitExceededError extends DomainError {
  public readonly code = 'WISHLIST_LIMIT_EXCEEDED';
  constructor(limit: number) {
    super(`Wishlist limit of ${limit} exceeded`);
  }
}

export class CannotDeleteOnlyWishlistError extends DomainError {
  public readonly code = 'CANNOT_DELETE_ONLY_WISHLIST';
  constructor() {
    super('Cannot delete the only wishlist');
  }
}

export class CannotDeleteDefaultWishlistError extends DomainError {
  public readonly code = 'CANNOT_DELETE_DEFAULT_WISHLIST';
  constructor() {
    super('Cannot delete default wishlist without a replacement');
  }
}

export class WishlistNotFoundError extends DomainError {
  public readonly code = 'WISHLIST_NOT_FOUND';
  constructor(id: string) {
    super(`Wishlist with ID "${id}" not found`);
  }
}

export class DuplicateWishlistItemError extends DomainError {
  public readonly code = 'DUPLICATE_WISHLIST_ITEM';
  constructor(wishlistId: string, savedProductId: string) {
    super(`Product "${savedProductId}" is already in wishlist "${wishlistId}"`);
  }
}

export class InvalidWishlistNameError extends DomainError {
  public readonly code = 'INVALID_WISHLIST_NAME';
  constructor(reason: string) {
    super(`Invalid wishlist name: ${reason}`);
  }
}

export class UnauthorizedWishlistAccessError extends DomainError {
  public readonly code = 'UNAUTHORIZED_WISHLIST_ACCESS';
  constructor(wishlistId: string, userId: string) {
    super(`User "${userId}" is not authorized to access wishlist "${wishlistId}"`);
  }
}

export class SavedProductNotFoundError extends DomainError {
  public readonly code = 'SAVED_PRODUCT_NOT_FOUND';
  constructor(id: string) {
    super(`Saved product with ID "${id}" not found`);
  }
}
