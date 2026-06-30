import { z } from "zod";

export const CreateProductSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  imageUrl: z.string().url().optional(),
  storeName: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const CreateWishlistSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type CreateWishlistInput = z.infer<typeof CreateWishlistSchema>;
