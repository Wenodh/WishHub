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
 * Backwards compatibility for Milestone 1A
 * @deprecated Use ExtractionResult
 */
export const ExtractionDTOSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  url: z.string().url(),
  canonicalUrl: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
  storeName: z.string().optional(),
  rawMetadata: z.record(z.any()).optional(),
  confidence: z.number().min(0).max(1).default(0),
  source: z.string(),
  missingFields: z.array(z.string()).default([]),
});

export type ExtractionDTO = z.infer<typeof ExtractionDTOSchema>;

/**
 * Create Product Request: Input for the POST /api/products endpoint
 */
export const CreateProductRequestSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  imageUrl: z.string().url().optional(), // Primary image
  images: z.array(z.string().url()).optional(), // All extracted images
  price: z.number().optional(),
  currency: z.string().optional(),
  storeName: z.string().optional(),
  description: z.string().optional(),
  rawMetadata: z.record(z.any()).optional(),
  metadataVersion: z.number().int().default(1),
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

/**
 * Product Response: Canonical product DTO
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
  createdAt: z.string(), // ISO String
  updatedAt: z.string(), // ISO String
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

/**
 * Create Product Response
 */
export const CreateProductResponseSchema = z.object({
  product: ProductResponseSchema,
  duplicate: z.boolean().optional(),
});

export type CreateProductResponse = z.infer<typeof CreateProductResponseSchema>;

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Delete Product Response
 */
export const DeleteProductResponseSchema = z.object({
  success: z.boolean(),
});

export type DeleteProductResponse = z.infer<typeof DeleteProductResponseSchema>;

/**
 * List Products Response (Paginated)
 */
export const ProductListResponseSchema = z.object({
  products: z.array(ProductResponseSchema),
  nextCursor: z.string().optional(),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

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
