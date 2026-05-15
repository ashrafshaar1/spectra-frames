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

// مجلد رفع الصور
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads folder created:', uploadsDir);
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// رابط السيرفر
const SERVER_URL = process.env.RENDER
  ? 'https://spectra-frames-api.onrender.com'
  : `http://localhost:${PORT}`;

// ========== ملفات البيانات ==========
const PORTFOLIO_FILE = path.join(__dirname, 'portfolios.json');
const PARTNERS_FILE = path.join(__dirname, 'partners.json');
const INQUIRIES_FILE = path.join(__dirname, 'inquiries.json');
const CLIENTS_FILE = path.join(__dirname, 'clients.json');

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
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ========== API - Portfolio ==========
app.get('/api/portfolio', (req, res) => {
  const portfolios = readJSON(PORTFOLIO_FILE);
  res.json(portfolios);
});

app.get('/api/portfolio/:id', (req, res) => {
  const portfolios = readJSON(PORTFOLIO_FILE);
  const item = portfolios.find(p => p.id === req.params.id);
  item ? res.json(item) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/portfolio', (req, res) => {
  const portfolios = readJSON(PORTFOLIO_FILE);
  const newItem = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  portfolios.push(newItem);
  writeJSON(PORTFOLIO_FILE, portfolios);
  console.log('✅ Portfolio added:', newItem.title);
  res.json({ success: true, portfolio: newItem });
});

app.put('/api/portfolio/:id', (req, res) => {
  let portfolios = readJSON(PORTFOLIO_FILE);
  const index = portfolios.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  portfolios[index] = { ...portfolios[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJSON(PORTFOLIO_FILE, portfolios);
  res.json({ success: true });
});

app.delete('/api/portfolio/:id', (req, res) => {
  let portfolios = readJSON(PORTFOLIO_FILE);
  portfolios = portfolios.filter(p => p.id !== req.params.id);
  writeJSON(PORTFOLIO_FILE, portfolios);
  res.json({ success: true });
});

// ========== API - Partners ==========
app.get('/api/partners', (req, res) => {
  const partners = readJSON(PARTNERS_FILE);
  res.json(partners);
});

app.post('/api/partners', (req, res) => {
  const partners = readJSON(PARTNERS_FILE);
  const newPartner = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  partners.push(newPartner);
  writeJSON(PARTNERS_FILE, partners);
  console.log('✅ Partner added:', newPartner.name);
  res.json({ success: true, partner: newPartner });
});

app.delete('/api/partners/:id', (req, res) => {
  let partners = readJSON(PARTNERS_FILE);
  partners = partners.filter(p => p.id !== req.params.id);
  writeJSON(PARTNERS_FILE, partners);
  res.json({ success: true });
});

// ========== API - Clients Logos (للشعارات المتحركة) ==========
app.get('/api/clients', (req, res) => {
  const clients = readJSON(CLIENTS_FILE);
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const clients = readJSON(CLIENTS_FILE);
  const newClient = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
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

// ========== API - Contact Inquiries ==========
app.get('/api/inquiries', (req, res) => {
  const inquiries = readJSON(INQUIRIES_FILE);
  res.json(inquiries);
});

app.post('/api/inquiries', (req, res) => {
  const { name, email, phone, message, serviceType } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const inquiries = readJSON(INQUIRIES_FILE);
  const newInquiry = {
    id: uuidv4(),
    name,
    email,
    phone: phone || '',
    message,
    serviceType: serviceType || 'General',
    createdAt: new Date().toISOString()
  };
  inquiries.push(newInquiry);
  writeJSON(INQUIRIES_FILE, inquiries);
  console.log('📧 New inquiry from:', name, email);
  res.json({ success: true, message: 'Inquiry sent successfully!' });
});

// ========== رفع الصور ==========
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
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

const defaultPartners = [
  { id: '1', name: 'Luxury Hotel', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel' },
  { id: '2', name: 'Fashion Brand', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand' },
  { id: '3', name: 'Wedding Planner', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner' }
];

const defaultClients = [
  { id: '1', name: 'Luxury Hotel', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel' },
  { id: '2', name: 'Fashion Brand', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand' },
  { id: '3', name: 'Wedding Planner', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner' },
  { id: '4', name: 'Real Estate', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Real+Estate' },
  { id: '5', name: 'Magazine', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Magazine' }
];

if (readJSON(PORTFOLIO_FILE).length === 0) writeJSON(PORTFOLIO_FILE, defaultPortfolios);
if (readJSON(PARTNERS_FILE).length === 0) writeJSON(PARTNERS_FILE, defaultPartners);
if (readJSON(CLIENTS_FILE).length === 0) writeJSON(CLIENTS_FILE, defaultClients);

// بدء السيرفر
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${SERVER_URL}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
  console.log(`📄 Portfolios: ${PORTFOLIO_FILE}`);
  console.log(`📄 Partners: ${PARTNERS_FILE}`);
  console.log(`📄 Clients: ${CLIENTS_FILE}`);
  console.log(`📄 Inquiries: ${INQUIRIES_FILE}`);
});