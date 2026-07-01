import { type CreateProductRequest, type ProductResponse } from '@wishhub/contracts';

export class ProductSDK {
  constructor(private baseUrl: string) {}

  async save(data: CreateProductRequest): Promise<ProductResponse> {
    const res = await fetch(`${this.baseUrl}/api/products`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to save product');
    return res.json();
  }

  async list(params?: { limit?: number; cursor?: string }): Promise<ProductResponse[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);

    const res = await fetch(`${this.baseUrl}/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to list products');
    return res.json();
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
  }
}
