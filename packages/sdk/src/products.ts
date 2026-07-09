import { type DeleteResponse } from '@wishhub/contracts';

export class ProductSDK {
  constructor(private baseUrl: string) {}

  async list(params?: { limit?: number; cursor?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.cursor) searchParams.set('cursor', params.cursor);

    const res = await fetch(`${this.baseUrl}/api/products?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to list products');
    return res.json();
  }

  async save(data: any) {
    const res = await fetch(`${this.baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save product');
    return res.json();
  }

  async delete(id: string): Promise<DeleteResponse> {
    const res = await fetch(`${this.baseUrl}/api/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  }
}
