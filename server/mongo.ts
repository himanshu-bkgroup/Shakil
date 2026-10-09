import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');
const CONFIG_FILE = path.join(DATA_DIR, 'db-config.json');

let client: MongoClient | null = null;
let db: Db | null = null;
let currentDbName = 'sakil_bag_store';
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

// Load saved connection string from server-side config file if available
function loadSavedUri(): { uri: string; dbName?: string } | null {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (data && data.uri) {
        return { uri: data.uri, dbName: data.dbName || 'sakil_bag_store' };
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
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ uri, dbName, updated_at: new Date().toISOString() }, null, 2), 'utf-8');
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
  return db !== null;
}

export function getMongoDb(): Db | null {
  return db;
}

/**
 * Connect to MongoDB with timeout and validation
 */
export async function connectMongo(uri: string, dbName: string = 'sakil_bag_store', saveConfig: boolean = true): Promise<{ success: boolean; message: string }> {
  try {
    if (!uri || !uri.trim()) {
      throw new Error('MongoDB URI cannot be empty');
    }

    console.log(`[MongoDB] Attempting connection to MongoDB (${maskUri(uri)})...`);

    // Close any previous client
    if (client) {
      try {
        await client.close();
      } catch {}
      client = null;
      db = null;
    }

    const newClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
    });

    await newClient.connect();

    // Verify connection with ping
    const testDb = newClient.db(dbName || 'sakil_bag_store');
    await testDb.command({ ping: 1 });

    client = newClient;
    db = testDb;
    currentDbName = dbName || 'sakil_bag_store';
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
  const envDb = process.env.MONGODB_DB_NAME || 'sakil_bag_store';

  if (envUri) {
    const res = await connectMongo(envUri, envDb, false);
    if (res.success) return;
  }

  const saved = loadSavedUri();
  if (saved && saved.uri) {
    await connectMongo(saved.uri, saved.dbName || 'sakil_bag_store', false);
  }
}

