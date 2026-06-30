import { z } from 'zod';

/**
 * Extraction DTO: Output of the scraper
 */
export const ExtractionSchema = z.object({
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
  source: z.string().optional(),
});

export type ExtractionDTO = z.infer<typeof ExtractionSchema>;

/**
 * Create Product DTO: Input for the API
 */
export const CreateProductSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  storeName: z.string().optional(),
  description: z.string().optional(),
  rawMetadata: z.record(z.any()).optional(),
  metadataVersion: z.number().default(1),
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

/**
 * Product Response DTO: Output of the API
 */
export const ProductResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  canonicalUrl: z.string(),
  imageUrl: z.string().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    type: z.string().optional(),
  })).default([]),
  price: z.number().optional(),
  currency: z.string().optional(),
  storeName: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string(), // ISO Date
  updatedAt: z.string(), // ISO Date
});

export type ProductResponseDTO = z.infer<typeof ProductResponseSchema>;

/**
 * Pagination DTO
 */
export const PaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export type PaginationDTO = z.infer<typeof PaginationSchema>;
