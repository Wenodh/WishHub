import { describe, it, expect } from 'vitest';
import { Wishlist } from '../models';

describe('Wishlist Model', () => {
  it('should rename and trim the name', () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'Old Name',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    wishlist.rename('  New Name  ');
    expect(wishlist.name).toBe('New Name');
  });

  it('should make default', () => {
    const wishlist = new Wishlist({
      userId: 'user-1',
      name: 'My List',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    wishlist.makeDefault();
    expect(wishlist.isDefault).toBe(true);
  });
});
