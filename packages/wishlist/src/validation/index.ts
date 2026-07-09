import { normalizeUrl } from '@wishhub/scraper';

export class WishlistValidation {
  static validateName(name: string): string | null {
    const trimmed = name.trim();
    if (trimmed.length < 1) return 'Wishlist name cannot be empty';
    if (trimmed.length > 50) return 'Wishlist name cannot exceed 50 characters';
    return null;
  }

  static normalizeUrl(url: string): string {
    return normalizeUrl(url);
  }

  static isValidId(id: string): boolean {
    return id.length > 0;
  }
}
