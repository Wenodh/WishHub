import { WishHubSDK } from '@wishhub/sdk';
import { getStorage, updateStorage, QueuedSave } from './lib/storage';
import { telemetry } from './lib/telemetry';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';
const sdk = new WishHubSDK(API_URL);

// Alarm name for periodic retry
const RETRY_ALARM = 'retry-offline-queue';

/**
 * Initialize background script
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('WishHub Extension installed');
  // Set up periodic retry every 15 minutes
  chrome.alarms.create(RETRY_ALARM, { periodInMinutes: 15 });
});

/**
 * Handle alarms
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === RETRY_ALARM) {
    processQueue();
  }
});

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'PROCESS_QUEUE') {
    processQueue().then(sendResponse);
    return true;
  }

  if (message.action === 'DISMISS_FAILED_ITEM') {
    dismissItem(message.id).then(sendResponse);
    return true;
  }
});

/**
 * Process the offline queue
 */
async function processQueue() {
  if (!navigator.onLine) return { success: false, reason: 'offline' };

  const storage = await getStorage();
  const queue = storage.data.offlineQueue;

  if (queue.length === 0) return { success: true, processed: 0 };

  console.log(`Processing offline queue: ${queue.length} items`);

  const updatedQueue: QueuedSave[] = [...queue];
  let successCount = 0;

  for (let i = 0; i < updatedQueue.length; i++) {
    const item = updatedQueue[i];
    if (!item) continue;

    if (item.status === 'pending' || item.status === 'failed') {
      try {
        await sdk.products.save({
          name: item.product.title,
          url: item.product.originalUrl,
          images: item.product.images,
          price: item.product.price,
          currency: item.product.currency,
          storeName: item.product.store,
          description: item.product.description,
          rawMetadata: item.product.rawMetadata,
          wishlistId: item.wishlistId,
        } as any);

        // Success! Remove from queue
        updatedQueue.splice(i, 1);
        i--;
        successCount++;
        telemetry.emit('RetrySucceeded', { productId: item.id });
      } catch (error: any) {
        console.error(`Failed to retry save for ${item.id}:`, error);
        item.attempts++;
        item.status = 'failed';
        item.lastError = error.message || 'Unknown error';
        telemetry.emit('RetryFailed', { productId: item.id, error: item.lastError });
      }
    }
  }

  await updateStorage(() => ({
    offlineQueue: updatedQueue
  }));

  return { success: true, processed: successCount };
}

/**
 * Remove an item from the queue
 */
async function dismissItem(id: string) {
  await updateStorage((data) => ({
    offlineQueue: data.offlineQueue.filter(item => item.id !== id)
  }));
  return { success: true };
}

// Check connectivity and process queue when coming back online
if (typeof self !== 'undefined' && 'addEventListener' in self) {
    self.addEventListener('online', () => {
        processQueue();
    });
}
