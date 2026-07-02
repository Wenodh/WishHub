import { type ExtractionDTO } from '@wishhub/contracts';
import { BaseParser } from '../../core';

export class AmazonParser extends BaseParser {
  parse(doc: Document): Partial<ExtractionDTO> | null {
    if (!doc.location.hostname.includes('amazon.')) return null;

    const title = doc.querySelector('#productTitle')?.textContent?.trim();
    if (!title) return null;

    const priceStr = doc.querySelector('.a-price .a-offscreen')?.textContent;
    const price = priceStr ? parseFloat(priceStr.replace(/[^0-9.]/g, '')) : undefined;

    let currency = priceStr?.replace(/[0-9.,]/g, '').trim() || 'USD';
    if (currency === '$') currency = 'USD';

    const image = doc.querySelector('#landingImage')?.getAttribute('src') ||
                  doc.querySelector('#imgBlkFront')?.getAttribute('src');

    return {
      name: title,
      price,
      currency,
      images: image ? [image] : [],
      storeName: 'Amazon',
      url: doc.location.href,
    };
  }
}
