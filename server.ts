import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  initMongo,
  connectMongo,
  disconnectMongo,
  getDatabaseStatus,
  syncStoreToMongo,
  isMongoConnected,
  getMongoDb,
  mongoGetSettings,
  mongoSaveSettings,
  mongoGetServices,
  mongoSaveServices,
  mongoDeleteService,
  mongoGetGallery,
  mongoSaveGallery,
  mongoDeleteGallery,
  mongoGetFaqs,
  mongoSaveFaqs,
  mongoDeleteFaq,
  mongoGetEnquiries,
  mongoSaveEnquiry,
  mongoDeleteEnquiry,
  mongoGetNotifications,
  mongoSaveNotification,
  mongoMarkNotificationRead,
} from './server/mongo';

dotenv.config({ override: true });
process.env.DISABLE_HMR = 'true';

const app = express();
const PORT = 3000;

// Enable CORS for frontend clients (e.g. Netlify, preview domains)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// High payload limit for image uploads and base64 strings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const DATA_DIR = path.resolve('data');
const UPLOADS_DIR = path.resolve('public', 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Interface for persistent store
interface StoreData {
  settings: any | null;
  services: any[] | null;
  gallery: any[] | null;
  faqs: any[] | null;
  enquiries: any[];
  notifications: any[];
  updated_at?: string;
}

function readStore(): StoreData {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store.json:', err);
  }
  return {
    settings: null,
    services: null,
    gallery: null,
    faqs: null,
    enquiries: [],
    notifications: [],
    updated_at: new Date().toISOString(),
  };
}

function writeStore(data: StoreData): void {
  try {
    data.updated_at = new Date().toISOString();
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store.json:', err);
  }
}

// -------------------------------------------------------------
// Real-Time Event Stream (SSE) for Instant Multi-Device Sync
// -------------------------------------------------------------
const sseClients: express.Response[] = [];

