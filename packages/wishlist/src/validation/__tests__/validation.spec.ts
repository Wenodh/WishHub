import { describe, it, expect } from 'vitest';
import { WishlistValidation } from '../index';

describe('WishlistValidation', () => {
  it('should validate name length', () => {
    expect(WishlistValidation.validateName('')).toBe('Wishlist name cannot be empty');
    expect(WishlistValidation.validateName('a'.repeat(51))).toBe('Wishlist name cannot exceed 50 characters');
    expect(WishlistValidation.validateName('Valid Name')).toBeNull();
  });
});
