import { type ExtractionDTO } from '@wishhub/contracts';
import { BaseParser } from '../core';

export class JsonLdParser extends BaseParser {
  parse(doc: Document): Partial<ExtractionDTO> | null {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
      try {
        const data = JSON.parse(script.textContent || '{}');
        const product = this.findProduct(data);
        if (product) {
          return {
            name: product.name,
            description: product.description,
            images: Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []),
            price: product.offers?.price ? parseFloat(product.offers.price) : undefined,
            currency: product.offers?.priceCurrency,
            storeName: product.brand?.name || product.publisher?.name,
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
