import { describe, it, expect, beforeEach } from 'vitest';
import { ScraperCore } from '../index';
import { type ScraperAdapter } from '../types';
import { JSDOM } from 'jsdom';

describe('ScraperCore', () => {
  let core: ScraperCore;

  beforeEach(() => {
    core = new ScraperCore(false); // Don't register defaults for testing
  });

  it('should return null if no adapter can handle the URL', async () => {
    const dom = new JSDOM('<html><body></body></html>', { url: 'https://example.com' });
    const result = await core.extract(dom.window.document as unknown as Document);
    expect(result).toBeNull();
  });

  it('should use the registered adapter', async () => {
    const mockAdapter: ScraperAdapter = {
      name: 'test',
      enabled: true,
      canHandle: (url) => url.includes('test.com'),
      extract: async () => ({ title: 'Test Product', originalUrl: 'https://test.com' })
    };

    core.registerAdapter(mockAdapter);

    const dom = new JSDOM('<html><body></body></html>', { url: 'https://test.com' });
    const result = await core.extract(dom.window.document as unknown as Document);

    expect(result).not.toBeNull();
    expect(result?.product.title).toBe('Test Product');
    expect(result?.extractionSource).toContain('test');
  });

  it('should normalize and validate the output', async () => {
    const mockAdapter: ScraperAdapter = {
      name: 'test',
      enabled: true,
      canHandle: (url) => url.includes('test.com'),
      extract: async () => ({ title: '  Dirty Title  ', originalUrl: 'https://test.com' })
    };

    core.registerAdapter(mockAdapter);

    const dom = new JSDOM('<html><body></body></html>', { url: 'https://test.com' });
    const result = await core.extract(dom.window.document as unknown as Document);
    expect(result?.product.title).toBe('Dirty Title');
  });
});
