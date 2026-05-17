import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// مجلد الصور - استخدام المسار المحلي
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

// إنشاء المجلدات
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads folder created:', uploadsDir);
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Data folder created:', dataDir);
}

// خدمة الصور
app.use('/uploads', express.static(uploadsDir));

// تكوين multer
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
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// رابط السيرفر
const SERVER_URL = process.env.NODE_ENV === 'production'
  ? 'https://spectra-frames-api.onrender.com'
  : `http://localhost:${PORT}`;

// ========== ملفات البيانات ==========
const PORTFOLIO_FILE = path.join(dataDir, 'portfolios.json');
const PARTNERS_FILE = path.join(dataDir, 'partners.json');
const CLIENTS_FILE = path.join(dataDir, 'clients.json');
const SERVICES_FILE = path.join(dataDir, 'services.json');
const INQUIRIES_FILE = path.join(dataDir, 'inquiries.json');

// دوال مساعدة
function readJSON(filePath, defaultValue = []) {
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error('Error reading JSON:', err);
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ File written: ${filePath}`);
    return true;
  } catch (err) {
    console.error('Error writing JSON:', err);
    return false;
  }
}

// ========== بيانات افتراضية ==========
const defaultPortfolios = [
  {
    id: '1',
    title: 'Wedding Elegance',
    category: 'Wedding',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
    images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600'],
    description: 'Beautiful wedding moments captured with elegance'
  },
  {
    id: '2',
    title: 'Urban Stories',
    category: 'Street',
    coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'],
    description: 'Street photography from around the world'
  },
  {
    id: '3',
    title: 'Natural Beauty',
    category: 'Landscape',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'],
    description: 'Breathtaking landscapes and nature scenes'
  }
];

const defaultClients = [
  { id: '1', name: 'Luxury Hotel', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel' },
  { id: '2', name: 'Fashion Brand', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand' },
  { id: '3', name: 'Wedding Planner', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner' }
];

const defaultPartners = [
  { id: '1', name: 'Canon', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Canon' },
  { id: '2', name: 'Sony', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Sony' },
  { id: '3', name: 'Adobe', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Adobe' },
  { id: '4', name: 'Nikon', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Nikon' }
];

const defaultServices = [
  { id: '1', title: 'Wedding Photography', description: 'Capturing your special day with elegance and emotion', order: 1 },
  { id: '2', title: 'Portrait Sessions', description: 'Professional portraits and personal branding', order: 2 },
  { id: '3', title: 'Commercial', description: 'High-end product and corporate photography', order: 3 },
  { id: '4', title: 'Fine Art', description: 'Artistic and conceptual visual stories', order: 4 },
  { id: '5', title: 'Event Coverage', description: 'Corporate events and special occasions', order: 5 },
  { id: '6', title: 'Content Creation', description: 'Social media and marketing content', order: 6 }
];

// إنشاء الملفات لو مش موجودة
if (readJSON(PORTFOLIO_FILE).length === 0) writeJSON(PORTFOLIO_FILE, defaultPortfolios);
if (readJSON(CLIENTS_FILE).length === 0) writeJSON(CLIENTS_FILE, defaultClients);
if (readJSON(PARTNERS_FILE).length === 0) writeJSON(PARTNERS_FILE, defaultPartners);
if (readJSON(SERVICES_FILE).length === 0) writeJSON(SERVICES_FILE, defaultServices);

// ========== API - Portfolio ==========
// GET all portfolios
app.get('/api/portfolio', (req, res) => {
  const portfolios = readJSON(PORTFOLIO_FILE);
  res.json(portfolios);
});

// GET portfolio by ID (المُضافة حديثاً)
app.get('/api/portfolio/:id', (req, res) => {
  const portfolios = readJSON(PORTFOLIO_FILE);
  const portfolio = portfolios.find(p => p.id === req.params.id);
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }
  res.json(portfolio);
});

// POST new portfolio
app.post('/api/portfolio', (req, res) => {
  try {
    const portfolios = readJSON(PORTFOLIO_FILE);
    const newItem = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
    portfolios.push(newItem);
    writeJSON(PORTFOLIO_FILE, portfolios);
    console.log('✅ Portfolio saved:', newItem.id);
    res.json({ success: true, portfolio: newItem });
  } catch (error) {
    console.error('Error saving portfolio:', error);
    res.status(500).json({ error: 'Failed to save portfolio' });
  }
});

// PUT update portfolio
app.put('/api/portfolio/:id', (req, res) => {
  let portfolios = readJSON(PORTFOLIO_FILE);
  const index = portfolios.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  portfolios[index] = { ...portfolios[index], ...req.body };
  writeJSON(PORTFOLIO_FILE, portfolios);
  res.json({ success: true });
});

// DELETE portfolio
app.delete('/api/portfolio/:id', (req, res) => {
  let portfolios = readJSON(PORTFOLIO_FILE);
  portfolios = portfolios.filter(p => p.id !== req.params.id);
  writeJSON(PORTFOLIO_FILE, portfolios);
  res.json({ success: true });
});

// ========== API - Partners ==========
app.get('/api/partners', (req, res) => {
  res.json(readJSON(PARTNERS_FILE));
});

app.post('/api/partners', (req, res) => {
  const partners = readJSON(PARTNERS_FILE);
  const newPartner = { id: uuidv4(), ...req.body };
  partners.push(newPartner);
  writeJSON(PARTNERS_FILE, partners);
  res.json({ success: true, partner: newPartner });
});

app.delete('/api/partners/:id', (req, res) => {
  let partners = readJSON(PARTNERS_FILE);
  partners = partners.filter(p => p.id !== req.params.id);
  writeJSON(PARTNERS_FILE, partners);
  res.json({ success: true });
});

// ========== API - Clients ==========
app.get('/api/clients', (req, res) => {
  res.json(readJSON(CLIENTS_FILE));
});

app.post('/api/clients', (req, res) => {
  const clients = readJSON(CLIENTS_FILE);
  const newClient = { id: uuidv4(), ...req.body };
  clients.push(newClient);
  writeJSON(CLIENTS_FILE, clients);
  res.json({ success: true, client: newClient });
});

app.delete('/api/clients/:id', (req, res) => {
  let clients = readJSON(CLIENTS_FILE);
  clients = clients.filter(c => c.id !== req.params.id);
  writeJSON(CLIENTS_FILE, clients);
  res.json({ success: true });
});

// ========== API - Services ==========
app.get('/api/services', (req, res) => {
  res.json(readJSON(SERVICES_FILE, defaultServices));
});

app.post('/api/services', (req, res) => {
  const services = readJSON(SERVICES_FILE, defaultServices);
  const newService = { id: uuidv4(), ...req.body, order: services.length + 1 };
  services.push(newService);
  writeJSON(SERVICES_FILE, services);
  res.json({ success: true, service: newService });
});

app.put('/api/services/:id', (req, res) => {
  let services = readJSON(SERVICES_FILE, defaultServices);
  const index = services.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  services[index] = { ...services[index], ...req.body };
  writeJSON(SERVICES_FILE, services);
  res.json({ success: true });
});

app.delete('/api/services/:id', (req, res) => {
  let services = readJSON(SERVICES_FILE, defaultServices);
  services = services.filter(s => s.id !== req.params.id);
  writeJSON(SERVICES_FILE, services);
  res.json({ success: true });
});

// ========== API - Inquiries (المُصلحة) ==========
app.get('/api/inquiries', (req, res) => {
  res.json(readJSON(INQUIRIES_FILE));
});

app.post('/api/inquiries', (req, res) => {
  const inquiries = readJSON(INQUIRIES_FILE);
  const newInquiry = { 
    id: uuidv4(), 
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '',
    serviceType: req.body.service || req.body.serviceType,
    message: req.body.message,
    createdAt: new Date().toISOString() 
  };
  inquiries.push(newInquiry);
  writeJSON(INQUIRIES_FILE, inquiries);
  console.log('✅ New inquiry saved:', newInquiry.name);
  res.json({ success: true });
});

// ========== رفع الصور ==========
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
  console.log('✅ Image uploaded:', imageUrl);
  res.json({ success: true, url: imageUrl });
});

app.post('/api/upload-multiple', upload.array('images', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const urls = req.files.map(file => `${SERVER_URL}/uploads/${file.filename}`);
  res.json({ success: true, urls: urls });
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
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// ========== تشغيل السيرفر ==========
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${SERVER_URL}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
  console.log(`📁 Data folder: ${dataDir}`);
});