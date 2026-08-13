import { ProductSDK } from './products';
import { WishlistSDK } from './wishlists';
import { CookieAuthProvider, type AuthProvider } from './auth';

export class WishHubSDK {
  public products: ProductSDK;
  public wishlists: WishlistSDK;
  public auth: AuthProvider;

  constructor(baseUrl: string, authProvider?: AuthProvider) {
    this.products = new ProductSDK(baseUrl);
    this.wishlists = new WishlistSDK(baseUrl);
    this.auth = authProvider || new CookieAuthProvider(baseUrl);
  }
}

export * from './auth';
export * from './products';
export * from './wishlists';
