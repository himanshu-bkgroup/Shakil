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

dotenv.config();

const app = express();
const PORT = 3000;

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
    if (result.success) {
      // Auto-migrate current data to MongoDB so nothing is lost
      const store = readStore();
      await syncStoreToMongo(store);
    }

    const status = await getDatabaseStatus();
    res.json({ ...result, status });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
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
      console.error('Error fetching data from MongoDB, falling back:', err);
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

  res.json({ success: true });
});

// Image Upload Endpoint: converts base64 to real static file in public/uploads/
app.post('/api/upload', (req, res) => {
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

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${filename}`;

    console.log(`[Upload] Image saved to ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Error handling /api/upload:', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
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
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
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
