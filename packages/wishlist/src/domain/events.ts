import { DomainEvent } from '@wishhub/core';

export class WishlistCreated implements DomainEvent {
  constructor(
    public readonly wishlistId: string,
    public readonly userId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}

export class WishlistRenamed implements DomainEvent {
  constructor(
    public readonly wishlistId: string,
    public readonly oldName: string,
    public readonly newName: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}

export class WishlistDeleted implements DomainEvent {
  constructor(
    public readonly wishlistId: string,
    public readonly userId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}

export class WishlistSetAsDefault implements DomainEvent {
  constructor(
    public readonly wishlistId: string,
    public readonly userId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}

export class ProductAddedToWishlist implements DomainEvent {
  constructor(
    public readonly wishlistId: string,
    public readonly savedProductId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}

export class ProductRemovedFromWishlist implements DomainEvent {
  constructor(
    public readonly wishlistId: string,
    public readonly savedProductId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}

export class ProductMovedBetweenWishlists implements DomainEvent {
  constructor(
    public readonly fromWishlistId: string,
    public readonly toWishlistId: string,
    public readonly savedProductId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}
