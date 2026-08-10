import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, DELETE } from '../route';
import { auth } from '@wishhub/auth';
import { prisma } from '@wishhub/database';
import { deleteProductService } from '@wishhub/catalog';

vi.mock('@wishhub/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@wishhub/database', () => ({
  prisma: {
    savedProduct: {
      findUnique: vi.fn(),
    },
    catalogProduct: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@wishhub/catalog', () => ({
  deleteProductService: {
    execute: vi.fn(),
  },
}));

describe('Products [id] Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH /api/products/[id]', () => {
    it('should return 401 if no session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      const req = new Request('http://localhost/api/products/prod-1', { method: 'PATCH' });

      const res = await PATCH(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
      expect(res.status).toBe(401);
    });

    it('should return 403 if user does not own the product', async () => {
      const session = { user: { id: 'user-1' } };
      const savedProduct = { id: 'prod-1', userId: 'user-2', catalogProductId: 'catalog-1' };

      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(prisma.savedProduct.findUnique).mockResolvedValue(savedProduct as any);

      const req = new Request('http://localhost/api/products/prod-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'New Name' }),
      });

      const res = await PATCH(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
      expect(res.status).toBe(403);
    });

    it('should update product successfully on owner access', async () => {
      const session = { user: { id: 'user-1' } };
      const savedProduct = { id: 'prod-1', userId: 'user-1', catalogProductId: 'catalog-1' };
      const catalogProduct = { id: 'catalog-1', title: 'Old Name', metadata: { price: 100 } };
      const updatedCatalog = { id: 'catalog-1', title: 'New Name', metadata: { price: 150 } };

      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(prisma.savedProduct.findUnique).mockResolvedValue(savedProduct as any);
      vi.mocked(prisma.catalogProduct.findUnique).mockResolvedValue(catalogProduct as any);
      vi.mocked(prisma.catalogProduct.update).mockResolvedValue(updatedCatalog as any);

      const req = new Request('http://localhost/api/products/prod-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'New Name', price: 150 }),
      });

      const res = await PATCH(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.product).toEqual(updatedCatalog);
      expect(prisma.catalogProduct.update).toHaveBeenCalledWith({
        where: { id: 'catalog-1' },
        data: {
          title: 'New Name',
          metadata: {
            price: 150,
          },
        },
      });
    });
  });

  describe('DELETE /api/products/[id]', () => {
    it('should delete product successfully', async () => {
      const session = { user: { id: 'user-1' } };
      vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
      vi.mocked(deleteProductService.execute).mockResolvedValue({ ok: true, value: true });

      const req = new Request('http://localhost/api/products/prod-1', { method: 'DELETE' });
      const res = await DELETE(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(deleteProductService.execute).toHaveBeenCalledWith('user-1', 'prod-1');
    });
  });
});
