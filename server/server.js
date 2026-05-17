import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// مجلدات
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

const SERVER_URL = process.env.NODE_ENV === 'production'
  ? 'https://spectra-frames-api.onrender.com'
  : `http://localhost:${PORT}`;

// ========== MongoDB Connection ==========
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spectraframes';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

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

// ========== Seed Default Data (مرة وحدة فقط) ==========
async function seedDefaultData() {
  console.log('🌱 Checking and seeding default data...');
  
  // Portfolio
  const portfolioCount = await Portfolio.countDocuments();
  if (portfolioCount === 0) {
    console.log('📸 Seeding Portfolio...');
    await Portfolio.insertMany([
      { title: 'Wedding Elegance', category: 'Wedding', coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600'], description: 'Beautiful wedding moments captured with elegance' },
      { title: 'Urban Stories', category: 'Street', coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'], description: 'Street photography from around the world' },
      { title: 'Natural Beauty', category: 'Landscape', coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'], description: 'Breathtaking landscapes' }
    ]);
  }
  
  // Clients
  const clientsCount = await Client.countDocuments();
  if (clientsCount === 0) {
    console.log('👥 Seeding Clients...');
    await Client.insertMany([
      { name: 'Luxury Hotel', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel' },
      { name: 'Fashion Brand', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand' },
      { name: 'Wedding Planner', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner' }
    ]);
  }
  
  // Partners
  const partnersCount = await Partner.countDocuments();
  if (partnersCount === 0) {
    console.log('🤝 Seeding Partners...');
    await Partner.insertMany([
      { name: 'Canon', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Canon' },
      { name: 'Sony', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Sony' },
      { name: 'Adobe', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Adobe' },
      { name: 'Nikon', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Nikon' }
    ]);
  }
  
  // Services
  const servicesCount = await Service.countDocuments();
  if (servicesCount === 0) {
    console.log('⚙️ Seeding Services...');
    await Service.insertMany([
      { title: 'Wedding Photography', description: 'Capturing your special day with elegance and emotion', order: 1 },
      { title: 'Portrait Sessions', description: 'Professional portraits and personal branding', order: 2 },
      { title: 'Commercial', description: 'High-end product and corporate photography', order: 3 },
      { title: 'Fine Art', description: 'Artistic and conceptual visual stories', order: 4 },
      { title: 'Event Coverage', description: 'Corporate events and special occasions', order: 5 },
      { title: 'Content Creation', description: 'Social media and marketing content', order: 6 }
    ]);
  }
  
  console.log('✅ Seeding complete!');
}

// ========== DELETE Endpoints (المصلحة) ==========

// Delete Portfolio
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
    res.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Client.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Partner
app.delete('/api/partners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Partner.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Service
app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.json({ success: true });
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

// ========== Image Upload ==========

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, url: `${SERVER_URL}/uploads/${req.file.filename}` });
});

app.post('/api/upload-multiple', upload.array('images', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const urls = req.files.map(file => `${SERVER_URL}/uploads/${file.filename}`);
  res.json({ success: true, urls });
});

app.delete('/api/delete-image', (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Image not found' });
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
    console.log(`🗄️ MongoDB Atlas connected`);
    console.log(`📁 Uploads: ${uploadsDir}`);
    console.log(`✅ Ready to accept requests!\n`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});