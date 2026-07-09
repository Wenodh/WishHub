import { describe, it, expect } from 'vitest';
import { WishlistValidators } from '../index';

describe('WishlistValidators', () => {
  it('should validate name length', () => {
    const emptyResult = WishlistValidators.validateName('');
    expect(emptyResult.ok).toBe(false);

    const longResult = WishlistValidators.validateName('a'.repeat(51));
    expect(longResult.ok).toBe(false);

    const validResult = WishlistValidators.validateName('Valid Name');
    expect(validResult.ok).toBe(true);
    if (validResult.ok) {
        expect(validResult.value).toBe('Valid Name');
    }
  });
});
