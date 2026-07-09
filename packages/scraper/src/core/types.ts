import { type ExtractionProduct } from '@wishhub/contracts';

export interface ScraperAdapter {
  name: string;
  enabled: boolean;
  canHandle(url: string): boolean;
  extract(doc: Document): Promise<Partial<ExtractionProduct> | null>;
}

export interface ScraperParser {
  name: string;
  parse(doc: Document): Partial<ExtractionProduct> | null;
}

export interface ExtractionResult {
  product: ExtractionProduct;
  confidence: number;
  extractionSource: string[];
  missingFields: string[];
  warnings: string[];
}
