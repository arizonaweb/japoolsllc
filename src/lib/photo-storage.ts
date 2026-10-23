/**
 * Temporary photo storage using IndexedDB
 * Allows photos to persist across page reloads during the request flow
 */

const DB_NAME = 'PoolServicePhotos';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
      }
    };
  });
}

export interface StoredPhotos {
  sessionId: string;
  photos: Record<string, string>; // base64 data URLs
  timestamp: number;
  expiresAt: number;
}

/**
 * Save photos to IndexedDB with a session ID
 * Expires after 24 hours
 */
export async function savePhotosToStorage(
  sessionId: string,
  photos: Record<string, string>
): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const now = Date.now();
    const data: StoredPhotos = {
      sessionId,
      photos,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    };

    store.put(data);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to save photos'));
    });
  } catch (error) {
    console.warn('IndexedDB unavailable, falling back to sessionStorage:', error);
    sessionStorage.setItem(`poolServicePhotos_${sessionId}`, JSON.stringify(photos));
  }
}

/**
 * Retrieve photos from storage by session ID
 */
export async function getPhotosFromStorage(sessionId: string): Promise<Record<string, string> | null> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(sessionId);
      request.onsuccess = () => {
        const data = request.result as StoredPhotos | undefined;
        if (data && data.expiresAt > Date.now()) {
          resolve(data.photos);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(new Error('Failed to retrieve photos'));
    });
  } catch (error) {
    console.warn('IndexedDB retrieval failed, checking sessionStorage:', error);
    const data = sessionStorage.getItem(`poolServicePhotos_${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
}

/**
 * Clear expired photos from storage
 */
export async function clearExpiredPhotos(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const now = Date.now();
        const items = request.result as StoredPhotos[];
        items.forEach((item) => {
          if (item.expiresAt <= now) {
            store.delete(item.sessionId);
          }
        });
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to clear expired photos'));
    });
  } catch (error) {
    console.warn('Failed to clear expired photos:', error);
  }
}

/**
 * Delete photos by session ID
 */
export async function deletePhotosFromStorage(sessionId: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(sessionId);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to delete photos'));
    });
  } catch (error) {
    console.warn('Failed to delete photos from storage:', error);
    sessionStorage.removeItem(`poolServicePhotos_${sessionId}`);
  }
}
