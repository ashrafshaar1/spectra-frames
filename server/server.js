import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// In-memory storage
let inquiries = [];
let portfolios = [
  {
    id: '1',
    title: 'Ethereal Landscapes',
    category: 'Landscape',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    description: 'Majestic mountain ranges and serene valleys'
  },
  {
    id: '2',
    title: 'Urban Chronicles',
    category: 'Street',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
    description: 'City life through a cinematic lens'
  },
  {
    id: '3',
    title: 'Portrait Essence',
    category: 'Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
    description: 'Capturing authentic human emotion'
  },
  {
    id: '4',
    title: 'Wedding Elegance',
    category: 'Wedding',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
    description: 'Timeless moments of love and joy'
  },
  {
    id: '5',
    title: 'Wild Symphony',
    category: 'Wildlife',
    imageUrl: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600',
    description: 'Nature\'s raw beauty unveiled'
  },
  {
    id: '6',
    title: 'Architectural Geometry',
    category: 'Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600',
    description: 'Lines, light, and modern design'
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Photography agency API is running' });
});

app.get('/api/portfolio', (req, res) => {
  const { category } = req.query;
  if (category && category !== 'All') {
    const filtered = portfolios.filter(item => item.category === category);
    return res.json(filtered);
  }
  res.json(portfolios);
});

app.get('/api/portfolio/:id', (req, res) => {
  const item = portfolios.find(p => p.id === req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Portfolio item not found' });
  }
});

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
  console.log('New inquiry received:', newInquiry);
  
  res.status(201).json({ 
    success: true, 
    message: 'Inquiry submitted successfully! We\'ll contact you soon.',
    inquiryId: newInquiry.id
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  
  const { title, category, description } = req.body;
  const newPortfolio = {
    id: uuidv4(),
    title: title || 'Untitled',
    category: category || 'General',
    description: description || '',
    imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`
  };
  
  portfolios.push(newPortfolio);
  res.status(201).json({ success: true, portfolio: newPortfolio });
});

app.get('/api/inquiries', (req, res) => {
  res.json(inquiries);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});