/**
 * Fetch database status and collection counts
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
  if (!db) {
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

  try {
    const [services, gallery, enquiries, faqs, notifications] = await Promise.all([
      db.collection('services').countDocuments().catch(() => 0),
      db.collection('gallery').countDocuments().catch(() => 0),
      db.collection('enquiries').countDocuments().catch(() => 0),
      db.collection('faqs').countDocuments().catch(() => 0),
      db.collection('notifications').countDocuments().catch(() => 0),
    ]);

    return {
      connected: true,
      type: 'mongodb',
      databaseName: currentDbName,
      maskedUri: activeUri ? maskUri(activeUri) : '',
      counts: {
        services,
        gallery,
        enquiries,
        faqs,
        notifications,
      },
      lastError: null,
    };
  } catch (err: any) {
    return {
      connected: false,
      type: 'file',
      databaseName: currentDbName,
      maskedUri: activeUri ? maskUri(activeUri) : '',
      counts: {
        services: 0,
        gallery: 0,
        enquiries: 0,
        faqs: 0,
        notifications: 0,
      },
      lastError: err.message,
    };
  }
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
      await db.collection('settings').updateOne(
        { _id: 'business_settings' as any },
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
// MongoDB Read & Write helpers
// -----------------------------------------------------------------------------

export async function mongoGetSettings(): Promise<any | null> {
  if (!db) return null;
  try {
    const doc = await db.collection('settings').findOne({ _id: 'business_settings' as any });
    if (doc) {
      const { _id, ...rest } = doc;
      return rest;
    }
  } catch (err) {
    console.error('[MongoDB] mongoGetSettings error:', err);
  }
  return null;
}

export async function mongoSaveSettings(settings: any): Promise<any> {
  if (!db) return settings;
  try {
    const clean = { ...settings, updated_at: new Date().toISOString() };
    delete clean._id;
    await db.collection('settings').updateOne(
      { _id: 'business_settings' as any },
      { $set: clean },
      { upsert: true }
    );
    return clean;
  } catch (err) {
    console.error('[MongoDB] mongoSaveSettings error:', err);
    return settings;
  }
}

export async function mongoGetServices(): Promise<any[] | null> {
  if (!db) return null;
  try {
    const docs = await db.collection('services').find({}).sort({ display_order: 1 }).toArray();
    return docs.map(({ _id, ...s }) => s);
  } catch (err) {
    console.error('[MongoDB] mongoGetServices error:', err);
    return null;
  }
}

export async function mongoSaveServices(services: any[] | any): Promise<void> {
  if (!db) return;
  try {
    if (Array.isArray(services)) {
      for (const s of services) {
        const clean = { ...s };
        delete clean._id;
        await db.collection('services').updateOne({ id: s.id }, { $set: clean }, { upsert: true });
      }
    } else if (services && services.id) {
      const clean = { ...services };
      delete clean._id;
      await db.collection('services').updateOne({ id: services.id }, { $set: clean }, { upsert: true });
    }
  } catch (err) {
    console.error('[MongoDB] mongoSaveServices error:', err);
  }
}

export async function mongoDeleteService(id: string): Promise<void> {
  if (!db) return;
  try {
    await db.collection('services').deleteOne({ id });
  } catch (err) {
    console.error('[MongoDB] mongoDeleteService error:', err);
  }
}

export async function mongoGetGallery(): Promise<any[] | null> {
  if (!db) return null;
  try {
    const docs = await db.collection('gallery').find({}).sort({ display_order: 1 }).toArray();
    return docs.map(({ _id, ...g }) => g);
  } catch (err) {
    console.error('[MongoDB] mongoGetGallery error:', err);
    return null;
  }
}

export async function mongoSaveGallery(gallery: any[] | any): Promise<void> {
  if (!db) return;
  try {
    if (Array.isArray(gallery)) {
      for (const g of gallery) {
        const clean = { ...g };
        delete clean._id;
        await db.collection('gallery').updateOne({ id: g.id }, { $set: clean }, { upsert: true });
      }
    } else if (gallery && gallery.id) {
      const clean = { ...gallery };
      delete clean._id;
      await db.collection('gallery').updateOne({ id: gallery.id }, { $set: clean }, { upsert: true });
    }
  } catch (err) {
    console.error('[MongoDB] mongoSaveGallery error:', err);
  }
}

export async function mongoDeleteGallery(id: string): Promise<void> {
  if (!db) return;
  try {
    await db.collection('gallery').deleteOne({ id });
  } catch (err) {
    console.error('[MongoDB] mongoDeleteGallery error:', err);
  }
}

export async function mongoGetFaqs(): Promise<any[] | null> {
  if (!db) return null;
  try {
    const docs = await db.collection('faqs').find({}).sort({ display_order: 1 }).toArray();
    return docs.map(({ _id, ...f }) => f);
  } catch (err) {
    console.error('[MongoDB] mongoGetFaqs error:', err);
    return null;
  }
}

export async function mongoSaveFaqs(faqs: any[] | any): Promise<void> {
  if (!db) return;
  try {
    if (Array.isArray(faqs)) {
      for (const f of faqs) {
        const clean = { ...f };
        delete clean._id;
        await db.collection('faqs').updateOne({ id: f.id }, { $set: clean }, { upsert: true });
      }
    } else if (faqs && faqs.id) {
      const clean = { ...faqs };
      delete clean._id;
      await db.collection('faqs').updateOne({ id: faqs.id }, { $set: clean }, { upsert: true });
    }
  } catch (err) {
    console.error('[MongoDB] mongoSaveFaqs error:', err);
  }
}

export async function mongoDeleteFaq(id: string): Promise<void> {
  if (!db) return;
  try {
    await db.collection('faqs').deleteOne({ id });
  } catch (err) {
    console.error('[MongoDB] mongoDeleteFaq error:', err);
  }
}

export async function mongoGetEnquiries(): Promise<any[] | null> {
  if (!db) return null;
  try {
    const docs = await db.collection('enquiries').find({}).sort({ created_at: -1 }).toArray();
    return docs.map(({ _id, ...e }) => e);
  } catch (err) {
    console.error('[MongoDB] mongoGetEnquiries error:', err);
    return null;
  }
}

export async function mongoSaveEnquiry(enquiry: any): Promise<void> {
  if (!db) return;
  try {
    const clean = { ...enquiry };
    delete clean._id;
    await db.collection('enquiries').updateOne({ id: enquiry.id }, { $set: clean }, { upsert: true });
  } catch (err) {
    console.error('[MongoDB] mongoSaveEnquiry error:', err);
  }
}

export async function mongoDeleteEnquiry(id: string): Promise<void> {
  if (!db) return;
  try {
    await db.collection('enquiries').deleteOne({ id });
  } catch (err) {
    console.error('[MongoDB] mongoDeleteEnquiry error:', err);
  }
}

export async function mongoGetNotifications(): Promise<any[] | null> {
  if (!db) return null;
  try {
    const docs = await db.collection('notifications').find({}).sort({ created_at: -1 }).toArray();
    return docs.map(({ _id, ...n }) => n);
  } catch (err) {
    console.error('[MongoDB] mongoGetNotifications error:', err);
    return null;
  }
}

export async function mongoSaveNotification(notification: any): Promise<void> {
  if (!db) return;
  try {
    const clean = { ...notification };
    delete clean._id;
    await db.collection('notifications').updateOne({ id: notification.id }, { $set: clean }, { upsert: true });
  } catch (err) {
    console.error('[MongoDB] mongoSaveNotification error:', err);
  }
}

export async function mongoMarkNotificationRead(id: string): Promise<void> {
  if (!db) return;
  try {
    await db.collection('notifications').updateOne({ id }, { $set: { read: true } });
  } catch (err) {
    console.error('[MongoDB] mongoMarkNotificationRead error:', err);
  }
}
