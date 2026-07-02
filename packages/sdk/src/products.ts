import {
  type CreateProductRequest,
  type CreateProductResponse,
  type ProductListResponse,
  type DeleteProductResponse
} from '@wishhub/contracts';

export class ProductSDK {
  constructor(private baseUrl: string) {}

  async save(data: CreateProductRequest): Promise<CreateProductResponse> {
    const res = await fetch(`${this.baseUrl}/api/products`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to save product' }));
      throw new Error(error.error);
    }
    return res.json();
  }

  async list(params?: { limit?: number; cursor?: string }): Promise<ProductListResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);

    const res = await fetch(`${this.baseUrl}/api/products?${query.toString()}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to list products' }));
      throw new Error(error.error);
    }
    return res.json();
  }

  async delete(id: string): Promise<DeleteProductResponse> {
    const res = await fetch(`${this.baseUrl}/api/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to delete product' }));
      throw new Error(error.error);
    }
    return res.json();
  }
}
