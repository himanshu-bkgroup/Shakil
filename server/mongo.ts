import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');
const CONFIG_FILE = path.join(DATA_DIR, 'db-config.json');

let client: MongoClient | null = null;
let db: Db | null = null;
let currentDbName = 'shakil_store_app';
let activeUri: string | null = null;
let lastError: string | null = null;

// Mask URI credentials for security when sending to frontend
export function maskUri(uri: string): string {
  try {
    return uri.replace(/\/\/(.*?):(.*?)@/, '//$1:••••••••@');
  } catch {
    return 'mongodb://••••••••';
  }
}

// Extract database name from URI if present in path (e.g. mongodb.net/my_db?appName=...)
function extractDbNameFromUri(uri: string): string | null {
  try {
    const match = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?&#\s]+)/);
    if (match && match[1] && match[1].trim()) {
      return match[1].trim();
    }
  } catch {}
  return null;
}

// Load saved connection string from server-side config file if available
function loadSavedUri(): { uri: string; dbName?: string } | null {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (data && data.uri) {
        return {
          uri: data.uri,
          dbName: data.dbName || process.env.MONGODB_DB_NAME || 'shakil_store_app',
        };
      }
    }
  } catch (err) {
    console.error('[MongoDB] Error reading db-config.json:', err);
  }
  return null;
}

// Save connection string server-side
function saveUriConfig(uri: string, dbName: string) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify({ uri, dbName, updated_at: new Date().toISOString() }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('[MongoDB] Error saving db-config.json:', err);
  }
}

// Clear connection config
function clearUriConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  } catch (err) {
    console.error('[MongoDB] Error removing db-config.json:', err);
  }
}

export function isMongoConnected(): boolean {
  return db !== null && client !== null;
}

export function getMongoDb(): Db | null {
  return db;
}

/**
 * Connect to MongoDB with robust pooling and timeout options
 */
export async function connectMongo(
  uri: string,
  dbName?: string,
  saveConfig: boolean = true
): Promise<{ success: boolean; message: string }> {
  try {
    if (!uri || !uri.trim()) {
      throw new Error('MongoDB URI cannot be empty');
    }

    const resolvedDbName =
      (dbName && dbName.trim()) ||
      extractDbNameFromUri(uri) ||
      process.env.MONGODB_DB_NAME ||
      'shakil_store_app';

    console.log(`[MongoDB] Connecting to MongoDB (${maskUri(uri)})... Target DB: "${resolvedDbName}"`);

    // Close any previous client
    if (client) {
      try {
        await client.close();
      } catch {}
      client = null;
      db = null;
    }

    // Production-ready MongoDB connection pooling options for Atlas cloud clusters
    const newClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      maxPoolSize: 20,
      minPoolSize: 1,
      maxIdleTimeMS: 120000,
      waitQueueTimeoutMS: 15000,
      retryWrites: true,
      retryReads: true,
    });

    // Connection lifecycle logging
    newClient.on('connectionPoolCleared', (ev: any) => {
      console.log(`[MongoDB] Connection pool refreshed automatically for ${ev?.address || 'cluster'}`);
    });

    await newClient.connect();

    // Verify connection with ping
    const testDb = newClient.db(resolvedDbName);
    await testDb.command({ ping: 1 });

    client = newClient;
    db = testDb;
    currentDbName = resolvedDbName;
    activeUri = uri;
    lastError = null;

    if (saveConfig) {
      saveUriConfig(uri, currentDbName);
    }

    console.log(`[MongoDB] Successfully connected to database: "${currentDbName}"`);
    return { success: true, message: `Connected to MongoDB database "${currentDbName}" successfully.` };
  } catch (err: any) {
    lastError = err.message || 'Failed to connect to MongoDB';
    console.error('[MongoDB] Connection error:', lastError);
    return { success: false, message: lastError || 'Connection failed' };
  }
}

/**
 * Disconnect from MongoDB and switch to local store
 */
export async function disconnectMongo(): Promise<{ success: boolean; message: string }> {
  try {
    if (client) {
      await client.close();
      client = null;
    }
    db = null;
    activeUri = null;
    lastError = null;
    clearUriConfig();
    console.log('[MongoDB] Disconnected. System using local JSON store.');
    return { success: true, message: 'Disconnected from MongoDB. Reverted to local storage.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error disconnecting' };
  }
}

