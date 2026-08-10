import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { scraperCore } from '@wishhub/scraper';
import { JSDOM } from 'jsdom';
import { z } from 'zod';
import dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

async function isPrivateUrl(urlStr: string): Promise<boolean> {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    // 1. Check obvious hostnames statically
    if (
      hostname === 'localhost' ||
      hostname === 'localhost.localdomain' ||
      hostname === '0.0.0.0' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local')
    ) {
      return true;
    }

    // 2. Resolve DNS to get IP addresses
    let ip: string;
    try {
      const lookup = await lookupAsync(hostname);
      ip = lookup.address;
    } catch {
      // If DNS fails to resolve, it's unsafe/unreachable
      return true;
    }

    // 3. Validate IPv4 ranges
    const ipv4Parts = ip.split('.').map(Number);
    if (ipv4Parts.length === 4 && !ipv4Parts.some(isNaN)) {
      const [a, b, c, d] = ipv4Parts;
      if (a !== undefined && b !== undefined && c !== undefined && d !== undefined) {
        // Loopback: 127.0.0.0/8
        if (a === 127) return true;
        // Private RFC1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
        if (a === 10) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 192 && b === 168) return true;
        // Link-local: 169.254.0.0/16
        if (a === 169 && b === 254) return true;
        // Broadcast/anycast/unspecified
        if (a === 0 || a >= 224) return true;
      }
    }

    // 4. Validate IPv6 ranges
    if (ip.includes(':')) {
      const normalizedv6 = ip.toLowerCase();
      if (
        normalizedv6 === '::1' ||
        normalizedv6 === '::' ||
        normalizedv6.startsWith('fe80:') ||
        normalizedv6.startsWith('fc00:') ||
        normalizedv6.startsWith('fd00:')
      ) {
        return true;
      }
    }

    return false;
  } catch {
    return true;
  }
}

const ExtractRequestSchema = z.object({
  url: z.string().url().refine((val) => val.startsWith('http://') || val.startsWith('https://'), {
    message: 'URL must use HTTP or HTTPS protocol',
  }),
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validation = ExtractRequestSchema.safeParse(body);

  if (!validation.success) {
    return ApiResponse.badRequest('Invalid URL');
  }

  const { url } = validation.data;

  // Enforce SSRF private network protection
  if (await isPrivateUrl(url)) {
    return ApiResponse.badRequest('SSRF Alert: Private or loopback IP access is strictly prohibited.');
  }

  try {
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch page: ${fetchResponse.statusText}`);
    }

    const html = await fetchResponse.text();

    // Limit response size (5MB) to protect the server
    if (html.length > 5 * 1024 * 1024) {
      throw new Error('Response payload too large');
    }

    const dom = new JSDOM(html, { url });
    const result = await scraperCore.extract(dom.window.document as any);

    if (!result) {
      return ApiResponse.success({
        extracted: false,
        product: {
          title: '',
          originalUrl: url,
          images: [],
          description: '',
        }
      });
    }

    return ApiResponse.success({
      extracted: true,
      product: result.product,
    });
  } catch (error: any) {
    // Return extracted: false so the client fallback UI is triggered cleanly
    return ApiResponse.success({
      extracted: false,
      product: {
        title: '',
        originalUrl: url,
        images: [],
        description: '',
      },
      error: error.message,
    });
  }
});
