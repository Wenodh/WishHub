import { type ExtractionProduct } from '@wishhub/contracts';
import { type ScraperAdapter } from '../../core/types';

export class AmazonAdapter implements ScraperAdapter {
  name = 'amazon';
  enabled = true;

  canHandle(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return hostname.includes('amazon.');
    } catch {
      return false;
    }
  }

  async extract(doc: Document): Promise<Partial<ExtractionProduct> | null> {
    if (!this.canHandle(doc.location.href)) return null;

    const title = doc.querySelector('#productTitle')?.textContent?.trim();
    if (!title) return null;

    const brand = doc.querySelector('#bylineInfo')?.textContent?.trim() ||
                  doc.querySelector('.po-brand .a-span9')?.textContent?.trim();

    const priceStr = doc.querySelector('.a-price .a-offscreen')?.textContent ||
                     doc.querySelector('#priceblock_ourprice')?.textContent ||
                     doc.querySelector('#priceblock_dealprice')?.textContent;

    const price = priceStr ? parseFloat(priceStr.replace(/[^0-9.]/g, '')) : undefined;

    let currency = priceStr?.replace(/[0-9., ]/g, '').trim();
    if (currency === '$') currency = 'USD';
    if (!currency) currency = 'USD';

    const landingImage = doc.querySelector('#landingImage')?.getAttribute('data-old-hires') ||
                         doc.querySelector('#landingImage')?.getAttribute('src');

    const imageGallery = Array.from(doc.querySelectorAll('#altImages li.image img'))
        .map(img => img.getAttribute('src'))
        .filter((src): src is string => !!src && src.includes('http'))
        .map(src => src.replace(/\._AC_.*_\./, '.')); // Get high res if possible

    const images = landingImage ? [landingImage, ...imageGallery] : imageGallery;

    const availability = doc.querySelector('#availability')?.textContent?.toLowerCase().includes('in stock')
      ? 'in-stock'
      : (doc.querySelector('#availability')?.textContent?.toLowerCase().includes('out of stock') ? 'out-of-stock' : 'unknown');

    const ratingStr = doc.querySelector('span.a-icon-alt')?.textContent;
    const rating = ratingStr ? parseFloat(ratingStr.split(' ')[0] || '0') : undefined;

    const reviewCountStr = doc.querySelector('#acrCustomerReviewText')?.textContent;
    const reviewCount = reviewCountStr ? parseInt(reviewCountStr.replace(/[^0-9]/g, '')) : undefined;

    const category = doc.querySelector('#wayfinding-breadcrumbs_container li:last-child')?.textContent?.trim();

    const breadcrumbs = Array.from(doc.querySelectorAll('#wayfinding-breadcrumbs_container li a'))
        .map(a => a.textContent?.trim())
        .filter((t): t is string => !!t);

    const asin = (doc.querySelector('#ASIN') as HTMLInputElement)?.value ||
                 doc.location.href.match(/\/dp\/([A-Z0-9]{10})/)?.[1];

    const canonicalUrl = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || doc.location.href;

    const description = doc.querySelector('#feature-bullets')?.textContent?.trim() ||
                        doc.querySelector('#productDescription')?.textContent?.trim();

    return {
      title,
      brand,
      store: 'Amazon',
      originalUrl: doc.location.href,
      canonicalUrl: canonicalUrl,
      images: [...new Set(images)],
      price,
      currency,
      availability,
      rating,
      reviewCount,
      category,
      breadcrumbs,
      asin,
      description,
    };
  }
}