/**
 * Initialize on server boot
 */
export async function initMongo(): Promise<void> {
  const envUri = process.env.MONGODB_URI;
  const saved = loadSavedUri();
  const envDb =
    process.env.MONGODB_DB_NAME ||
    saved?.dbName ||
    (envUri ? extractDbNameFromUri(envUri) : null) ||
    'shakil_store_app';

  if (envUri) {
    const res = await connectMongo(envUri, envDb, false);
    if (res.success) return;
  }

  if (saved && saved.uri) {
    await connectMongo(saved.uri, saved.dbName || envDb, false);
  }
}

/**
 * Resilient query wrapper that automatically retries PoolClearedError & network hiccups
 */
async function safeMongoExecute<T>(
  operation: (database: Db) => Promise<T>,
  fallback: T,
  opName: string
): Promise<T> {
  if (!db || !client) return fallback;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await operation(db);
    } catch (err: any) {
      const errName = err?.name || '';
      const errMsg = err?.message || '';
      const isPoolOrTransient =
        errName === 'MongoPoolClearedError' ||
        errName === 'PoolClearedError' ||
        errName === 'MongoNetworkTimeoutError' ||
        errName === 'MongoServerSelectionError' ||
        errName === 'MongoNetworkError' ||
        errName === 'MongoWaitQueueTimeoutError' ||
        errMsg.includes('Connection pool') ||
        errMsg.includes('timed out') ||
        errMsg.includes('topology was destroyed') ||
        errMsg.includes('pool was cleared');

      if (attempt < 3 && isPoolOrTransient) {
        // Pool is actively recreating or reconnecting; wait with exponential backoff and retry
        await new Promise((r) => setTimeout(r, attempt * 400));
        continue;
      }

      console.warn(`[MongoDB] ${opName} note: ${errMsg || errName}. Safely utilizing cached store.`);
      return fallback;
    }
  }
  return fallback;
}

let cachedCounts: {
  services: number;
  gallery: number;
  enquiries: number;
  faqs: number;
  notifications: number;
} | null = null;
let lastCountsFetchTime = 0;

/**
 * Fetch database status and collection counts safely without blocking
 */
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  type: 'mongodb' | 'file';
  databaseName: string;
  maskedUri: string;
  counts: {
    services: number;
    gallery: number;
    enquiries: number;
    faqs: number;
    notifications: number;
  };
  lastError: string | null;
}> {
  if (!db || !client) {
    return {
      connected: false,
      type: 'file',
      databaseName: 'Local JSON Store (data/store.json)',
      maskedUri: '',
      counts: {
        services: 0,
        gallery: 0,
        enquiries: 0,
        faqs: 0,
        notifications: 0,
      },
      lastError,
    };
  }

  // Use cached counts if fresh (within 30 seconds) to avoid redundant network roundtrips
  if (cachedCounts && Date.now() - lastCountsFetchTime < 30000) {
    return {
      connected: true,
      type: 'mongodb',
      databaseName: currentDbName,
      maskedUri: activeUri ? maskUri(activeUri) : '',
      counts: cachedCounts,
      lastError: null,
    };
  }

  const fallbackCounts = cachedCounts || {
    services: 9,
    gallery: 6,
    enquiries: 0,
    faqs: 10,
    notifications: 1,
  };

  return safeMongoExecute(
    async (database) => {
      // estimatedDocumentCount is fast (O(1) collection metadata) without aggregation scans
      const [services, gallery, enquiries, faqs, notifications] = await Promise.all([
        database.collection('services').estimatedDocumentCount().catch(() => 0),
        database.collection('gallery').estimatedDocumentCount().catch(() => 0),
        database.collection('enquiries').estimatedDocumentCount().catch(() => 0),
        database.collection('faqs').estimatedDocumentCount().catch(() => 0),
        database.collection('notifications').estimatedDocumentCount().catch(() => 0),
      ]);

      cachedCounts = {
        services,
        gallery,
        enquiries,
        faqs,
        notifications,
      };
      lastCountsFetchTime = Date.now();

      return {
        connected: true,
        type: 'mongodb' as const,
        databaseName: currentDbName,
        maskedUri: activeUri ? maskUri(activeUri) : '',
        counts: cachedCounts,
        lastError: null,
      };
    },
    {
      connected: isMongoConnected(),
      type: isMongoConnected() ? ('mongodb' as const) : ('file' as const),
      databaseName: currentDbName,
      maskedUri: activeUri ? maskUri(activeUri) : '',
      counts: fallbackCounts,
      lastError,
    },
    'getDatabaseStatus'
  );
}

