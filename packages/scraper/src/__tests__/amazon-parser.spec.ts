import { describe, it, expect, beforeEach } from 'vitest';
import { AmazonParser } from '../parsers/stores/amazon';

describe('AmazonParser', () => {
  let parser: AmazonParser;

  beforeEach(() => {
    parser = new AmazonParser();
  });

  it('should parse Amazon product page correctly', () => {
    const mockDoc = {
      location: { hostname: 'www.amazon.com', href: 'https://www.amazon.com/dp/B08N5KWB9H' },
      querySelector: (selector: string) => {
        if (selector === '#productTitle') return { textContent: 'Apple MacBook Air' };
        if (selector === '.a-price .a-offscreen') return { textContent: '$999.00' };
        if (selector === '#landingImage') return { getAttribute: () => 'https://m.media-amazon.com/images/I/image.jpg' };
        return null;
      },
    } as any;

    const result = parser.parse(mockDoc);

    expect(result).toEqual({
      title: 'Apple MacBook Air',
      price: 999,
      currency: 'USD',
      images: ['https://m.media-amazon.com/images/I/image.jpg'],
      store: 'Amazon',
      originalUrl: 'https://www.amazon.com/dp/B08N5KWB9H',
    });
  });

  it('should return null if not an Amazon page', () => {
    const mockDoc = {
      location: { hostname: 'www.google.com', href: 'https://www.google.com' },
    } as any;

    const result = parser.parse(mockDoc);
    expect(result).toBeNull();
  });
});
