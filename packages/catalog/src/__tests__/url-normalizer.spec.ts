import { describe, it, expect } from 'vitest';
import { urlNormalizerService } from '../services/url-normalizer.service';

describe('UrlNormalizerService', () => {
  it('should remove utm parameters', () => {
    const url = 'https://example.com/product?utm_source=google&utm_medium=cpc';
    expect(urlNormalizerService.normalize(url)).toBe('https://example.com/product');
  });

  it('should normalize amazon URLs', () => {
    const url = 'https://www.amazon.in/dp/B08L5TNJHG/ref=cm_sw_r_cp_api_glt_fabc_123?_encoding=UTF8&psc=1';
    expect(urlNormalizerService.normalize(url)).toBe('https://www.amazon.in/dp/b08l5tnjhg');
  });

  it('should handle missing protocols', () => {
    const url = 'example.com/product';
    expect(urlNormalizerService.normalize(url)).toBe('example.com/product');
  });
});
