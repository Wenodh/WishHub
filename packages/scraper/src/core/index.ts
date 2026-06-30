import { type ExtractionDTO } from '@wishhub/contracts';

export interface ExtractionResult {
  product: ExtractionDTO;
  confidence: number;
  source: 'json-ld' | 'opengraph' | 'twitter' | 'meta' | 'manual';
  missingFields: string[];
}

export abstract class BaseParser {
  abstract parse(doc: Document): Partial<ExtractionDTO> | null;
}
