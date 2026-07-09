import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '../route';
import { auth } from '@wishhub/auth';
import { wishlistServiceFactory } from '@/lib/services/wishlist';
import { ok, err } from '@wishhub/core';
import { NextRequest } from 'next/server';

vi.mock('@wishhub/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/wishlist', () => ({
  wishlistServiceFactory: {
    wishlistRepository: vi.fn(),
    setDefaultWishlist: vi.fn(),
  },
}));

describe('Default Wishlist API', () => {
  const session = { user: { id: 'user-1' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wishlists/default', () => {
    it('should return default wishlist', async () => {
      const wishlist = {
        id: '1',
        userId: 'user-1',
        name: 'Default',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.wishlistRepository).mockReturnValue({
        findDefault: vi.fn().mockResolvedValue(wishlist),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists/default');
      const res = await GET(req, { params: {}, session: session as any } as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.id).toBe('1');
    });

    it('should return 404 if no default wishlist found', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.wishlistRepository).mockReturnValue({
        findDefault: vi.fn().mockResolvedValue(null),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists/default');
      const res = await GET(req, { params: {}, session: session as any } as any);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/wishlists/default', () => {
    it('should set default wishlist', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.setDefaultWishlist).mockReturnValue({
        execute: vi.fn().mockResolvedValue(ok(undefined)),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists/default', {
        method: 'PATCH',
        body: JSON.stringify({ wishlistId: '1' }),
      });
      const res = await PATCH(req, { params: {}, session: session as any } as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 400 if wishlistId is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      const req = new NextRequest('http://localhost/api/wishlists/default', {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      const res = await PATCH(req, { params: {}, session: session as any } as any);
      expect(res.status).toBe(400);
    });
  });
});