export function broadcastRealtimeUpdate(event: string, payload?: any) {
  const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(`data: ${data}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

app.get('/api/realtime', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.push(res);
  res.write(`data: ${JSON.stringify({ event: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Dynamic route for uploaded images: serves from disk, or restores from MongoDB uploads collection
app.get('/uploads/:filename', async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // If not on local disk (e.g., container restarted), restore from MongoDB Atlas!
  if (isMongoConnected()) {
    try {
      const database = getMongoDb();
      if (database) {
        const doc = await database.collection('uploads').findOne({ filename });
        if (doc && doc.dataUrl) {
          const matches = doc.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches) {
            const buf = Buffer.from(matches[2], 'base64');
            try {
              fs.writeFileSync(filePath, buf);
            } catch {}
            res.setHeader('Content-Type', matches[1] || 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=604800');
            return res.send(buf);
          }
        }
      }
    } catch (err) {
      console.warn('[Server] Error retrieving image from MongoDB:', err);
    }
  }

  next();
});

// Serve uploaded images statically with performance caching headers
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    maxAge: '7d',
    etag: true,
  })
);

// -------------------------------------------------------------
// Database (MongoDB & Local Sync) Management APIs
// -------------------------------------------------------------

// Get real-time database connection status & metrics
app.get('/api/database/status', async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    res.json({ success: true, ...status });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Connect directly to a MongoDB Atlas or local MongoDB instance
app.post('/api/database/connect', async (req, res) => {
  try {
    const { uri, dbName } = req.body || {};
    if (!uri || !uri.trim()) {
      return res.status(400).json({ success: false, message: 'MongoDB connection string (URI) is required.' });
    }

    const result = await connectMongo(uri, dbName);
    const status = await getDatabaseStatus();

    if (!result.success) {
      return res.json({ success: false, message: result.message, status });
    }

    // Auto-migrate current data to MongoDB in background and broadcast
    const store = readStore();
    syncStoreToMongo(store)
      .then(() => {
        broadcastRealtimeUpdate('sync', { database: dbName });
      })
      .catch((err) => {
        console.warn('[MongoDB] Initial migration sync note:', err);
      });

    res.json({ ...result, status });
  } catch (err: any) {
    const status = await getDatabaseStatus().catch(() => null);
    res.status(500).json({ success: false, message: err.message, status });
  }
});

// Disconnect from MongoDB and switch to local JSON store
app.post('/api/database/disconnect', async (req, res) => {
  try {
    const result = await disconnectMongo();
    const status = await getDatabaseStatus();
    res.json({ ...result, status });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Force sync current website store into MongoDB
app.post('/api/database/sync', async (req, res) => {
  try {
    const store = readStore();
    const result = await syncStoreToMongo(store);
    const status = await getDatabaseStatus();
    res.json({ ...result, status });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Content & Entity API Endpoints (MongoDB backed with File fallback)
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected() ? 'mongodb' : 'file',
    time: new Date().toISOString(),
  });
});

// Full store snapshot
app.get('/api/data', async (req, res) => {
  const store = readStore();
  if (isMongoConnected()) {
    try {
      const [settings, services, gallery, faqs, enquiries, notifications] = await Promise.all([
        mongoGetSettings(),
        mongoGetServices(),
        mongoGetGallery(),
        mongoGetFaqs(),
        mongoGetEnquiries(),
        mongoGetNotifications(),
      ]);

      if (settings) store.settings = settings;
      if (services && services.length > 0) store.services = services;
      if (gallery && gallery.length > 0) store.gallery = gallery;
      if (faqs && faqs.length > 0) store.faqs = faqs;
      if (enquiries) store.enquiries = enquiries;
      if (notifications) store.notifications = notifications;
      writeStore(store);

      return res.json({
        settings: settings || store.settings,
        services: services && services.length > 0 ? services : store.services,
        gallery: gallery && gallery.length > 0 ? gallery : store.gallery,
        faqs: faqs && faqs.length > 0 ? faqs : store.faqs,
        enquiries: enquiries || store.enquiries || [],
        notifications: notifications || store.notifications || [],
        source: 'mongodb',
      });
    } catch (err) {
      console.warn('Error fetching data from MongoDB, falling back:', err);
    }
  }
  res.json({ ...store, source: 'file' });
});

// Bulk sync from admin client
app.post('/api/sync', async (req, res) => {
  const store = readStore();
  const { settings, services, gallery, faqs } = req.body || {};
  if (settings && !store.settings) store.settings = settings;
  if (services && (!store.services || store.services.length === 0)) store.services = services;
  if (gallery && (!store.gallery || store.gallery.length === 0)) store.gallery = gallery;
  if (faqs && (!store.faqs || store.faqs.length === 0)) store.faqs = faqs;
  writeStore(store);

  if (isMongoConnected()) {
    await syncStoreToMongo(store);
  }

  res.json({ success: true, store, source: isMongoConnected() ? 'mongodb' : 'file' });
});

// Settings
app.get('/api/settings', async (req, res) => {
  if (isMongoConnected()) {
    const mongoSettings = await mongoGetSettings();
    if (mongoSettings) {
      return res.json({ success: true, settings: mongoSettings, source: 'mongodb' });
    }
  }
  const store = readStore();
  res.json({ success: true, settings: store.settings, source: 'file' });
});

app.post('/api/settings', async (req, res) => {
  const store = readStore();
  const updatedSettings = {
    ...(store.settings || {}),
    ...req.body,
    updated_at: new Date().toISOString(),
  };

  store.settings = updatedSettings;
  writeStore(store);

  if (isMongoConnected()) {
    await mongoSaveSettings(updatedSettings);
  }

  broadcastRealtimeUpdate('settings', updatedSettings);
  res.json({ success: true, settings: updatedSettings, source: isMongoConnected() ? 'mongodb' : 'file' });
});

// Services
app.get('/api/services', async (req, res) => {
  if (isMongoConnected()) {
    const mongoServices = await mongoGetServices();
    if (mongoServices && mongoServices.length > 0) {
      return res.json({ success: true, services: mongoServices, source: 'mongodb' });
    }
  }
  const store = readStore();
  res.json({ success: true, services: store.services, source: 'file' });
});

app.post('/api/services', async (req, res) => {
  const store = readStore();
  if (Array.isArray(req.body)) {
    store.services = req.body;
  } else if (req.body && req.body.id) {
    const list = store.services || [];
    const index = list.findIndex((s: any) => s.id === req.body.id);
    if (index >= 0) {
      list[index] = req.body;
    } else {
      list.push(req.body);
    }
    store.services = list;
  }
  writeStore(store);

  if (isMongoConnected()) {
    await mongoSaveServices(req.body);
  }

  broadcastRealtimeUpdate('services', store.services);
  res.json({ success: true, services: store.services, source: isMongoConnected() ? 'mongodb' : 'file' });
});

app.delete('/api/services/:id', async (req, res) => {
  const store = readStore();
  const id = req.params.id;
  if (store.services) {
    store.services = store.services.filter((s: any) => s.id !== id);
    writeStore(store);
  }

  if (isMongoConnected()) {
    await mongoDeleteService(id);
  }

  broadcastRealtimeUpdate('services', store.services);
  res.json({ success: true, services: store.services, source: isMongoConnected() ? 'mongodb' : 'file' });
});

// Gallery
app.get('/api/gallery', async (req, res) => {
  if (isMongoConnected()) {
    const mongoGallery = await mongoGetGallery();
    if (mongoGallery && mongoGallery.length > 0) {
      return res.json({ success: true, gallery: mongoGallery, source: 'mongodb' });
    }
  }
  const store = readStore();
  res.json({ success: true, gallery: store.gallery, source: 'file' });
});

app.post('/api/gallery', async (req, res) => {
  const store = readStore();
  if (Array.isArray(req.body)) {
    store.gallery = req.body;
  } else if (req.body && req.body.id) {
    const list = store.gallery || [];
    const index = list.findIndex((g: any) => g.id === req.body.id);
    if (index >= 0) {
      list[index] = req.body;
    } else {
      list.unshift(req.body);
    }
    store.gallery = list;
  }
  writeStore(store);

  if (isMongoConnected()) {
    await mongoSaveGallery(req.body);
  }

  broadcastRealtimeUpdate('gallery', store.gallery);
  res.json({ success: true, gallery: store.gallery, source: isMongoConnected() ? 'mongodb' : 'file' });
});

app.delete('/api/gallery/:id', async (req, res) => {
  const store = readStore();
  const id = req.params.id;
  if (store.gallery) {
    store.gallery = store.gallery.filter((g: any) => g.id !== id);
    writeStore(store);
  }

  if (isMongoConnected()) {
    await mongoDeleteGallery(id);
  }

  broadcastRealtimeUpdate('gallery', store.gallery);
  res.json({ success: true, gallery: store.gallery, source: isMongoConnected() ? 'mongodb' : 'file' });
});

// FAQs
app.get('/api/faqs', async (req, res) => {
  if (isMongoConnected()) {
    const mongoFaqs = await mongoGetFaqs();
    if (mongoFaqs && mongoFaqs.length > 0) {
      return res.json({ success: true, faqs: mongoFaqs, source: 'mongodb' });
    }
  }
  const store = readStore();
  res.json({ success: true, faqs: store.faqs, source: 'file' });
});

app.post('/api/faqs', async (req, res) => {
  const store = readStore();
  if (Array.isArray(req.body)) {
    store.faqs = req.body;
  } else if (req.body && req.body.id) {
    const list = store.faqs || [];
    const index = list.findIndex((f: any) => f.id === req.body.id);
    if (index >= 0) {
      list[index] = req.body;
    } else {
      list.push(req.body);
    }
    store.faqs = list;
  }
  writeStore(store);

  if (isMongoConnected()) {
    await mongoSaveFaqs(req.body);
  }

  broadcastRealtimeUpdate('faqs', store.faqs);
  res.json({ success: true, faqs: store.faqs, source: isMongoConnected() ? 'mongodb' : 'file' });
});

app.delete('/api/faqs/:id', async (req, res) => {
  const store = readStore();
  const id = req.params.id;
  if (store.faqs) {
    store.faqs = store.faqs.filter((f: any) => f.id !== id);
    writeStore(store);
  }

  if (isMongoConnected()) {
    await mongoDeleteFaq(id);
  }

  broadcastRealtimeUpdate('faqs', store.faqs);
  res.json({ success: true, faqs: store.faqs, source: isMongoConnected() ? 'mongodb' : 'file' });
});

// Enquiries
app.get('/api/enquiries', async (req, res) => {
  if (isMongoConnected()) {
    const mongoEnquiries = await mongoGetEnquiries();
    if (mongoEnquiries) {
      return res.json({ success: true, enquiries: mongoEnquiries, source: 'mongodb' });
    }
  }
  const store = readStore();
  res.json({ success: true, enquiries: store.enquiries || [], source: 'file' });
});

app.post('/api/enquiries', async (req, res) => {
  const store = readStore();
  const newEnquiry = {
    ...req.body,
    id: req.body.id || 'enq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    created_at: req.body.created_at || new Date().toISOString(),
    status: req.body.status || 'NEW',
  };
  const list = store.enquiries || [];
  list.unshift(newEnquiry);
  store.enquiries = list;

  // Add notification
  const notif = {
    id: 'notif-' + Date.now(),
    title: 'New Enquiry Received',
    message: `${newEnquiry.name || 'Customer'} submitted a requirement for ${newEnquiry.requirement_type || 'Services'}`,
    type: 'enquiry',
    read: false,
    enquiry_id: newEnquiry.id,
    created_at: new Date().toISOString(),
  };
  const notifs = store.notifications || [];
  notifs.unshift(notif);
  store.notifications = notifs;

  writeStore(store);

  if (isMongoConnected()) {
    await mongoSaveEnquiry(newEnquiry);
    await mongoSaveNotification(notif);
  }

  broadcastRealtimeUpdate('enquiries', newEnquiry);
  broadcastRealtimeUpdate('notifications', notif);
  res.json({ success: true, enquiry: newEnquiry, source: isMongoConnected() ? 'mongodb' : 'file' });
});

app.patch('/api/enquiries/:id', async (req, res) => {
  const store = readStore();
  const id = req.params.id;
  const list = store.enquiries || [];
  const index = list.findIndex((e: any) => e.id === id);
  if (index >= 0) {
    list[index] = { ...list[index], ...req.body, updated_at: new Date().toISOString() };
    store.enquiries = list;
    writeStore(store);

    if (isMongoConnected()) {
      await mongoSaveEnquiry(list[index]);
    }
    broadcastRealtimeUpdate('enquiries', list[index]);
  }
  res.json({ success: true, enquiry: list[index], source: isMongoConnected() ? 'mongodb' : 'file' });
});

app.delete('/api/enquiries/:id', async (req, res) => {
  const store = readStore();
  const id = req.params.id;
  if (store.enquiries) {
    store.enquiries = store.enquiries.filter((e: any) => e.id !== id);
    writeStore(store);
  }

  if (isMongoConnected()) {
    await mongoDeleteEnquiry(id);
  }

  broadcastRealtimeUpdate('enquiries');
  res.json({ success: true, source: isMongoConnected() ? 'mongodb' : 'file' });
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  if (isMongoConnected()) {
    const mongoNotifs = await mongoGetNotifications();
    if (mongoNotifs) {
      return res.json({ success: true, notifications: mongoNotifs, source: 'mongodb' });
    }
  }
  const store = readStore();
  res.json({ success: true, notifications: store.notifications || [], source: 'file' });
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  const store = readStore();
  const id = req.params.id;
  if (store.notifications) {
    const target = store.notifications.find((n: any) => n.id === id);
    if (target) {
      target.read = true;
      writeStore(store);
    }
  }

  if (isMongoConnected()) {
    await mongoMarkNotificationRead(id);
  }

  broadcastRealtimeUpdate('notifications');
  res.json({ success: true });
});

// Image Upload Endpoint: converts base64 to static file AND backs up in MongoDB
app.post('/api/upload', async (req, res) => {
  try {
    const { image, name } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    // If it's already an HTTP / relative URL, return it directly
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/')) {
      return res.json({ success: true, url: image });
    }

    // Handle base64 DataURL
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // In case raw base64 string without data prefix
      return res.json({ success: true, url: image });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';

    const safeBaseName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30) : 'photo';
    const filename = `${safeBaseName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    // 1. Save to local disk for instantaneous serving
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${filename}`;

    // 2. Real-time sync with MongoDB: Save uploaded image into MongoDB uploads collection
    if (isMongoConnected()) {
      try {
        const database = getMongoDb();
        if (database) {
          await database.collection('uploads').updateOne(
            { filename },
            {
              $set: {
                filename,
                mimeType,
                dataUrl: image,
                size: buffer.length,
                url: publicUrl,
                updated_at: new Date().toISOString(),
              },
            },
            { upsert: true }
          );
          console.log(`[MongoDB] Uploaded image synced to MongoDB collection: uploads (${filename})`);
        }
      } catch (mErr) {
        console.warn('[MongoDB] Warning: Failed to backup image in MongoDB:', mErr);
      }
    }

    broadcastRealtimeUpdate('image_uploaded', { url: publicUrl, filename });
    console.log(`[Upload] Image saved to ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Error handling /api/upload:', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

// Analytics tracking endpoint
app.post('/api/analytics', async (req, res) => {
  try {
    const record = {
      ...req.body,
      id: req.body.id || 'evt-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };
    if (isMongoConnected()) {
      const database = getMongoDb();
      if (database) {
        await database.collection('analytics_events').insertOne(record);
      }
    }
    res.json({ success: true, record });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const database = getMongoDb();
      if (database) {
        const events = await database.collection('analytics_events').find({}).sort({ created_at: -1 }).limit(200).toArray();
        return res.json({ success: true, events: events.map(({ _id, ...e }) => e) });
      }
    }
    res.json({ success: true, events: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = password || '';

  // Authorized Admin Credentials for Mohd Shakil
  const isAuthorized =
    cleanEmail === 'shakilalam170@gmail.com' &&
    cleanPass === 'Goods@sec22#';

  if (!isAuthorized) {
    return res.status(401).json({
      success: false,
      message: 'Invalid administrative credentials. Access restricted to store staff.',
    });
  }

  const token = 'sakil_token_' + Date.now().toString(36) + '_' + crypto.randomBytes(8).toString('hex');
  return res.json({
    success: true,
    token,
    user: {
      email: cleanEmail,
      name: 'Mohd Shakil',
      role: 'ADMIN',
    },
  });
});

app.post('/api/admin/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// Dev & Prod Frontend Mounting
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Initialize MongoDB connection on boot (if configured via env or db-config)
  try {
    await initMongo();
  } catch (err) {
    console.warn('[Server] MongoDB initialization notice:', err);
  }

  if (isProd) {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] SAKIL BAG STORE running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal error starting server:', err);
  process.exit(1);
});
