import { type WishlistSummary } from '@wishhub/contracts';

export class WishlistSDK {
  constructor(private baseUrl: string) {}

  async list(): Promise<WishlistSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/wishlists`);
    if (!res.ok) throw new Error('Failed to list wishlists');
    const data = await res.json();
    return data.wishlists;
  }

  async getDefault(): Promise<WishlistSummary> {
    const res = await fetch(`${this.baseUrl}/api/wishlists/default`);
    if (!res.ok) throw new Error('Failed to get default wishlist');
    const data = await res.json();
    return data.wishlist;
  }
}
