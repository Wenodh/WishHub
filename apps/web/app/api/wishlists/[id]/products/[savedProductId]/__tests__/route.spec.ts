import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '../route';
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
    removeProductFromWishlist: vi.fn(),
  },
}));

describe('Remove Product from Wishlist API', () => {
  const session = { user: { id: 'user-1' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DELETE /api/wishlists/[id]/products/[savedProductId]', () => {
    it('should return 204 on success', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(wishlistServiceFactory.removeProductFromWishlist).mockReturnValue({
        execute: vi.fn().mockResolvedValue(ok(undefined)),
      } as any);

      const req = new NextRequest('http://localhost/api/wishlists/1/products/prod-1', {
        method: 'DELETE',
      });
      const res = await DELETE(req, { params: Promise.resolve({ id: '1', savedProductId: 'prod-1' }), session: session as any } as any);

      expect(res.status).toBe(204);
    });
  });
});
