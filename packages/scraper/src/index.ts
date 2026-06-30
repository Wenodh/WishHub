import { type ExtractionDTO } from '@wishhub/contracts';
import { JsonLdParser } from './parsers/json-ld';
import { OpenGraphParser } from './parsers/opengraph';
import { type ExtractionResult } from './core';

export class ScraperService {
  private parsers = [
    { parser: new JsonLdParser(), source: 'json-ld' as const, weight: 0.9 },
    { parser: new OpenGraphParser(), source: 'opengraph' as const, weight: 0.7 },
  ];

  async extract(doc: Document): Promise<ExtractionResult | null> {
    for (const { parser, source, weight } of this.parsers) {
      const data = parser.parse(doc);
      if (data && data.name) {
        return {
          product: {
            ...data,
            url: data.url || window.location.href,
            name: data.name,
            confidence: weight,
            source,
          } as ExtractionDTO,
          confidence: weight,
          source,
          missingFields: this.getMissingFields(data),
        };
      }
    }
    return null;
  }

  private getMissingFields(data: Partial<ExtractionDTO>): string[] {
    const required: (keyof ExtractionDTO)[] = ['name', 'url', 'imageUrl'];
    return required.filter(field => !data[field]);
  }
}

export const scraperService = new ScraperService();
export * from './core';
