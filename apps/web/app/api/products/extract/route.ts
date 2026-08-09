import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { scraperCore } from '@wishhub/scraper';
import { JSDOM } from 'jsdom';
import { z } from 'zod';

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
