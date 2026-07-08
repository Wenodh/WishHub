import { z } from 'zod';

export const CatalogProductDtoSchema = z.object({
  id: z.string(),
  store: z.string(),
  externalId: z.string().optional().nullable(),
  canonicalUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  images: z.array(z.string().url()),
  category: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.any()),
});

export const SavedProductDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  catalogProductId: z.string(),
  originalUrl: z.string().url(),
  addedAt: z.string(), // ISO string
  archivedAt: z.string().optional().nullable(),
});

export const WishlistDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(50),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WishlistItemDtoSchema = z.object({
  wishlistId: z.string(),
  savedProductId: z.string(),
  createdAt: z.string(),
});

export const CreateWishlistRequestSchema = z.object({
  name: z.string().min(1).max(50),
  isDefault: z.boolean().optional().default(false),
});

export const RenameWishlistRequestSchema = z.object({
  name: z.string().min(1).max(50),
});

export const SetDefaultWishlistRequestSchema = z.object({
  wishlistId: z.string(),
});

export const MoveProductRequestSchema = z.object({
  savedProductId: z.string(),
  fromWishlistId: z.string(),
  toWishlistId: z.string(),
});

export const WishlistSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  itemCount: z.number().int().min(0),
});

export const WishlistDetailSchema = WishlistDtoSchema.extend({
    // We'll add more detail here in Phase 3
});

export const WishlistWithProductsSchema = WishlistDtoSchema.extend({
  products: z.array(z.any()), // Placeholder until product DTO is fully settled
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});
