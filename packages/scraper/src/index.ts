import { type ExtractionDTO } from '@wishhub/contracts';
import { JsonLdParser } from './parsers/json-ld';
import { OpenGraphParser } from './parsers/opengraph';
import { AmazonParser } from './parsers/stores/amazon';
import { type ExtractionResult } from './core';

export class ScraperService {
  private parsers = [
    { parser: new AmazonParser(), source: 'amazon' as const, weight: 1.0 },
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
            url: data.url || doc.location.href,
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
    const required: (keyof ExtractionDTO)[] = ['name', 'url'];
    return required.filter(field => !data[field as keyof ExtractionDTO]);
  }
}

export const scraperService = new ScraperService();
export * from './core';
