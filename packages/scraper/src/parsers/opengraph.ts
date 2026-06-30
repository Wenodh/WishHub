import { type ExtractionDTO } from '@wishhub/contracts';
import { BaseParser } from '../core';

export class OpenGraphParser extends BaseParser {
  parse(doc: Document): Partial<ExtractionDTO> | null {
    const getMeta = (property: string) =>
      doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`)?.getAttribute('content');

    const name = getMeta('og:title');
    if (!name) return null;

    return {
      name,
      description: getMeta('og:description') || undefined,
      imageUrl: getMeta('og:image') || undefined,
      images: getMeta('og:image') ? [getMeta('og:image')!] : [],
      storeName: getMeta('og:site_name') || undefined,
      url: getMeta('og:url') || window.location.href,
    };
  }
}
