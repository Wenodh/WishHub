import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeProduct, normalizeUrl } from '@wishhub/scraper';

describe('Scraper Integration (Normalization)', () => {
  it('should normalize URLs correctly', () => {
    const rawUrl = 'https://www.amazon.com/Product-Name/dp/B00XYZ1234?utm_source=test&ref_=some_ref';
    const normalized = normalizeUrl(rawUrl);
    expect(normalized).toBe('https://www.amazon.com/dp/B00XYZ1234');
  });

  it('should normalize product data', () => {
    const rawProduct = {
      title: '  Messy Title  ',
      price: '19.99',
      originalUrl: 'https://example.com/p/1?ref=abc'
    };
    const normalized = normalizeProduct(rawProduct as any);
    expect(normalized.title).toBe('Messy Title');
    expect(normalized.price).toBe(19.99);
    expect(normalized.originalUrl).toBe('https://example.com/p/1');
  });
});
