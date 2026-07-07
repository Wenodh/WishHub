import { describe, it, expect, beforeEach } from 'vitest';
import { AmazonAdapter } from '../index';
import { JSDOM } from 'jsdom';

describe('AmazonAdapter', () => {
  let adapter: AmazonAdapter;

  beforeEach(() => {
    adapter = new AmazonAdapter();
  });

  it('should handle amazon URLs', () => {
    expect(adapter.canHandle('https://www.amazon.com/dp/B08N5WRWJ6')).toBe(true);
    expect(adapter.canHandle('https://www.amazon.co.uk/dp/B08N5WRWJ6')).toBe(true);
    expect(adapter.canHandle('https://example.com')).toBe(false);
  });

  it('should extract product details from Amazon HTML', async () => {
    const html = `
      <html>
        <body>
          <h1 id="productTitle">Amazon Echo Dot</h1>
          <div id="bylineInfo">Amazon</div>
          <span class="a-price"><span class="a-offscreen">$49.99</span></span>
          <img id="landingImage" src="https://m.media-amazon.com/images/I/6182S7MYC2L._AC_SL1000_.jpg" />
          <div id="availability">In Stock.</div>
          <span class="a-icon-alt">4.5 out of 5 stars</span>
          <span id="acrCustomerReviewText">1,234 ratings</span>
          <div id="wayfinding-breadcrumbs_container">
            <ul>
              <li><a href="#">Electronics</a></li>
              <li><a href="#">Smart Home</a></li>
            </ul>
          </div>
          <input type="hidden" id="ASIN" value="B08N5WRWJ6" />
        </body>
      </html>
    `;
    const dom = new JSDOM(html, { url: 'https://www.amazon.com/dp/B08N5WRWJ6' });
    const result = await adapter.extract(dom.window.document as unknown as Document);

    expect(result).not.toBeNull();
    expect(result?.title).toBe('Amazon Echo Dot');
    expect(result?.brand).toBe('Amazon');
    expect(result?.price).toBe(49.99);
    expect(result?.currency).toBe('USD');
    expect(result?.availability).toBe('in-stock');
    expect(result?.rating).toBe(4.5);
    expect(result?.reviewCount).toBe(1234);
    expect(result?.asin).toBe('B08N5WRWJ6');
    expect(result?.breadcrumbs).toContain('Electronics');
    expect(result?.breadcrumbs).toContain('Smart Home');
  });
});
