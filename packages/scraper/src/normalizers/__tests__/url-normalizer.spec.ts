import { describe, it, expect } from 'vitest';
import { normalizeUrl } from '../index';

describe('URL Normalizer', () => {
  it('should remove utm parameters', () => {
    const url = 'https://example.com/product?utm_source=google&utm_medium=cpc&id=123';
    expect(normalizeUrl(url)).toBe('https://example.com/product?id=123');
  });

  it('should remove amazon tracking parameters', () => {
    const url = 'https://www.amazon.com/Echo-Dot-5th-Gen-2022-release/dp/B09B8V1LZ3/ref=sr_1_1?keywords=echo+dot&qid=1670000000&sr=8-1';
    expect(normalizeUrl(url)).toBe('https://www.amazon.com/dp/B09B8V1LZ3');
  });

  it('should normalize protocol to https', () => {
    const url = 'http://example.com/product';
    expect(normalizeUrl(url)).toBe('https://example.com/product');
  });

  it('should remove trailing slash', () => {
    const url = 'https://example.com/product/';
    expect(normalizeUrl(url)).toBe('https://example.com/product');
  });

  it('should keep query parameters that are not tracking related', () => {
    const url = 'https://example.com/search?q=test&color=red&utm_campaign=winter';
    expect(normalizeUrl(url)).toBe('https://example.com/search?q=test&color=red');
  });
});
