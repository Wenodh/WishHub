import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, DELETE } from '../route';
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
    renameWishlist: vi.fn(),
    deleteWishlist: vi.fn(),
  },
}));

describe('Wishlist Detail API', () => {
  const session = { user: { id: 'user-1' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH /api/wishlists/[id]', () => {
    it('should return 200 on success', async () => {
      const wishlist = {
        id: '1',
        userId: 'user-1',
        name: 'Updated Name',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.renameWishlist).mockReturnValue({
        execute: vi.fn().mockResolvedValue(ok(wishlist)),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: '1' }), session: session as any } as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/wishlists/[id]', () => {
    it('should return 204 on success', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.deleteWishlist).mockReturnValue({
        execute: vi.fn().mockResolvedValue(ok(undefined)),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists/1', {
        method: 'DELETE',
      });
      const res = await DELETE(req, { params: Promise.resolve({ id: '1' }), session: session as any } as any);

      expect(res.status).toBe(204);
    });
  });
});
