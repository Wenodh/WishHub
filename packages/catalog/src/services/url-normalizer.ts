export class UrlNormalizerService {
  normalize(url: string): string {
    try {
      const parsedUrl = new URL(url);

      // Remove common tracking and affiliate parameters
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'ref', 'ref_', '_encoding', 'tag', 'tag_id', 'ascsubtag'
      ];

      trackingParams.forEach(param => parsedUrl.searchParams.delete(param));

      // Amazon specific cleaning (simplified for slice)
      if (parsedUrl.hostname.includes('amazon')) {
        // Keep only DP or GP path for canonical
        const match = parsedUrl.pathname.match(/\/([dg]p\/[A-Z0-9]{10})/);
        if (match) {
          parsedUrl.pathname = match[0];
          parsedUrl.search = '';
        }
      }

      return parsedUrl.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }
}

export const urlNormalizerService = new UrlNormalizerService();
