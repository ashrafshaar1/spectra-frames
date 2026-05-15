import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads folder created:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Upload single image
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `https://spectra-frames-api.onrender.com/uploads/${req.file.filename}`;
    console.log('✅ Image uploaded:', imageUrl);
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload multiple images
app.post('/api/upload-multiple', upload.array('images', 50), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const urls = req.files.map(file => {
      return `https://spectra-frames-api.onrender.com/uploads/${file.filename}`;
    });
    
    console.log(`✅ ${urls.length} images uploaded`);
    res.json({ success: true, urls: urls });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete image
app.delete('/api/delete-image', (req, res) => {
  try {
    const { filename } = req.body;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Image deleted:', filename);
      res.json({ success: true, message: 'Image deleted' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// In-memory storage
let inquiries = [];
let portfolios = [
  {
    id: '1',
    title: 'Wedding Elegance',
    category: 'Wedding',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600'
    ],
    description: 'Beautiful wedding moments captured with elegance'
  },
  {
    id: '2',
    title: 'Urban Stories',
    category: 'Street',
    coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600'
    ],
    description: 'Street photography from around the world'
  },
  {
    id: '3',
    title: 'Natural Beauty',
    category: 'Landscape',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'
    ],
    description: 'Breathtaking landscapes and nature scenes'
  },
  {
    id: '4',
    title: 'Portrait Soul',
    category: 'Portrait',
    coverImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
    images: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'
    ],
    description: 'Capturing authentic human emotion'
  },
  {
    id: '5',
    title: 'Wild Symphony',
    category: 'Wildlife',
    coverImage: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600',
    images: [
      'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600',
      'https://images.unsplash.com/photo-1549366021-9f761d450615?w=600'
    ],
    description: 'Nature\'s raw beauty unveiled'
  },
  {
    id: '6',
    title: 'Architectural Geometry',
    category: 'Architecture',
    coverImage: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600',
    images: [
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600',
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600'
    ],
    description: 'Lines, light, and modern design'
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Photography agency API is running' });
});

// Get all portfolio items
app.get('/api/portfolio', (req, res) => {
  res.json(portfolios);
});

// Get single portfolio item
app.get('/api/portfolio/:id', (req, res) => {
  const item = portfolios.find(p => p.id === req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Portfolio item not found' });
  }
});

// Submit contact inquiry
app.post('/api/inquiries', (req, res) => {
  const { name, email, phone, message, serviceType } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  
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
  console.log('📧 New inquiry received:', newInquiry.name, '-', newInquiry.email);
  
  res.status(201).json({ 
    success: true, 
    message: 'Inquiry submitted successfully! We\'ll contact you soon.',
    inquiryId: newInquiry.id
  });
});

// Get all inquiries
app.get('/api/inquiries', (req, res) => {
  res.json(inquiries);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
});