import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { auth } from '@wishhub/auth';
import { saveProductService } from '@wishhub/catalog';
import { NextResponse } from 'next/server';

vi.mock('@wishhub/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@wishhub/catalog', () => ({
  saveProductService: {
    execute: vi.fn(),
  },
}));

describe('POST /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const req = new Request('http://localhost/api/products', { method: 'POST' });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('should return 201 and product on success', async () => {
    const session = { user: { id: 'user-1' } };
    const product = { id: 'prod-1', name: 'Test Product' };
    const body = { name: 'Test Product', url: 'https://amazon.com/dp/123' };

    vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
    vi.mocked(saveProductService.execute).mockResolvedValue({ ok: true, value: product as any });

    const req = new Request('http://localhost/api/products', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.product).toEqual(product);
  });

  it('should return 400 if validation fails', async () => {
    const session = { user: { id: 'user-1' } };
    vi.mocked(auth.api.getSession).mockResolvedValue(session as any);

    const req = new Request('http://localhost/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // Invalid URL and name
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
