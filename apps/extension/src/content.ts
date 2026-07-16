import { scraperService, normalizeProduct } from '@wishhub/scraper';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_PRODUCT') {
    scraperService.extract(document).then((result) => {
      if (result) {
        // Normalize the product data before sending back to popup
        result.product = normalizeProduct(result.product) as any;
      }
      sendResponse(result);
    }).catch(err => {
      console.error('Extraction error:', err);
      sendResponse(null);
    });
    return true; // Keep channel open for async response
  }
});
