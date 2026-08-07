import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRateLimiter } from './lib/api/rate-limiter';

function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/auth')) {
    const limit = Number(process.env.RATE_LIMIT_AUTH_MAX) || 20;
    const windowMs = Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 60000;
    return { limit, windowMs, category: 'auth' };
  }

  if (
    pathname.startsWith('/api/ai') ||
    pathname.includes('/regenerate') ||
    pathname.includes('/insights')
  ) {
    const limit = Number(process.env.RATE_LIMIT_AI_MAX) || 10;
    const windowMs = Number(process.env.RATE_LIMIT_AI_WINDOW_MS) || 60000;
    return { limit, windowMs, category: 'ai' };
  }

  if (pathname.startsWith('/api/products') || pathname.startsWith('/api/wishlists')) {
    const limit = Number(process.env.RATE_LIMIT_EXTENSION_MAX) || 60;
    const windowMs = Number(process.env.RATE_LIMIT_EXTENSION_WINDOW_MS) || 60000;
    return { limit, windowMs, category: 'extension' };
  }

  // Fallback public APIs
  const limit = Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 100;
  const windowMs = Number(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS) || 60000;
  return { limit, windowMs, category: 'public' };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Get IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Get config
  const { limit, windowMs, category } = getRateLimitConfig(pathname);
  const key = `rate_limit:${category}:${ip}`;

  const limiter = getRateLimiter();
  const result = await limiter.limit(key, limit, windowMs);

  const responseHeaders = new Headers();
  responseHeaders.set('X-RateLimit-Limit', result.limit.toString());
  responseHeaders.set('X-RateLimit-Remaining', result.remaining.toString());
  responseHeaders.set('X-RateLimit-Reset', result.reset.toString());

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    responseHeaders.set('Retry-After', retryAfter.toString());

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again later.',
        },
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(responseHeaders.entries()),
        },
      }
    );
  }

  // Continue request, append headers to response
  const response = NextResponse.next();
  for (const [k, v] of responseHeaders.entries()) {
    response.headers.set(k, v);
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
