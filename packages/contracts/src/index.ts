import { z } from 'zod';

/**
 * Extraction Product: Standardized product data extracted from a page
 */
export const ExtractionProductSchema = z.object({
  title: z.string().min(1),
  brand: z.string().optional(),
  store: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  originalUrl: z.string().url(),
  images: z.array(z.string().url()).default([]),
  price: z.number().optional(),
  currency: z.string().optional(),
  availability: z.enum(['in-stock', 'out-of-stock', 'pre-order', 'unknown']).default('unknown'),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  category: z.string().optional(),
  breadcrumbs: z.array(z.string()).default([]),
  asin: z.string().optional(),
  description: z.string().optional(),
  rawMetadata: z.record(z.any()).optional(),
});

export type ExtractionProduct = z.infer<typeof ExtractionProductSchema>;

/**
 * Extraction Result: Output of the scraper logic
 */
export const ExtractionResultSchema = z.object({
  product: ExtractionProductSchema,
  confidence: z.number().min(0).max(1).default(0),
  extractionSource: z.array(z.string()).default([]),
  missingFields: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

/**
 * Catalog Product: Global product data
 */
export const CatalogProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  canonicalUrl: z.string(),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  storeName: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  images: z.array(z.object({
    url: z.string().url(),
    type: z.string().optional().nullable(),
  })),
});

export type CatalogProduct = z.infer<typeof CatalogProductSchema>;

/**
 * Saved Product: User-specific product reference
 */
export const SavedProductSchema = z.object({
  id: z.string(),
  userId: z.string(),
  catalogProductId: z.string(),
  catalogProduct: CatalogProductSchema,
  notes: z.string().optional().nullable(),
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SavedProduct = z.infer<typeof SavedProductSchema>;

/**
 * Wishlist Summary: Lightweight wishlist DTO
 */
export const WishlistSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  itemCount: z.number().int(),
  updatedAt: z.string(),
});

export type WishlistSummary = z.infer<typeof WishlistSummarySchema>;

/**
 * Wishlist Detail: Wishlist with all items
 */
export const WishlistDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  items: z.array(z.object({
    id: z.string(),
    addedAt: z.string(),
    savedProduct: SavedProductSchema,
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type WishlistDetail = z.infer<typeof WishlistDetailSchema>;

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
    limit: z.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Create Wishlist Request
 */
export const CreateWishlistRequestSchema = z.object({
  name: z.string().min(1).max(50),
  isDefault: z.boolean().optional(),
});

export type CreateWishlistRequest = z.infer<typeof CreateWishlistRequestSchema>;

/**
 * Update Wishlist Request
 */
export const UpdateWishlistRequestSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateWishlistRequest = z.infer<typeof UpdateWishlistRequestSchema>;

/**
 * Add Product to Wishlist Request
 */
export const AddProductRequestSchema = z.object({
  extraction: ExtractionProductSchema,
  wishlistId: z.string().optional(), // If not provided, save to default/last used
});

export type AddProductRequest = z.infer<typeof AddProductRequestSchema>;

/**
 * Legacy Create Product Request (Backwards compatibility)
 */
export const CreateProductRequestSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  storeName: z.string().optional(),
  description: z.string().optional(),
  rawMetadata: z.record(z.any()).optional(),
  metadataVersion: z.number().int().default(1),
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

/**
 * Product Response (Legacy fallback)
 */
export const ProductResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  canonicalUrl: z.string(),
  images: z.array(z.object({
    url: z.string().url(),
    type: z.string().optional(),
  })),
  price: z.number().optional(),
  currency: z.string().optional(),
  storeName: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

/**
 * Create Product Response
 */
export const CreateProductResponseSchema = z.object({
  product: SavedProductSchema.or(ProductResponseSchema),
  duplicate: z.boolean().optional(),
});

export type CreateProductResponse = z.infer<typeof CreateProductResponseSchema>;

/**
 * List Products Response
 */
export const ProductListResponseSchema = z.object({
  products: z.array(SavedProductSchema.or(ProductResponseSchema)),
  nextCursor: z.string().optional(),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

/**
 * Delete Response
 */
export const DeleteResponseSchema = z.object({
  success: z.boolean(),
});

export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;

/**
 * Validation Error Response
 */
export const ValidationErrorResponseSchema = z.object({
  error: z.literal('Validation Failed'),
  issues: z.array(z.object({
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
  })),
});

export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponseSchema>;

/**
 * Generic API Error Response
 */
export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
