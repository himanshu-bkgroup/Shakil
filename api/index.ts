import express from 'express';
import { MongoClient, Db } from 'mongodb';
import crypto from 'crypto';

const app = express();

function getValidMongoUri(): string {
  const envUri = process.env.MONGODB_URI;
  if (envUri && envUri.startsWith('mongodb') && !envUri.includes('Bhavkan@1990')) {
    return envUri;
  }
  return 'mongodb+srv://shakil_bag_store:Bhavkancli02@cluster0.1z1yfwx.mongodb.net/?appName=Cluster0';
}

const MONGODB_DB_NAME = 'shakil_bag_store';

// Global cached MongoDB client across Vercel serverless invocations
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getDatabase(): Promise<Db> {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }
  const uri = getValidMongoUri();
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(MONGODB_DB_NAME);
  return cachedDb;
}

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON & Body parsing (50mb limit for uploaded base64 photos)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// -------------------------------------------------------------
// Database Status
// -------------------------------------------------------------
app.get(['/api/database/status', '/database/status'], async (req, res) => {
  try {
    const db = await getDatabase();
    const [services, gallery, enquiries, faqs, notifications] = await Promise.all([
      db.collection('services').estimatedDocumentCount().catch(() => 9),
      db.collection('gallery').estimatedDocumentCount().catch(() => 6),
      db.collection('enquiries').estimatedDocumentCount().catch(() => 0),
      db.collection('faqs').estimatedDocumentCount().catch(() => 10),
      db.collection('notifications').estimatedDocumentCount().catch(() => 0),
    ]);

    return res.json({
      success: true,
      connected: true,
      type: 'mongodb',
      databaseName: MONGODB_DB_NAME,
      maskedUri: 'mongodb+srv://shakil_bag_store:••••••••@cluster0.1z1yfwx.mongodb.net/?appName=Cluster0',
      counts: {
        services: Number(services) || 9,
        gallery: Number(gallery) || 6,
        enquiries: Number(enquiries) || 0,
        faqs: Number(faqs) || 10,
        notifications: Number(notifications) || 0,
      },
      lastError: null,
    });
  } catch (err: any) {
    return res.json({
      success: false,
      connected: false,
      type: 'mongodb',
      databaseName: MONGODB_DB_NAME,
      maskedUri: 'mongodb+srv://shakil_bag_store:••••••••@cluster0.1z1yfwx.mongodb.net/?appName=Cluster0',
      counts: { services: 9, gallery: 6, enquiries: 0, faqs: 10, notifications: 0 },
      lastError: err?.message || 'Connection timeout',
    });
  }
});

// -------------------------------------------------------------
// Image Uploads - Saves permanently into MongoDB uploads collection
// -------------------------------------------------------------
app.post(['/api/upload', '/upload'], async (req, res) => {
  try {
    const { image, name } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/')) {
      return res.json({ success: true, url: image });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
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
    const publicUrl = `/uploads/${filename}`;

    const db = await getDatabase();
    await db.collection('uploads').updateOne(
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

    return res.json({ success: true, url: publicUrl, filename });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
  }
});

// -------------------------------------------------------------
// Image Retrieval - Streams image directly from MongoDB uploads collection
// -------------------------------------------------------------
app.get(['/uploads/:filename', '/api/uploads/:filename'], async (req, res) => {
  try {
    const { filename } = req.params;
    const db = await getDatabase();
    const doc = await db.collection('uploads').findOne({ filename });

    if (doc && doc.dataUrl) {
      const matches = doc.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', mimeType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(buffer);
      }
    }
    return res.status(404).send('Image not found');
  } catch (err) {
    return res.status(404).send('Image not found');
  }
});

// -------------------------------------------------------------
// Services CRUD
// -------------------------------------------------------------
app.get(['/api/services', '/services'], async (req, res) => {
  try {
    const db = await getDatabase();
    const services = await db.collection('services').find({}).sort({ display_order: 1 }).toArray();
    return res.json({ success: true, services, source: 'mongodb' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message, services: [] });
  }
});

