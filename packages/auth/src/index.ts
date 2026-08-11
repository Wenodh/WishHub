import { createNeonAuth } from "@neondatabase/auth/next/server";
import { prisma } from "@wishhub/database";

const neonAuth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || "http://localhost:3000",
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "default_secret_that_is_long_enough_for_hmac_32_chars",
  },
});

export const auth = {
  ...neonAuth,
  api: {
    getSession: async (options?: { headers?: Headers }) => {
      const { data, error } = await neonAuth.getSession();
      if (error || !data) return null;

      // Centralized, robust user synchronization from Neon Auth identity to public schema User table
      try {
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: {
            email: data.user.email,
            name: data.user.name,
            image: data.user.image,
          },
          create: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.image,
          },
        });
      } catch (err) {
        // Log synchronization error but do not block the active request
        console.error("Error synchronizing Neon Auth user to application User model:", err);
      }

      return data;
    }
  }
};
export type AuthType = typeof auth;
