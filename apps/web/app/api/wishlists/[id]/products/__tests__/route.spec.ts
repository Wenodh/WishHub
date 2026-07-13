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
    listWishlistProducts: vi.fn(),
    addProductToWishlist: vi.fn(),
  },
}));

describe('Wishlist Products API', () => {
  const session = { user: { id: 'user-1' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wishlists/[id]/products', () => {
    it('should return products with pagination', async () => {
      const response = {
        wishlist: { id: '1', userId: 'user-1', name: 'Wishlist', isDefault: true, createdAt: new Date(), updatedAt: new Date() },
        products: [],
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.listWishlistProducts).mockReturnValue({
        execute: vi.fn().mockResolvedValue(ok(response)),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists/1/products');
      const res = await GET(req, { params: Promise.resolve({ id: '1' }), session: session as any } as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.pagination.page).toBe(1);
    });

    it('should return 400 for invalid pagination', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      const req = new NextRequest('http://localhost/api/wishlists/1/products?page=0');
      const res = await GET(req, { params: Promise.resolve({ id: '1' }), session: session as any } as any);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/wishlists/[id]/products', () => {
    it('should return 201 on success', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.addProductToWishlist).mockReturnValue({
        execute: vi.fn().mockResolvedValue(ok(undefined)),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists/1/products', {
        method: 'POST',
        body: JSON.stringify({ savedProductId: 'prod-1' }),
      });
      const res = await POST(req, { params: Promise.resolve({ id: '1' }), session: session as any } as any);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });
});
