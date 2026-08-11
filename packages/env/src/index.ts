import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(1).refine((val) => {
      if (process.env.NODE_ENV === "production") {
        // Enforce high-entropy minimum length of 32 characters in production to fail fast
        return val.length >= 32;
      }
      return true;
    }, {
      message: "BETTER_AUTH_SECRET must be at least 32 characters long in production mode.",
    }),
    BETTER_AUTH_URL: z.string().url(),
    STORAGE_BUCKET: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().email().optional(),
    FCM_PROJECT_ID: z.string().min(1).optional(),
    FCM_CLIENT_EMAIL: z.string().email().optional(),
    FCM_PRIVATE_KEY: z.string().min(1).optional(),
    SENTRY_DSN: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    FEATURE_AI: z
      .string()
      .transform((v) => v === "true")
      .default("false"),
    FEATURE_PRICE_TRACKING: z
      .string()
      .transform((v) => v === "true")
      .default("false"),
    FEATURE_NOTIFICATIONS: z
      .string()
      .transform((v) => v === "true")
      .default("false"),
    FEATURE_PUBLIC_WISHLISTS: z
      .string()
      .transform((v) => v === "true")
      .default("false"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_APP_NAME: z.string().default("WishHub"),
    NEXT_PUBLIC_EXTENSION_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    FCM_PROJECT_ID: process.env.FCM_PROJECT_ID,
    FCM_CLIENT_EMAIL: process.env.FCM_CLIENT_EMAIL,
    FCM_PRIVATE_KEY: process.env.FCM_PRIVATE_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
    FEATURE_AI: process.env.FEATURE_AI,
    FEATURE_PRICE_TRACKING: process.env.FEATURE_PRICE_TRACKING,
    FEATURE_NOTIFICATIONS: process.env.FEATURE_NOTIFICATIONS,
    FEATURE_PUBLIC_WISHLISTS: process.env.FEATURE_PUBLIC_WISHLISTS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_EXTENSION_ID: process.env.NEXT_PUBLIC_EXTENSION_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
