import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
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
    listWishlists: vi.fn(),
    createWishlist: vi.fn(),
  },
}));

describe('Wishlists API', () => {
  const session = { user: { id: 'user-1' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wishlists', () => {
    it('should return 401 if no session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/wishlists');

      const res = await GET(req, { params: {} });
      expect(res.status).toBe(401);
    });

    it('should return 200 and wishlists on success', async () => {
      const wishlists = [{ id: '1', name: 'My Wishlist', isDefault: true, itemCount: 0 }];
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.listWishlists).mockReturnValue({
        execute: vi.fn().mockResolvedValue(ok(wishlists)),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists');
      const res = await GET(req, { params: {} });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.wishlists).toEqual(wishlists);
    });
  });

  describe('POST /api/wishlists', () => {
    it('should return 201 and new wishlist on success', async () => {
      const wishlist = {
        id: '1',
        userId: 'user-1',
        name: 'New Wishlist',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        pullDomainEvents: vi.fn().mockReturnValue([])
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.createWishlist).mockReturnValue({
        execute: vi.fn().mockResolvedValue(ok(wishlist)),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Wishlist' }),
      });
      const res = await POST(req, { params: {} });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Wishlist');
    });

    it('should return 400 if validation fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      const req = new NextRequest('http://localhost/api/wishlists', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });
      const res = await POST(req, { params: {} });
      expect(res.status).toBe(400);
    });
  });
});
