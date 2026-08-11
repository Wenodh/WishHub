import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { auth } from '@wishhub/auth';
import { prisma } from '@wishhub/database';

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
    productInsight: {
      findFirst: vi.fn(),
    },
    productTag: {
      findMany: vi.fn(),
    },
    aIJob: {
      findFirst: vi.fn(),
    },
  },
}));

describe('GET /api/products/[id]/insights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const req = new Request('http://localhost/api/products/prod-1/insights');

    const res = await GET(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
    expect(res.status).toBe(401);
  });

  it('should return 404 if product not found or belongs to another user', async () => {
    const session = { user: { id: 'user-1' } };
    vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
    vi.mocked(prisma.savedProduct.findUnique).mockResolvedValue(null);

    const req = new Request('http://localhost/api/products/prod-1/insights');
    const res = await GET(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
    expect(res.status).toBe(404);
  });

  it('should return status pending or generating if no insight exists yet', async () => {
    const session = { user: { id: 'user-1' } };
    const savedProduct = { id: 'prod-1', userId: 'user-1', catalogProductId: 'catalog-1' };
    const aiJob = { status: 'PENDING' };

    vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
    vi.mocked(prisma.savedProduct.findUnique).mockResolvedValue(savedProduct as any);
    vi.mocked(prisma.productInsight.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.productTag.findMany).mockResolvedValue([]);
    vi.mocked(prisma.aIJob.findFirst).mockResolvedValue(aiJob as any);

    const req = new Request('http://localhost/api/products/prod-1/insights');
    const res = await GET(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('pending');
    expect(data.data.insight).toBeNull();
  });

  it('should return status failed if job failed and no insight exists', async () => {
    const session = { user: { id: 'user-1' } };
    const savedProduct = { id: 'prod-1', userId: 'user-1', catalogProductId: 'catalog-1' };
    const aiJob = { status: 'FAILED' };

    vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
    vi.mocked(prisma.savedProduct.findUnique).mockResolvedValue(savedProduct as any);
    vi.mocked(prisma.productInsight.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.productTag.findMany).mockResolvedValue([]);
    vi.mocked(prisma.aIJob.findFirst).mockResolvedValue(aiJob as any);

    const req = new Request('http://localhost/api/products/prod-1/insights');
    const res = await GET(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('failed');
    expect(data.data.insight).toBeNull();
  });

  it('should return completed insight successfully if it exists', async () => {
    const session = { user: { id: 'user-1' } };
    const savedProduct = { id: 'prod-1', userId: 'user-1', catalogProductId: 'catalog-1' };
    const insight = { summary: 'This is a great product' };
    const tags = [{ name: 'Gaming' }];
    const aiJob = { status: 'COMPLETED' };

    vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
    vi.mocked(prisma.savedProduct.findUnique).mockResolvedValue(savedProduct as any);
    vi.mocked(prisma.productInsight.findFirst).mockResolvedValue(insight as any);
    vi.mocked(prisma.productTag.findMany).mockResolvedValue(tags as any);
    vi.mocked(prisma.aIJob.findFirst).mockResolvedValue(aiJob as any);

    const req = new Request('http://localhost/api/products/prod-1/insights');
    const res = await GET(req as any, { params: Promise.resolve({ id: 'prod-1' }) } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('completed');
    expect(data.data.insight).toEqual(insight);
    expect(data.data.tags).toEqual(['Gaming']);
  });
});
