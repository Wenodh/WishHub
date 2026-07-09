import { describe, it, expect, beforeEach } from 'vitest';
import { GenericAdapter } from '../index';
import { JSDOM } from 'jsdom';

describe('GenericAdapter', () => {
  let adapter: GenericAdapter;

  beforeEach(() => {
    adapter = new GenericAdapter();
  });

  it('should handle any URL', () => {
    expect(adapter.canHandle()).toBe(true);
  });

  it('should extract product details using OpenGraph', async () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="OG Product" />
          <meta property="og:description" content="OG Description" />
          <meta property="og:image" content="https://example.com/og.jpg" />
          <meta property="og:site_name" content="Example Store" />
        </head>
        <body></body>
      </html>
    `;
    const dom = new JSDOM(html, { url: 'https://example.com/p/1' });
    const result = await adapter.extract(dom.window.document as unknown as Document);

    expect(result?.title).toBe('OG Product');
    expect(result?.description).toBe('OG Description');
    expect(result?.images).toContain('https://example.com/og.jpg');
    expect(result?.store).toBe('Example Store');
  });

  it('should extract product details using JSON-LD', async () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "JSON-LD Product",
              "image": "https://example.com/ld.jpg",
              "description": "LD Description",
              "offers": {
                "@type": "Offer",
                "price": "99.99",
                "priceCurrency": "USD"
              }
            }
          </script>
        </head>
        <body></body>
      </html>
    `;
    const dom = new JSDOM(html, { url: 'https://example.com/p/1' });
    const result = await adapter.extract(dom.window.document as unknown as Document);

    expect(result?.title).toBe('JSON-LD Product');
    expect(result?.price).toBe(99.99);
    expect(result?.currency).toBe('USD');
  });

  it('should fallback to DOM heuristics', async () => {
    const html = `
      <html>
        <body>
          <h1>Heuristic Product</h1>
          <span class="price">$19.99</span>
          <img src="https://example.com/big.jpg" width="500" height="500" />
        </body>
      </html>
    `;
    const dom = new JSDOM(html, { url: 'https://example.com/p/1' });
    const result = await adapter.extract(dom.window.document as unknown as Document);

    expect(result?.title).toBe('Heuristic Product');
    expect(result?.price).toBe(19.99);
    expect(result?.currency).toBe('USD');
    expect(result?.images).toContain('https://example.com/big.jpg');
  });
});