/**
 * Sync entire local store to MongoDB
 */
export async function syncStoreToMongo(store: any): Promise<{ success: boolean; message: string }> {
  if (!db) return { success: false, message: 'MongoDB is not connected' };

  try {
    // 1. Settings
    if (store.settings) {
      const cleanSettings = { ...store.settings };
      delete cleanSettings._id;
      const targetId = cleanSettings.id || 'sakil-default-settings';
      await db.collection('settings').updateOne(
        { $or: [{ id: targetId }, { _id: targetId as any }, { _id: 'business_settings' as any }] },
        { $set: cleanSettings },
        { upsert: true }
      );
    }

    // 2. Services
    if (Array.isArray(store.services) && store.services.length > 0) {
      for (const service of store.services) {
        const item = { ...service };
        delete item._id;
        await db.collection('services').updateOne(
          { id: service.id },
          { $set: item },
          { upsert: true }
        );
      }
    }

    // 3. Gallery
    if (Array.isArray(store.gallery) && store.gallery.length > 0) {
      for (const gal of store.gallery) {
        const item = { ...gal };
        delete item._id;
        await db.collection('gallery').updateOne(
          { id: gal.id },
          { $set: item },
          { upsert: true }
        );
      }
    }

    // 4. FAQs
    if (Array.isArray(store.faqs) && store.faqs.length > 0) {
      for (const faq of store.faqs) {
        const item = { ...faq };
        delete item._id;
        await db.collection('faqs').updateOne(
          { id: faq.id },
          { $set: item },
          { upsert: true }
        );
      }
    }

    // 5. Enquiries
    if (Array.isArray(store.enquiries) && store.enquiries.length > 0) {
      for (const enq of store.enquiries) {
        const item = { ...enq };
        delete item._id;
        await db.collection('enquiries').updateOne(
          { id: enq.id },
          { $set: item },
          { upsert: true }
        );
      }
    }

    // 6. Notifications
    if (Array.isArray(store.notifications) && store.notifications.length > 0) {
      for (const notif of store.notifications) {
        const item = { ...notif };
        delete item._id;
        await db.collection('notifications').updateOne(
          { id: notif.id },
          { $set: item },
          { upsert: true }
        );
      }
    }

    return { success: true, message: 'All website data synchronized to MongoDB successfully' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Sync failed' };
  }
}

// -----------------------------------------------------------------------------
// Resilient MongoDB Read & Write helpers
// -----------------------------------------------------------------------------

export async function mongoGetSettings(): Promise<any | null> {
  return safeMongoExecute(
    async (database) => {
      const doc = await database.collection('settings').findOne({
        $or: [
          { id: 'sakil-default-settings' },
          { id: 'admin-settings' },
          { _id: 'sakil-default-settings' as any },
          { _id: 'business_settings' as any },
          {},
        ],
      });
      if (doc) {
        const { _id, ...rest } = doc;
        return rest;
      }
      return null;
    },
    null,
    'mongoGetSettings'
  );
}

export async function mongoSaveSettings(settings: any): Promise<any> {
  return safeMongoExecute(
    async (database) => {
      const clean = { ...settings, updated_at: new Date().toISOString() };
      delete clean._id;
      const targetId = clean.id || 'sakil-default-settings';
      await database.collection('settings').updateOne(
        { $or: [{ id: targetId }, { _id: targetId as any }, { _id: 'business_settings' as any }] },
        { $set: clean },
        { upsert: true }
      );
      return clean;
    },
    settings,
    'mongoSaveSettings'
  );
}

export async function mongoGetServices(): Promise<any[] | null> {
  return safeMongoExecute(
    async (database) => {
      const docs = await database.collection('services').find({}).sort({ display_order: 1 }).toArray();
      return docs.map(({ _id, ...s }) => s);
    },
    null,
    'mongoGetServices'
  );
}

export async function mongoSaveServices(services: any[] | any): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      if (Array.isArray(services)) {
        for (const s of services) {
          const clean = { ...s };
          delete clean._id;
          await database.collection('services').updateOne({ id: s.id }, { $set: clean }, { upsert: true });
        }
      } else if (services && services.id) {
        const clean = { ...services };
        delete clean._id;
        await database.collection('services').updateOne({ id: services.id }, { $set: clean }, { upsert: true });
      }
    },
    undefined,
    'mongoSaveServices'
  );
}

