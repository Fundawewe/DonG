import { DialInLog, EspressoRecipe, ShotTimerSession, OfflineSyncItem, OfflineStorageStats } from '../types';

const DB_NAME = 'barista_os_offline_db';
const DB_VERSION = 2;

export const STORES = {
  DIAL_IN_LOGS: 'dial_in_logs',
  RECIPES: 'espresso_recipes',
  TIMER_SESSIONS: 'shot_timer_sessions',
  SYNC_QUEUE: 'offline_sync_queue',
  SYSTEM_STATE: 'system_state',
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Initializes and opens the IndexedDB instance for Barista OS
 */
export async function getOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[BaristaOS IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Dial-in logs store
      if (!db.objectStoreNames.contains(STORES.DIAL_IN_LOGS)) {
        const dialInStore = db.createObjectStore(STORES.DIAL_IN_LOGS, { keyPath: 'id' });
        dialInStore.createIndex('timestamp', 'timestamp', { unique: false });
        dialInStore.createIndex('recipeId', 'recipeId', { unique: false });
        dialInStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // 2. Recipes store
      if (!db.objectStoreNames.contains(STORES.RECIPES)) {
        const recipeStore = db.createObjectStore(STORES.RECIPES, { keyPath: 'id' });
        recipeStore.createIndex('name', 'name', { unique: false });
        recipeStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // 3. Shot timer sessions store
      if (!db.objectStoreNames.contains(STORES.TIMER_SESSIONS)) {
        const timerStore = db.createObjectStore(STORES.TIMER_SESSIONS, { keyPath: 'id' });
        timerStore.createIndex('timestamp', 'timestamp', { unique: false });
        timerStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // 4. Offline sync queue
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('status', 'status', { unique: false });
      }

      // 5. System state (cached metadata, active branch, active barista, etc.)
      if (!db.objectStoreNames.contains(STORES.SYSTEM_STATE)) {
        db.createObjectStore(STORES.SYSTEM_STATE, { keyPath: 'key' });
      }
    };
  });
}

// ================= DIAL-IN LOGS =================

