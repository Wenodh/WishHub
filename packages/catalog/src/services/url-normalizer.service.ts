export class UrlNormalizerService {
  normalize(url: string): string {
    try {
      const parsedUrl = new URL(url);

      // Remove common tracking and affiliate parameters
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'ref', 'ref_', '_encoding', 'tag', 'tag_id', 'ascsubtag', 'fbclid', 'gclid'
      ];

      trackingParams.forEach(param => parsedUrl.searchParams.delete(param));

      // Site specific normalization: Amazon
      if (parsedUrl.hostname.includes('amazon')) {
        // Amazon URLs often have many forms, typically /dp/ASIN is the canonical form
        const match = parsedUrl.pathname.match(/\/([dg]p\/[A-Z0-9]{10})/);
        if (match) {
          parsedUrl.pathname = match[0];
          parsedUrl.search = '';
        }
      }

      // Ensure consistent hostname (lowercase, no trailing slashes in path)
      let normalized = parsedUrl.origin + parsedUrl.pathname.replace(/\/+$/, '');
      if (parsedUrl.search) {
        normalized += parsedUrl.search;
      }

      return normalized.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }
}

export const urlNormalizerService = new UrlNormalizerService();
