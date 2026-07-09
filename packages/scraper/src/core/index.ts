import { type ExtractionProduct } from '@wishhub/contracts';
import { AmazonAdapter } from '../adapters/amazon';
import { GenericAdapter } from '../adapters/generic';
import { type ScraperAdapter, type ExtractionResult } from './types';
import { normalizeProduct } from '../normalizers';
import { validateProduct } from '../validators';

/**
 * Compatibility DTO for Milestone 1A/B
 * @deprecated Use ExtractionResult
 */
export interface ExtractionDTO {
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    url: string;
    canonicalUrl?: string;
    images: string[];
    storeName?: string;
    rawMetadata?: Record<string, any>;
    confidence: number;
    source: string;
    missingFields: string[];
}

export abstract class BaseParser {
  abstract parse(doc: Document): Partial<ExtractionProduct> | null;
}

export class ScraperCore {
  private adapters: ScraperAdapter[] = [];

  constructor(registerDefaults = true) {
    if (registerDefaults) {
        this.registerAdapter(new AmazonAdapter());
        this.registerAdapter(new GenericAdapter());
    }
  }

  registerAdapter(adapter: ScraperAdapter) {
    this.adapters.unshift(adapter);
  }

  async extract(doc: Document): Promise<ExtractionResult | null> {
    const url = doc.location.href;
    const adapter = this.adapters.find(a => a.enabled && a.canHandle(url));

    if (!adapter) {
      return null;
    }

    const rawData = await adapter.extract(doc);
    if (!rawData) {
      return null;
    }

    const normalizedData = normalizeProduct(rawData);
    const validation = validateProduct(normalizedData);

    if (!validation.isValid && validation.missingFields.includes('title')) {
        return null;
    }

    return {
      product: normalizedData as ExtractionProduct,
      confidence: this.calculateConfidence(normalizedData, adapter.name),
      extractionSource: [adapter.name],
      missingFields: validation.missingFields,
      warnings: [...validation.warnings, ...validation.errors],
    };
  }

  private calculateConfidence(product: Partial<ExtractionProduct>, adapterName: string): number {
    let score = 0.5;
    if (adapterName !== 'generic') score += 0.3;
    if (product.title) score += 0.1;
    if (product.price) score += 0.05;
    if (product.images && product.images.length > 0) score += 0.05;
    return Math.min(score, 1.0);
  }
}

export const scraperCore = new ScraperCore();
