import { ProductSDK } from './products';
import { CookieAuthProvider, type AuthProvider } from './auth';

export class WishHubSDK {
  public products: ProductSDK;
  public auth: AuthProvider;

  constructor(baseUrl: string, authProvider?: AuthProvider) {
    this.products = new ProductSDK(baseUrl);
    this.auth = authProvider || new CookieAuthProvider();
  }
}

export * from './auth';
export * from './products';
