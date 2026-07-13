import { ExtractionProduct, WishlistSummary } from '@wishhub/contracts';

export const STORAGE_VERSION = 1;

export interface QueuedSave {
  id: string;
  product: ExtractionProduct;
  wishlistId?: string;
  timestamp: number;
  attempts: number;
  lastError?: string;
  status: 'pending' | 'failed';
}

export interface ExtensionStorage {
  version: number;
  data: {
    lastUsedWishlistId?: string;
    wishlistsCache?: {
      items: WishlistSummary[];
      timestamp: number;
    };
    offlineQueue: QueuedSave[];
    preferences: {
      theme?: 'light' | 'dark' | 'system';
    };
    recentStores: string[];
  };
}

const DEFAULT_STORAGE: ExtensionStorage = {
  version: STORAGE_VERSION,
  data: {
    offlineQueue: [],
    preferences: {},
    recentStores: [],
  },
};

export async function getStorage(): Promise<ExtensionStorage> {
  const result = await chrome.storage.local.get('wishhub_storage');
  const stored = result.wishhub_storage as ExtensionStorage | undefined;

  if (!stored) {
    return DEFAULT_STORAGE;
  }

  if (stored.version < STORAGE_VERSION) {
    return migrateStorage(stored);
  }

  return stored;
}

export async function setStorage(storage: ExtensionStorage): Promise<void> {
  await chrome.storage.local.set({ wishhub_storage: storage });
}

export async function updateStorage(
  updater: (data: ExtensionStorage['data']) => Partial<ExtensionStorage['data']>
): Promise<void> {
  const storage = await getStorage();
  const newData = updater(storage.data);
  await setStorage({
    ...storage,
    data: {
      ...storage.data,
      ...newData,
    },
  });
}

async function migrateStorage(oldStorage: any): Promise<ExtensionStorage> {
  // Currently only version 1, so just return default or try to map old fields if they exist
  // In the future, add switch/case for versions
  const newStorage: ExtensionStorage = {
    ...DEFAULT_STORAGE,
    data: {
      ...DEFAULT_STORAGE.data,
      lastUsedWishlistId: oldStorage.lastUsedWishlistId || oldStorage.data?.lastUsedWishlistId,
    }
  };
  await setStorage(newStorage);
  return newStorage;
}
