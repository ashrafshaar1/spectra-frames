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

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// مجلد حفظ الصور
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// خدمة الصور
app.use('/uploads', express.static(uploadsDir));

// إعداد رفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

// رابط السيرفر العام (عدل هذا حسب رابط Render.com حقك)
const SERVER_URL = 'https://spectra-frames-api.onrender.com';

// رفع صورة واحدة
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
  console.log('✅ Image uploaded:', imageUrl);
  res.json({ success: true, url: imageUrl });
});

// رفع عدة صور
app.post('/api/upload-multiple', upload.array('images', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const urls = req.files.map(file => `${SERVER_URL}/uploads/${file.filename}`);
  res.json({ success: true, urls: urls });
});

// حذف صورة
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

// فحص صحة السيرفر
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// بيانات الـ Portfolio
let portfolios = [
  {
    id: '1',
    title: 'Wedding Elegance',
    category: 'Wedding',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
    images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600'],
    description: 'Beautiful wedding moments'
  }
];

app.get('/api/portfolio', (req, res) => {
  res.json(portfolios);
});

app.get('/api/portfolio/:id', (req, res) => {
  const item = portfolios.find(p => p.id === req.params.id);
  item ? res.json(item) : res.status(404).json({ error: 'Not found' });
});

// استعلامات الاتصال
let inquiries = [];
app.post('/api/inquiries', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const newInquiry = { id: uuidv4(), name, email, message, createdAt: new Date() };
  inquiries.push(newInquiry);
  res.json({ success: true });
});

app.get('/api/inquiries', (req, res) => {
  res.json(inquiries);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
});