export async function idbSaveDialInLog(log: DialInLog, isOffline: boolean = false): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction([STORES.DIAL_IN_LOGS, STORES.SYNC_QUEUE], 'readwrite');
  
  const dialInStore = tx.objectStore(STORES.DIAL_IN_LOGS);
  const queueStore = tx.objectStore(STORES.SYNC_QUEUE);

  const enrichedLog: DialInLog = {
    ...log,
    syncStatus: isOffline ? 'pending' : 'synced'
  };

  dialInStore.put(enrichedLog);

  if (isOffline) {
    const queueItem: OfflineSyncItem = {
      id: `queue-dialin-${log.id}`,
      entityType: 'dial-in',
      action: 'create',
      payload: enrichedLog,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    queueStore.put(queueItem);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbBulkSaveDialInLogs(logs: DialInLog[]): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction(STORES.DIAL_IN_LOGS, 'readwrite');
  const store = tx.objectStore(STORES.DIAL_IN_LOGS);

  for (const log of logs) {
    store.put({
      ...log,
      syncStatus: log.syncStatus || 'synced'
    });
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetAllDialInLogs(): Promise<DialInLog[]> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.DIAL_IN_LOGS, 'readonly');
    const store = tx.objectStore(STORES.DIAL_IN_LOGS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// ================= ESPRESSO RECIPES =================

export async function idbSaveRecipe(recipe: EspressoRecipe, isOffline: boolean = false): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction([STORES.RECIPES, STORES.SYNC_QUEUE], 'readwrite');
  
  const recipeStore = tx.objectStore(STORES.RECIPES);
  const queueStore = tx.objectStore(STORES.SYNC_QUEUE);

  const enrichedRecipe: EspressoRecipe = {
    ...recipe,
    syncStatus: isOffline ? 'pending' : 'synced'
  };

  recipeStore.put(enrichedRecipe);

  if (isOffline) {
    const queueItem: OfflineSyncItem = {
      id: `queue-rec-${recipe.id}`,
      entityType: 'recipe',
      action: 'create',
      payload: enrichedRecipe,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    queueStore.put(queueItem);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbBulkSaveRecipes(recipes: EspressoRecipe[]): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction(STORES.RECIPES, 'readwrite');
  const store = tx.objectStore(STORES.RECIPES);

  for (const rec of recipes) {
    store.put({
      ...rec,
      syncStatus: rec.syncStatus || 'synced'
    });
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetAllRecipes(): Promise<EspressoRecipe[]> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.RECIPES, 'readonly');
    const store = tx.objectStore(STORES.RECIPES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// ================= SHOT TIMER SESSIONS =================

export async function idbSaveTimerSession(session: ShotTimerSession, isOffline: boolean = false): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction([STORES.TIMER_SESSIONS, STORES.SYNC_QUEUE], 'readwrite');
  
  const timerStore = tx.objectStore(STORES.TIMER_SESSIONS);
  const queueStore = tx.objectStore(STORES.SYNC_QUEUE);

  const enrichedSession: ShotTimerSession = {
    ...session,
    syncStatus: isOffline ? 'pending' : 'synced'
  };

  timerStore.put(enrichedSession);

  if (isOffline) {
    const queueItem: OfflineSyncItem = {
      id: `queue-timer-${session.id}`,
      entityType: 'timer-session',
      action: 'create',
      payload: enrichedSession,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    queueStore.put(queueItem);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetAllTimerSessions(): Promise<ShotTimerSession[]> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.TIMER_SESSIONS, 'readonly');
    const store = tx.objectStore(STORES.TIMER_SESSIONS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// ================= SYSTEM STATE CACHE =================

export async function idbSetSystemState<T>(key: string, value: T): Promise<void> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYSTEM_STATE, 'readwrite');
    const store = tx.objectStore(STORES.SYSTEM_STATE);
    store.put({ key, value, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetSystemState<T>(key: string): Promise<T | null> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYSTEM_STATE, 'readonly');
    const store = tx.objectStore(STORES.SYSTEM_STATE);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result ? (request.result.value as T) : null);
    };
    request.onerror = () => reject(request.error);
  });
}

// ================= OFFLINE QUEUE & SYNC =================

export async function idbGetPendingSyncQueue(): Promise<OfflineSyncItem[]> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    const request = store.getAll();

    request.onsuccess = () => {
      const items: OfflineSyncItem[] = request.result || [];
      resolve(items.filter(item => item.status === 'pending'));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function idbProcessSyncQueue(): Promise<{ syncedCount: number; errors: number }> {
  const db = await getOfflineDB();
  const tx = db.transaction(
    [STORES.SYNC_QUEUE, STORES.DIAL_IN_LOGS, STORES.RECIPES, STORES.TIMER_SESSIONS, STORES.SYSTEM_STATE],
    'readwrite'
  );

  const queueStore = tx.objectStore(STORES.SYNC_QUEUE);
  const dialInStore = tx.objectStore(STORES.DIAL_IN_LOGS);
  const recipeStore = tx.objectStore(STORES.RECIPES);
  const timerStore = tx.objectStore(STORES.TIMER_SESSIONS);
  const stateStore = tx.objectStore(STORES.SYSTEM_STATE);

  return new Promise((resolve, reject) => {
    const request = queueStore.getAll();

    request.onsuccess = () => {
      const queueItems: OfflineSyncItem[] = request.result || [];
      const pendingItems = queueItems.filter(item => item.status === 'pending');

      let syncedCount = 0;
      let errors = 0;

      for (const item of pendingItems) {
        try {
          if (item.entityType === 'dial-in') {
            const log = item.payload as DialInLog;
            dialInStore.put({ ...log, syncStatus: 'synced' });
          } else if (item.entityType === 'recipe') {
            const recipe = item.payload as EspressoRecipe;
            recipeStore.put({ ...recipe, syncStatus: 'synced' });
          } else if (item.entityType === 'timer-session') {
            const session = item.payload as ShotTimerSession;
            timerStore.put({ ...session, syncStatus: 'synced' });
          }

          // Mark queue item as synced
          queueStore.put({
            ...item,
            status: 'synced'
          });
          syncedCount++;
        } catch (err) {
          console.error('[BaristaOS Sync] Failed syncing item:', item.id, err);
          queueStore.put({
            ...item,
            status: 'failed',
            error: String(err)
          });
          errors++;
        }
      }

      // Record last sync timestamp
      stateStore.put({
        key: 'last_sync_timestamp',
        value: new Date().toISOString()
      });

      tx.oncomplete = () => resolve({ syncedCount, errors });
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}

// ================= STORAGE TELEMETRY & STATS =================

export async function idbGetStorageStats(): Promise<OfflineStorageStats> {
  const db = await getOfflineDB();
  const tx = db.transaction(
    [STORES.DIAL_IN_LOGS, STORES.RECIPES, STORES.TIMER_SESSIONS, STORES.SYNC_QUEUE, STORES.SYSTEM_STATE],
    'readonly'
  );

  const dialInStore = tx.objectStore(STORES.DIAL_IN_LOGS);
  const recipeStore = tx.objectStore(STORES.RECIPES);
  const timerStore = tx.objectStore(STORES.TIMER_SESSIONS);
  const queueStore = tx.objectStore(STORES.SYNC_QUEUE);
  const stateStore = tx.objectStore(STORES.SYSTEM_STATE);

  const [dialInCount, recipeCount, timerCount, queueItems, lastSyncReq] = await Promise.all([
    new Promise<number>(res => { const r = dialInStore.count(); r.onsuccess = () => res(r.result); }),
    new Promise<number>(res => { const r = recipeStore.count(); r.onsuccess = () => res(r.result); }),
    new Promise<number>(res => { const r = timerStore.count(); r.onsuccess = () => res(r.result); }),
    new Promise<OfflineSyncItem[]>(res => { const r = queueStore.getAll(); r.onsuccess = () => res(r.result || []); }),
    new Promise<any>(res => { const r = stateStore.get('last_sync_timestamp'); r.onsuccess = () => res(r.result); }),
  ]);

  const pendingSyncCount = queueItems.filter(item => item.status === 'pending').length;
  const lastSyncTimestamp = lastSyncReq?.value || null;

  return {
    dialInCount,
    recipeCount,
    timerSessionCount: timerCount,
    pendingSyncCount,
    lastSyncTimestamp
  };
}

export async function idbClearSyncedQueue(): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
  const store = tx.objectStore(STORES.SYNC_QUEUE);

  const request = store.getAll();
  request.onsuccess = () => {
    const items: OfflineSyncItem[] = request.result || [];
    for (const item of items) {
      if (item.status === 'synced') {
        store.delete(item.id);
      }
    }
  };
}
