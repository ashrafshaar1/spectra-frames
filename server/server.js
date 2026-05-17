import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// ========== MongoDB Connection ==========
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spectraframes';

let gridFsBucket;
let conn = mongoose.connection;

conn.once('open', () => {
  gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log('✅ GridFS Bucket initialized');
});

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const SERVER_URL = process.env.NODE_ENV === 'production'
  ? 'https://spectra-frames-api.onrender.com'
  : `http://localhost:${PORT}`;

// ========== Multer GridFS Storage ==========
const storage = new GridFsStorage({
  url: MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: {
            originalName: file.originalname,
            uploadDate: Date.now()
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ========== Serve Images from MongoDB ==========
app.get('/api/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    
    const files = await conn.db.collection('uploads.files').find({ filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Mongoose Schemas ==========
const portfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  coverImage: { type: String, required: true },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  icon: { type: String, default: '📷' }
});

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  serviceType: { type: String, default: '' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Models
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Client = mongoose.model('Client', clientSchema);
const Partner = mongoose.model('Partner', partnerSchema);
const Service = mongoose.model('Service', serviceSchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);

// ========== Seed Default Data - معطل تماماً ==========
async function seedDefaultData() {
  console.log('🚫 Auto-seed is DISABLED. Database will remain empty.');
  console.log('💡 You can add data manually from Admin Panel.');
  
  const portfolioCount = await Portfolio.countDocuments();
  const clientsCount = await Client.countDocuments();
  const partnersCount = await Partner.countDocuments();
  const servicesCount = await Service.countDocuments();
  const inquiriesCount = await Inquiry.countDocuments();
  
  console.log(`📊 Current data counts:`);
  console.log(`   Portfolio: ${portfolioCount} items`);
  console.log(`   Clients: ${clientsCount} items`);
  console.log(`   Partners: ${partnersCount} items`);
  console.log(`   Services: ${servicesCount} items`);
  console.log(`   Inquiries: ${inquiriesCount} items`);
}

// ========== DELETE ALL DATA ==========
app.delete('/api/delete-all-data', async (req, res) => {
  try {
    const { secret } = req.query;
    if (secret !== 'DELETE_ALL_SPECTRA') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Delete all data from collections
    await Portfolio.deleteMany({});
    await Client.deleteMany({});
    await Partner.deleteMany({});
    await Service.deleteMany({});
    await Inquiry.deleteMany({});
    
    // Delete all images from GridFS
    const files = await conn.db.collection('uploads.files').find({}).toArray();
    for (const file of files) {
      await gridFsBucket.delete(file._id);
    }
    
    console.log('🗑️ ALL DATA AND IMAGES DELETED!');
    res.json({ success: true, message: 'All data and images deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== GET Endpoints ==========

app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/portfolio/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Not found' });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/partners', async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== POST Endpoints ==========

app.post('/api/portfolio', async (req, res) => {
  try {
    const newItem = new Portfolio(req.body);
    await newItem.save();
    res.json({ success: true, portfolio: newItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.json({ success: true, client: newClient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    const newPartner = new Partner(req.body);
    await newPartner.save();
    res.json({ success: true, partner: newPartner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.json({ success: true, service: newService });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const newInquiry = new Inquiry({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      serviceType: req.body.service || req.body.serviceType,
      message: req.body.message
    });
    await newInquiry.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PUT Endpoints ==========

app.put('/api/portfolio/:id', async (req, res) => {
  try {
    const updated = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, portfolio: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, service: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== DELETE Endpoints ==========

app.delete('/api/portfolio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting portfolio ID:', id);
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const deleted = await Portfolio.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    console.log('✅ Deleted portfolio:', deleted.title);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Client.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/partners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Partner.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Image Upload Endpoints ==========

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `${SERVER_URL}/api/image/${req.file.filename}`;
  console.log('✅ Image uploaded to MongoDB:', imageUrl);
  res.json({ success: true, url: imageUrl });
});

app.post('/api/upload-multiple', upload.array('images', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const urls = req.files.map(file => `${SERVER_URL}/api/image/${file.filename}`);
  res.json({ success: true, urls });
});

app.delete('/api/delete-image', async (req, res) => {
  const { filename } = req.body;
  
  try {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    const files = await conn.db.collection('uploads.files').find({ filename }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    await bucket.delete(files[0]._id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Health Check ==========

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

// ========== Start Server ==========

mongoose.connection.once('open', async () => {
  console.log('✅ MongoDB Connection Ready');
  await seedDefaultData();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on ${SERVER_URL}`);
    console.log(`🗄️ MongoDB Atlas connected (Images stored in GridFS)`);
    console.log(`✅ Ready to accept requests!\n`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});