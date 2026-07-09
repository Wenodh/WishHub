import { type ExtractionProduct } from '@wishhub/contracts';

/**
 * Normalizes product data after extraction
 */
export function normalizeProduct(product: Partial<ExtractionProduct>): Partial<ExtractionProduct> {
  const normalized = { ...product };

  if (normalized.title) {
    normalized.title = normalized.title.trim();
  }

  if (normalized.brand) {
    normalized.brand = normalized.brand.trim();
  }

  if (normalized.price && typeof normalized.price === 'string') {
    normalized.price = parseFloat(normalized.price);
  }

  if (normalized.images) {
    normalized.images = [...new Set(normalized.images
      .filter(img => typeof img === 'string' && img.startsWith('http'))
      .map(img => img.trim())
    )];
  }

  if (normalized.originalUrl) {
    normalized.originalUrl = normalizeUrl(normalized.originalUrl);
  }

  if (normalized.canonicalUrl) {
    normalized.canonicalUrl = normalizeUrl(normalized.canonicalUrl);
  }

  return normalized;
}

/**
 * Normalizes a URL by removing tracking parameters and standardizing format
 */
export function normalizeUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);

    // Remove tracking parameters
    const paramsToRemove = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'ref_',
      'tag',
      'aff_id',
      'aff_sub',
      'ncid',
      'mc_cid',
      'mc_eid',
      'gclid',
      'fbclid',
      '_ga',
      '_gac',
      'msclkid',
      'session_id',
      'sid',
    ];

    paramsToRemove.forEach(param => url.searchParams.delete(param));

    // Special handling for Amazon: remove everything except /dp/ASIN or /gp/product/ASIN
    if (url.hostname.includes('amazon.')) {
      const asinMatch = url.pathname.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/);
      if (asinMatch) {
        url.pathname = `/dp/${asinMatch[2]}`;
        // Clear all search params for Amazon product pages
        Array.from(url.searchParams.keys()).forEach(key => url.searchParams.delete(key));
      }
    }

    // Standardize protocol and hostname
    url.protocol = 'https:';
    url.hostname = url.hostname.replace(/^www\./, 'www.'); // Keep www if present, but standard

    // Remove trailing slash from pathname if it's not just /
    if (url.pathname.endsWith('/') && url.pathname.length > 1) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    return urlStr;
  }
}