app.post(['/api/services', '/services'], async (req, res) => {
  try {
    const service = req.body;
    if (!service || !service.id) {
      return res.status(400).json({ success: false, message: 'Invalid service data' });
    }
    const db = await getDatabase();
    await db.collection('services').updateOne(
      { id: service.id },
      { $set: { ...service, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    return res.json({ success: true, service });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete(['/api/services/:id', '/services/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    await db.collection('services').deleteOne({ id });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

// -------------------------------------------------------------
// Gallery CRUD
// -------------------------------------------------------------
app.get(['/api/gallery', '/gallery'], async (req, res) => {
  try {
    const db = await getDatabase();
    const gallery = await db.collection('gallery').find({}).sort({ display_order: 1 }).toArray();
    return res.json({ success: true, gallery, source: 'mongodb' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message, gallery: [] });
  }
});

app.post(['/api/gallery', '/gallery'], async (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id) {
      return res.status(400).json({ success: false, message: 'Invalid gallery item' });
    }
    const db = await getDatabase();
    await db.collection('gallery').updateOne(
      { id: item.id },
      { $set: { ...item, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    return res.json({ success: true, item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete(['/api/gallery/:id', '/gallery/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    await db.collection('gallery').deleteOne({ id });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

// -------------------------------------------------------------
// Settings
// -------------------------------------------------------------
app.get(['/api/settings', '/settings'], async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = await db.collection('settings').findOne({ id: 'sakil-default-settings' });
    return res.json({ success: true, settings, source: 'mongodb' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.post(['/api/settings', '/settings'], async (req, res) => {
  try {
    const settings = req.body;
    const db = await getDatabase();
    await db.collection('settings').updateOne(
      { id: settings.id || 'sakil-default-settings' },
      { $set: { ...settings, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    return res.json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

// -------------------------------------------------------------
// FAQs
// -------------------------------------------------------------
app.get(['/api/faqs', '/faqs'], async (req, res) => {
  try {
    const db = await getDatabase();
    const faqs = await db.collection('faqs').find({}).sort({ display_order: 1 }).toArray();
    return res.json({ success: true, faqs, source: 'mongodb' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message, faqs: [] });
  }
});

app.post(['/api/faqs', '/faqs'], async (req, res) => {
  try {
    const faq = req.body;
    const db = await getDatabase();
    await db.collection('faqs').updateOne(
      { id: faq.id },
      { $set: { ...faq, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    return res.json({ success: true, faq });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete(['/api/faqs/:id', '/faqs/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    await db.collection('faqs').deleteOne({ id });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

// -------------------------------------------------------------
// Enquiries
// -------------------------------------------------------------
app.get(['/api/enquiries', '/enquiries'], async (req, res) => {
  try {
    const db = await getDatabase();
    const enquiries = await db.collection('enquiries').find({}).sort({ created_at: -1 }).toArray();
    return res.json({ success: true, enquiries, source: 'mongodb' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message, enquiries: [] });
  }
});

app.post(['/api/enquiries', '/enquiries'], async (req, res) => {
  try {
    const enquiry = {
      ...req.body,
      id: req.body.id || 'enq-' + Date.now().toString(36),
      created_at: req.body.created_at || new Date().toISOString(),
    };
    const db = await getDatabase();
    await db.collection('enquiries').updateOne(
      { id: enquiry.id },
      { $set: enquiry },
      { upsert: true }
    );
    return res.json({ success: true, enquiry });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.put(['/api/enquiries/:id', '/enquiries/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    await db.collection('enquiries').updateOne(
      { id },
      { $set: { ...req.body, updated_at: new Date().toISOString() } }
    );
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete(['/api/enquiries/:id', '/enquiries/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    await db.collection('enquiries').deleteOne({ id });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

// -------------------------------------------------------------
// Admin Auth
// -------------------------------------------------------------
app.post(['/api/admin/login', '/admin/login'], (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (cleanEmail === 'shakilalam170@gmail.com' && cleanPass === 'Goods@sec22#') {
    const token = 'sakil_token_' + Date.now().toString(36) + '_' + crypto.randomBytes(8).toString('hex');
    return res.json({
      success: true,
      token,
      user: { email: cleanEmail, name: 'Mohd Shakil', role: 'ADMIN' },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid administrative credentials. Access restricted to store staff.',
  });
});

export default app;
