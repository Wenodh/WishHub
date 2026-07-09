import { scraperService } from './index';
import { JSDOM } from 'jsdom';

async function measurePerformance() {
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
  const doc = dom.window.document as unknown as Document;

  const start = performance.now();
  await scraperService.extract(doc);
  const end = performance.now();

  console.log(`Extraction took ${end - start}ms`);
}

measurePerformance();
