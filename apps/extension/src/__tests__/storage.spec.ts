import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStorage, setStorage, updateStorage, STORAGE_VERSION } from '../lib/storage';

const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', mockChrome);

describe('Storage Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default storage when empty', async () => {
    mockChrome.storage.local.get.mockResolvedValue({});
    const storage = await getStorage();
    expect(storage.version).toBe(STORAGE_VERSION);
    expect(storage.data.offlineQueue).toEqual([]);
  });

  it('should set storage', async () => {
    const testData = { version: 1, data: { offlineQueue: [], recentStores: [] } } as any;
    await setStorage(testData);
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ wishhub_storage: testData });
  });

  it('should update storage', async () => {
    mockChrome.storage.local.get.mockResolvedValue({
      wishhub_storage: { version: 1, data: { offlineQueue: [], recentStores: ['amazon.com'] } }
    });

    await updateStorage((data) => ({
      recentStores: [...data.recentStores, 'ebay.com']
    }));

    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
      wishhub_storage: expect.objectContaining({
        data: expect.objectContaining({
          recentStores: ['amazon.com', 'ebay.com']
        })
      })
    });
  });
});
