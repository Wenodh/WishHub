export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in milliseconds when reset occurs
}

export interface RateLimiter {
  limit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

export class MemoryRateLimiter implements RateLimiter {
  private cache = new Map<string, { count: number; resetAt: number }>();

  async limit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Garbage collect expired entries periodically or on write
    if (this.cache.size > 1000) {
      for (const [k, v] of this.cache.entries()) {
        if (now >= v.resetAt) {
          this.cache.delete(k);
        }
      }
    }

    if (!cached || now >= cached.resetAt) {
      const resetAt = now + windowMs;
      this.cache.set(key, { count: 1, resetAt });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: resetAt,
      };
    }

    if (cached.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: cached.resetAt,
      };
    }

    cached.count += 1;
    return {
      success: true,
      limit,
      remaining: limit - cached.count,
      reset: cached.resetAt,
    };
  }
}

// Global singleton instance for in-memory rate limiting
let globalRateLimiter: RateLimiter;

export function getRateLimiter(): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new MemoryRateLimiter();
  }
  return globalRateLimiter;
}
