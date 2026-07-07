import { type ExtractionProduct } from '@wishhub/contracts';
import { type ScraperAdapter, type ScraperParser } from '../../core/types';
import { JsonLdParser } from '../../parsers/json-ld';
import { OpenGraphParser } from '../../parsers/opengraph';

export class GenericAdapter implements ScraperAdapter {
  name = 'generic';
  enabled = true;

  private parsers: ScraperParser[] = [
    new JsonLdParser(),
    new OpenGraphParser(),
    new TwitterCardParser(),
    new MetaParser(),
    new DomHeuristicsParser(),
  ];

  canHandle(): boolean {
    return true; // Fallback adapter
  }

  async extract(doc: Document): Promise<Partial<ExtractionProduct> | null> {
    let result: Partial<ExtractionProduct> = {
      originalUrl: doc.location.href,
    };

    for (const parser of this.parsers) {
      const data = parser.parse(doc);
      if (data) {
        result = { ...data, ...result, images: this.mergeImages(result.images, data.images) };
        if (result.title && result.price && result.images && result.images.length > 0) {
            // Early exit if we have the core fields
            // But actually, we might want to continue to get more metadata
        }
      }
    }

    if (!result.title) {
        result.title = doc.title;
    }

    return result;
  }

  private mergeImages(existing: string[] = [], newlyFound: string[] = []): string[] {
    return [...new Set([...existing, ...newlyFound])];
  }
}

class TwitterCardParser implements ScraperParser {
  name = 'twitter';
  parse(doc: Document): Partial<ExtractionProduct> | null {
    const getMeta = (name: string) => doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute('content');

    const title = getMeta('twitter:title');
    const description = getMeta('twitter:description');
    const image = getMeta('twitter:image');

    if (!title && !image) return null;

    return {
      title: title || undefined,
      description: description || undefined,
      images: image ? [image] : [],
    };
  }
}

class MetaParser implements ScraperParser {
  name = 'meta';
  parse(doc: Document): Partial<ExtractionProduct> | null {
    const getMeta = (name: string) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content');

    const title = getMeta('title') || getMeta('description');
    const description = getMeta('description');
    const keywords = getMeta('keywords');

    if (!title && !description) return null;

    return {
      title: title || undefined,
      description: description || undefined,
    };
  }
}

class DomHeuristicsParser implements ScraperParser {
  name = 'dom-heuristics';
  parse(doc: Document): Partial<ExtractionProduct> | null {
    const title = doc.querySelector('h1')?.textContent?.trim();

    // Look for price-like patterns
    const priceSelectors = [
        '[class*="price"]',
        '[id*="price"]',
        '.amount',
        '.current-price'
    ];

    let price: number | undefined;
    let currency: string | undefined;

    for (const selector of priceSelectors) {
        const el = doc.querySelector(selector);
        if (el && el.textContent) {
            const text = el.textContent.trim();
            const match = text.match(/([^\d\s,.]+)?\s?([\d,.]+)/);
            if (match) {
                if (match[2]) {
                    price = parseFloat(match[2].replace(/,/g, ''));
                }
                if (match[1]) {
                    currency = match[1];
                }
                if (price) break;
            }
        }
    }

    // Look for main image
    const images = Array.from(doc.querySelectorAll('img'))
        .filter(img => {
            const width = parseInt(img.getAttribute('width') || '0');
            const height = parseInt(img.getAttribute('height') || '0');
            return (width > 200 && height > 200) || (!width && !height);
        })
        .map(img => img.getAttribute('src'))
        .filter((src): src is string => !!src && src.startsWith('http'))
        .slice(0, 5);

    return {
      title: title || undefined,
      price,
      currency: currency === '$' ? 'USD' : currency,
      images,
    };
  }
}
