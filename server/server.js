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

// مجلدات
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

// Multer config
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

// ملفات البيانات
const PORTFOLIO_FILE = path.join(dataDir, 'portfolios.json');
const PARTNERS_FILE = path.join(dataDir, 'partners.json');
const CLIENTS_FILE = path.join(dataDir, 'clients.json');
const SERVICES_FILE = path.join(dataDir, 'services.json');
const INQUIRIES_FILE = path.join(dataDir, 'inquiries.json');

// دوال مساعدة
function readJSON(filePath, defaultValue = []) {
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.trim() ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error('Error reading JSON:', err);
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing JSON:', err);
    return false;
  }
}

// ========== بيانات افتراضية (للاستخدام الأول فقط) ==========
const defaultPortfolios = [
  { id: '1', title: 'Wedding Elegance', category: 'Wedding', coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600'], description: 'Beautiful wedding moments captured with elegance' },
  { id: '2', title: 'Urban Stories', category: 'Street', coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'], description: 'Street photography from around the world' },
  { id: '3', title: 'Natural Beauty', category: 'Landscape', coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'], description: 'Breathtaking landscapes and nature scenes' }
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

// ========== تهيئة آمنة للملفات - بدون فقدان البيانات! ==========
function safeInitFile(filePath, defaultData, fileName) {
  if (!fs.existsSync(filePath)) {
    writeJSON(filePath, defaultData);
    console.log(`✅ Created new ${fileName}: ${defaultData.length} items`);
    return defaultData;
  }
  
  const existing = readJSON(filePath);
  if (existing.length === 0) {
    writeJSON(filePath, defaultData);
    console.log(`⚠️ ${fileName} was empty, restored defaults`);
    return defaultData;
  }
  
  console.log(`✅ Loaded ${fileName}: ${existing.length} items`);
  return existing;
}

// تنفيذ التهيئة الآمنة
safeInitFile(PORTFOLIO_FILE, defaultPortfolios, 'portfolios.json');
safeInitFile(CLIENTS_FILE, defaultClients, 'clients.json');
safeInitFile(PARTNERS_FILE, defaultPartners, 'partners.json');
safeInitFile(SERVICES_FILE, defaultServices, 'services.json');

// ========== API Endpoints ==========

// Portfolio
app.get('/api/portfolio', (req, res) => {
  res.json(readJSON(PORTFOLIO_FILE));
});

app.get('/api/portfolio/:id', (req, res) => {
  const portfolios = readJSON(PORTFOLIO_FILE);
  const portfolio = portfolios.find(p => p.id === req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Not found' });
  res.json(portfolio);
});

app.post('/api/portfolio', (req, res) => {
  const portfolios = readJSON(PORTFOLIO_FILE);
  const newItem = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  portfolios.push(newItem);
  writeJSON(PORTFOLIO_FILE, portfolios);
  res.json({ success: true, portfolio: newItem });
});

app.put('/api/portfolio/:id', (req, res) => {
  let portfolios = readJSON(PORTFOLIO_FILE);
  const index = portfolios.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  portfolios[index] = { ...portfolios[index], ...req.body };
  writeJSON(PORTFOLIO_FILE, portfolios);
  res.json({ success: true });
});

app.delete('/api/portfolio/:id', (req, res) => {
  let portfolios = readJSON(PORTFOLIO_FILE);
  portfolios = portfolios.filter(p => p.id !== req.params.id);
  writeJSON(PORTFOLIO_FILE, portfolios);
  res.json({ success: true });
});

// Partners
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

// Clients
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

// Services
app.get('/api/services', (req, res) => {
  res.json(readJSON(SERVICES_FILE));
});

app.post('/api/services', (req, res) => {
  const services = readJSON(SERVICES_FILE);
  const newService = { id: uuidv4(), ...req.body, order: services.length + 1 };
  services.push(newService);
  writeJSON(SERVICES_FILE, services);
  res.json({ success: true, service: newService });
});

app.put('/api/services/:id', (req, res) => {
  let services = readJSON(SERVICES_FILE);
  const index = services.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  services[index] = { ...services[index], ...req.body };
  writeJSON(SERVICES_FILE, services);
  res.json({ success: true });
});

app.delete('/api/services/:id', (req, res) => {
  let services = readJSON(SERVICES_FILE);
  services = services.filter(s => s.id !== req.params.id);
  writeJSON(SERVICES_FILE, services);
  res.json({ success: true });
});

// Inquiries
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
  res.json({ success: true });
});

// Upload
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export all data (for backup)
app.get('/api/export-all', (req, res) => {
  res.json({
    portfolios: readJSON(PORTFOLIO_FILE),
    clients: readJSON(CLIENTS_FILE),
    partners: readJSON(PARTNERS_FILE),
    services: readJSON(SERVICES_FILE),
    inquiries: readJSON(INQUIRIES_FILE)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${SERVER_URL}`);
});