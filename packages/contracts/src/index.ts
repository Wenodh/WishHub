import { z } from 'zod';

/**
 * Extraction Result: Output of the scraper logic
 */
export const ExtractionResultSchema = z.object({
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
  source: z.enum(['json-ld', 'opengraph', 'twitter', 'meta', 'manual', 'amazon']),
  missingFields: z.array(z.string()).default([]),
});

export type ExtractionDTO = z.infer<typeof ExtractionResultSchema>;

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

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