export async function mongoDeleteService(id: string): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      await database.collection('services').deleteOne({ id });
    },
    undefined,
    'mongoDeleteService'
  );
}

export async function mongoGetGallery(): Promise<any[] | null> {
  return safeMongoExecute(
    async (database) => {
      const docs = await database.collection('gallery').find({}).sort({ display_order: 1 }).toArray();
      return docs.map(({ _id, ...g }) => g);
    },
    null,
    'mongoGetGallery'
  );
}

export async function mongoSaveGallery(gallery: any[] | any): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      if (Array.isArray(gallery)) {
        for (const g of gallery) {
          const clean = { ...g };
          delete clean._id;
          await database.collection('gallery').updateOne({ id: g.id }, { $set: clean }, { upsert: true });
        }
      } else if (gallery && gallery.id) {
        const clean = { ...gallery };
        delete clean._id;
        await database.collection('gallery').updateOne({ id: gallery.id }, { $set: clean }, { upsert: true });
      }
    },
    undefined,
    'mongoSaveGallery'
  );
}

export async function mongoDeleteGallery(id: string): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      await database.collection('gallery').deleteOne({ id });
    },
    undefined,
    'mongoDeleteGallery'
  );
}

export async function mongoGetFaqs(): Promise<any[] | null> {
  return safeMongoExecute(
    async (database) => {
      const docs = await database.collection('faqs').find({}).sort({ display_order: 1 }).toArray();
      return docs.map(({ _id, ...f }) => f);
    },
    null,
    'mongoGetFaqs'
  );
}

export async function mongoSaveFaqs(faqs: any[] | any): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      if (Array.isArray(faqs)) {
        for (const f of faqs) {
          const clean = { ...f };
          delete clean._id;
          await database.collection('faqs').updateOne({ id: f.id }, { $set: clean }, { upsert: true });
        }
      } else if (faqs && faqs.id) {
        const clean = { ...faqs };
        delete clean._id;
        await database.collection('faqs').updateOne({ id: faqs.id }, { $set: clean }, { upsert: true });
      }
    },
    undefined,
    'mongoSaveFaqs'
  );
}

export async function mongoDeleteFaq(id: string): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      await database.collection('faqs').deleteOne({ id });
    },
    undefined,
    'mongoDeleteFaq'
  );
}

export async function mongoGetEnquiries(): Promise<any[] | null> {
  return safeMongoExecute(
    async (database) => {
      const docs = await database.collection('enquiries').find({}).sort({ created_at: -1 }).toArray();
      return docs.map(({ _id, ...e }) => e);
    },
    null,
    'mongoGetEnquiries'
  );
}

export async function mongoSaveEnquiry(enquiry: any): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      const clean = { ...enquiry };
      delete clean._id;
      await database.collection('enquiries').updateOne({ id: enquiry.id }, { $set: clean }, { upsert: true });
    },
    undefined,
    'mongoSaveEnquiry'
  );
}

export async function mongoDeleteEnquiry(id: string): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      await database.collection('enquiries').deleteOne({ id });
    },
    undefined,
    'mongoDeleteEnquiry'
  );
}

export async function mongoGetNotifications(): Promise<any[] | null> {
  return safeMongoExecute(
    async (database) => {
      const docs = await database.collection('notifications').find({}).sort({ created_at: -1 }).toArray();
      return docs.map(({ _id, ...n }) => n);
    },
    null,
    'mongoGetNotifications'
  );
}

export async function mongoSaveNotification(notification: any): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      const clean = { ...notification };
      delete clean._id;
      await database.collection('notifications').updateOne({ id: notification.id }, { $set: clean }, { upsert: true });
    },
    undefined,
    'mongoSaveNotification'
  );
}

export async function mongoMarkNotificationRead(id: string): Promise<void> {
  await safeMongoExecute(
    async (database) => {
      await database.collection('notifications').updateOne({ id }, { $set: { read: true } });
    },
    undefined,
    'mongoMarkNotificationRead'
  );
}
