import { createNeonAuth } from "@neondatabase/auth/next/server";

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
      return data;
    }
  }
};
export type AuthType = typeof auth;
