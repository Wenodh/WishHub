import {
  type WishlistSummary,
  type CreateWishlistRequest,
  type UpdateWishlistRequest
} from '@wishhub/contracts';

export class WishlistSDK {
  constructor(private baseUrl: string) {}

  async list(): Promise<WishlistSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/wishlists`);
    if (!res.ok) throw new Error('Failed to list wishlists');
    const data = await res.json();
    return data.data.wishlists;
  }

  async create(data: CreateWishlistRequest): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/wishlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to create wishlist');
    }
    return res.json();
  }

  async update(id: string, data: UpdateWishlistRequest): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/wishlists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to update wishlist');
    }
    return res.json();
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/wishlists/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete wishlist');
  }

  async getDefault(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/wishlists/default`);
    if (!res.ok) throw new Error('Failed to get default wishlist');
    const data = await res.json();
    return data.data;
  }

  async setDefault(wishlistId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/wishlists/default`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishlistId }),
    });
    if (!res.ok) throw new Error('Failed to set default wishlist');
  }

  async getProducts(id: string, params?: { page?: number; pageSize?: number }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${this.baseUrl}/api/wishlists/${id}/products?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to get wishlist products');
    const data = await res.json();
    return data.data;
  }

  async addProduct(wishlistId: string, savedProductId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/wishlists/${wishlistId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ savedProductId }),
    });
    if (!res.ok) throw new Error('Failed to add product to wishlist');
  }

  async removeProduct(wishlistId: string, savedProductId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/wishlists/${wishlistId}/products/${savedProductId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove product from wishlist');
  }
}
