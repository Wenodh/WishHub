export class WishHubSDK {
  constructor(private baseUrl: string) {}

  async getWishlists() {
    const response = await fetch(`${this.baseUrl}/api/wishlists`);
    return response.json();
  }
}
