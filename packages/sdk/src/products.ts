import { type DeleteResponse } from '@wishhub/contracts';

export class ProductSDK {
  constructor(private baseUrl: string) {}

  async list(params?: { limit?: number; cursor?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.cursor) searchParams.set('cursor', params.cursor);

    const res = await fetch(`${this.baseUrl}/api/products?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to list products');
    const json = await res.json();
    return json.success && json.data !== undefined ? json.data : json;
  }

  async save(data: any) {
    const res = await fetch(`${this.baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save product');
    const json = await res.json();
    return json.success && json.data !== undefined ? json.data : json;
  }

  async delete(id: string): Promise<DeleteResponse> {
    const res = await fetch(`${this.baseUrl}/api/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    const json = await res.json();
    return json.success && json.data !== undefined ? json.data : json;
  }

  async update(id: string, data: any) {
    const res = await fetch(`${this.baseUrl}/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    const json = await res.json();
    return json.success && json.data !== undefined ? json.data : json;
  }
}
