import { scraperCore } from './core';
import { type ExtractionResult } from './core/types';
import { type ExtractionDTO } from '@wishhub/contracts';

/**
 * Main Scraper Service
 * Orchestrates adapters and provides a unified API
 */
export class ScraperService {
  /**
   * Extract product information from a Document
   */
  async extract(doc: Document): Promise<ExtractionResult | null> {
    return scraperCore.extract(doc);
  }

  /**
   * Compatibility layer for Milestone 1A
   * @deprecated Use extract()
   */
  async extractOld(doc: Document): Promise<ExtractionDTO | null> {
    const result = await this.extract(doc);
    if (!result) return null;

    return {
      name: result.product.title,
      description: result.product.description,
      price: result.product.price,
      currency: result.product.currency,
      url: result.product.originalUrl,
      canonicalUrl: result.product.canonicalUrl,
      images: result.product.images,
      storeName: result.product.store || result.extractionSource[0],
      rawMetadata: result.product.rawMetadata,
      confidence: result.confidence,
      source: result.extractionSource[0] as any,
      missingFields: result.missingFields,
    };
  }
}

export const scraperService = new ScraperService();

export * from './core';
export * from './core/types';
