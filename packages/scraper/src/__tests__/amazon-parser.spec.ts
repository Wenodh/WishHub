import { describe, it, expect, vi } from 'vitest';
import { AmazonParser } from '../parsers/stores/amazon';

describe('AmazonParser', () => {
  it('should parse Amazon product page correctly', () => {
    const parser = new AmazonParser();
    const mockDoc = {
      location: { hostname: 'www.amazon.com', href: 'https://www.amazon.com/dp/B08N5KWB9H' },
      querySelector: vi.fn((selector) => {
        if (selector === '#productTitle') return { textContent: '  Apple MacBook Air  ' };
        if (selector === '.a-price .a-offscreen') return { textContent: '$999.00' };
        if (selector === '#landingImage') return { getAttribute: () => 'https://m.media-amazon.com/images/I/image.jpg' };
        return null;
      }),
    } as any;

    const result = parser.parse(mockDoc);

    expect(result).toEqual({
      name: 'Apple MacBook Air',
      price: 999,
      currency: 'USD',
      images: ['https://m.media-amazon.com/images/I/image.jpg'],
      storeName: 'Amazon',
      url: 'https://www.amazon.com/dp/B08N5KWB9H',
    });
  });

  it('should return null if not an Amazon page', () => {
    const parser = new AmazonParser();
    const mockDoc = {
      location: { hostname: 'www.google.com' },
    } as any;

    const result = parser.parse(mockDoc);
    expect(result).toBeNull();
  });
});
