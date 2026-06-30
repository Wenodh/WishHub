import { scraperService } from '@wishhub/scraper';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_PRODUCT') {
    scraperService.extract(document).then((result) => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }
});
