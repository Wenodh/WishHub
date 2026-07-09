import { type ExtractionProduct } from '@wishhub/contracts';
import { type ScraperParser } from '../core/types';

export class JsonLdParser implements ScraperParser {
  name = 'json-ld';
  parse(doc: Document): Partial<ExtractionProduct> | null {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
      try {
        const data = JSON.parse(script.textContent || '{}');
        const product = this.findProduct(data);
        if (product) {
          const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;

          return {
            title: product.name,
            description: product.description,
            images: Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []),
            price: offers?.price ? parseFloat(offers.price) : undefined,
            currency: offers?.priceCurrency,
            brand: product.brand?.name || product.brand,
            category: product.category,
            rawMetadata: data,
          };
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  private findProduct(data: any): any {
    if (data['@type'] === 'Product') return data;
    if (Array.isArray(data)) return data.find(item => item['@type'] === 'Product');
    if (data['@graph']) return data['@graph'].find((item: any) => item['@type'] === 'Product');
    return null;
  }
}
