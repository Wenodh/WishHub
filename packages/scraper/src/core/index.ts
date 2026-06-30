export interface ScraperResult {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  storeName?: string;
}

export abstract class BaseScraper {
  abstract scrape(doc: Document): Promise<ScraperResult | null>;
}
