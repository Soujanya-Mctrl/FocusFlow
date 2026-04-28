/**
 * LocalStorage utility for large files using IndexedDB.
 * This allows us to store user-uploaded videos locally on their device
 * without hitting any server storage or bandwidth limits.
 */

const DB_NAME = 'FocusFlowAssets';
const DB_VERSION = 2;
const STORE_NAME = 'custom-backgrounds';
const KEY_NAME = 'user-custom-video';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveCustomVideo = async (file: File): Promise<void> => {
    console.log('IndexedDB: Opening database for write...');
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        console.log('IndexedDB: Putting file into store...');
        const request = store.put(file, KEY_NAME);

        request.onsuccess = () => {
            console.log('IndexedDB: Success! File saved.');
            resolve();
        };
        request.onerror = () => {
            console.error('IndexedDB: Error saving file:', request.error);
            reject(request.error);
        };
    });
};

export const getCustomVideo = async (): Promise<File | null> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(KEY_NAME);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('Failed to get custom video from IndexedDB', e);
        return null;
    }
};

export const clearCustomVideo = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(KEY_NAME);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
