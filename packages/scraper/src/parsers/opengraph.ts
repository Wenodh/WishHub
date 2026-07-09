import { type ExtractionProduct } from '@wishhub/contracts';
import { type ScraperParser } from '../core/types';

export class OpenGraphParser implements ScraperParser {
  name = 'opengraph';
  parse(doc: Document): Partial<ExtractionProduct> | null {
    const getMeta = (property: string) =>
      doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`)?.getAttribute('content');

    const title = getMeta('og:title');
    if (!title) return null;

    return {
      title,
      description: getMeta('og:description') || undefined,
      images: getMeta('og:image') ? [getMeta('og:image')!] : [],
      store: getMeta('og:site_name') || undefined,
      originalUrl: getMeta('og:url') || doc.location.href,
    };
  }
}
