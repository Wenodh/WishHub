import { BaseEntity } from '@wishhub/core';
import {
  WishlistCreated,
  WishlistRenamed,
  WishlistSetAsDefault,
  ProductAddedToWishlist,
  ProductRemovedFromWishlist
} from './events';

export interface CatalogProductProps {
  store: string;
  externalId?: string | null;
  canonicalUrl: string;
  title: string;
  description?: string | null;
  brand?: string | null;
  images: string[];
  category?: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class CatalogProduct extends BaseEntity<CatalogProductProps> {
  constructor(props: CatalogProductProps, id?: string) {
    super(props, id);
  }

  get store() { return this.props.store; }
  get externalId() { return this.props.externalId; }
  get canonicalUrl() { return this.props.canonicalUrl; }
  get title() { return this.props.title; }
  get description() { return this.props.description; }
  get brand() { return this.props.brand; }
  get images() { return this.props.images; }
  get category() { return this.props.category; }
  get metadata() { return this.props.metadata; }
}

export interface SavedProductProps {
  userId: string;
  catalogProductId: string;
  originalUrl: string;
  addedAt: Date;
  archivedAt?: Date | null;
}

export class SavedProduct extends BaseEntity<SavedProductProps> {
  constructor(props: SavedProductProps, id?: string) {
    super(props, id);
  }

  get userId() { return this.props.userId; }
  get catalogProductId() { return this.props.catalogProductId; }
  get originalUrl() { return this.props.originalUrl; }
  get addedAt() { return this.props.addedAt; }
  get archivedAt() { return this.props.archivedAt; }

  isArchived() {
    return !!this.props.archivedAt;
  }
}

export interface WishlistProps {
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Wishlist extends BaseEntity<WishlistProps> {
  constructor(props: WishlistProps, id?: string) {
    super(props, id);
    if (!id) {
        this.addDomainEvent(new WishlistCreated(this.id, props.userId));
    }
  }

  get userId() { return this.props.userId; }
  get name() { return this.props.name; }
  get isDefault() { return this.props.isDefault; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  rename(newName: string) {
    const oldName = this.props.name;
    this.props.name = newName.trim();
    this.props.updatedAt = new Date();
    this.addDomainEvent(new WishlistRenamed(this.id, oldName, this.props.name));
  }

  makeDefault() {
    if (!this.props.isDefault) {
        this.props.isDefault = true;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new WishlistSetAsDefault(this.id, this.props.userId));
    }
  }
}

export interface WishlistItemProps {
  wishlistId: string;
  savedProductId: string;
  createdAt: Date;
}

export class WishlistItem extends BaseEntity<WishlistItemProps> {
  constructor(props: WishlistItemProps, id?: string) {
    super(props, id);
    if (!id) {
        this.addDomainEvent(new ProductAddedToWishlist(props.wishlistId, props.savedProductId));
    }
  }

  get wishlistId() { return this.props.wishlistId; }
  get savedProductId() { return this.props.savedProductId; }
  get createdAt() { return this.props.createdAt; }

  remove() {
    this.addDomainEvent(new ProductRemovedFromWishlist(this.wishlistId, this.savedProductId));
  }
}
