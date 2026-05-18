import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// MySQL Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'spectraframes',
  waitForConnections: true,
  connectionLimit: 10,
});

function generateId() {
  return Date.now().toString() + '-' + crypto.randomBytes(4).toString('hex');
}

// ========== Upload Image (Base64) ==========
app.post('/api/upload-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });
    res.json({ success: true, url: image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload-multiple', async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !images.length) {
      return res.status(400).json({ error: 'No images provided' });
    }
    res.json({ success: true, urls: images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/delete-image', (req, res) => {
  res.json({ success: true });
});

// ========== API Endpoints ==========

// Portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM portfolios ORDER BY createdAt DESC');
    const portfolios = rows.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/portfolio/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM portfolios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ...rows[0], images: rows[0].images ? JSON.parse(rows[0].images) : [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio', async (req, res) => {
  try {
    const { title, category, description, coverImage, images } = req.body;
    const id = generateId();
    await pool.query(
      'INSERT INTO portfolios (id, title, category, description, coverImage, images) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, category, description || '', coverImage, JSON.stringify(images || [])]
    );
    res.json({ success: true, portfolio: { id, title, category, description, coverImage, images } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/portfolio/:id', async (req, res) => {
  try {
    const { title, category, description, coverImage, images } = req.body;
    await pool.query(
      'UPDATE portfolios SET title = ?, category = ?, description = ?, coverImage = ?, images = ? WHERE id = ?',
      [title, category, description || '', coverImage, JSON.stringify(images || []), req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/portfolio/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM portfolios WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clients
app.get('/api/clients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, logo } = req.body;
    const id = generateId();
    await pool.query('INSERT INTO clients (id, name, logo) VALUES (?, ?, ?)', [id, name, logo]);
    const newClient = { id, name, logo };
    res.json({ success: true, client: newClient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Partners
app.get('/api/partners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM partners ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    const { name, logo } = req.body;
    const id = generateId();
    await pool.query('INSERT INTO partners (id, name, logo) VALUES (?, ?, ?)', [id, name, logo]);
    const newPartner = { id, name, logo };
    res.json({ success: true, partner: newPartner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/partners/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM partners WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY `order` ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { title, description, order, icon } = req.body;
    const id = generateId();
    await pool.query(
      'INSERT INTO services (id, title, description, `order`, icon) VALUES (?, ?, ?, ?, ?)',
      [id, title, description, order || 0, icon || null]
    );
    res.json({ success: true, service: { id, title, description, order, icon } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { title, description, order, icon } = req.body;
    await pool.query(
      'UPDATE services SET title = ?, description = ?, `order` = ?, icon = ? WHERE id = ?',
      [title, description, order || 0, icon || null, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    const id = generateId();
    await pool.query(
      'INSERT INTO inquiries (id, name, email, phone, serviceType, message) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, phone || '', service || '', message]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all data
app.delete('/api/delete-all-data', async (req, res) => {
  try {
    const { secret } = req.query;
    if (secret !== 'DELETE_ALL_SPECTRA') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await pool.query('DELETE FROM portfolios');
    await pool.query('DELETE FROM clients');
    await pool.query('DELETE FROM partners');
    await pool.query('DELETE FROM services');
    await pool.query('DELETE FROM inquiries');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'mysql', timestamp: new Date().toISOString() });
});

// Initialize database
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected');
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS spectraframes`);
    await connection.query(`USE spectraframes`);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        coverImage LONGTEXT NOT NULL,
        images LONGTEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        logo LONGTEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        logo LONGTEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        \`order\` INT DEFAULT 0,
        icon VARCHAR(50) DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        serviceType VARCHAR(200),
        message TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tables created');
    
    // Seed default data
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM portfolios');
    if (rows[0].count === 0) {
      console.log('🌱 Seeding default data...');
      
      await connection.query(`
        INSERT INTO portfolios (id, title, category, coverImage, images) VALUES 
        ('1', 'Wedding Elegance', 'Wedding', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', '["https://images.unsplash.com/photo-1519741497674-611481863552?w=600"]'),
        ('2', 'Urban Stories', 'Street', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', '["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600"]'),
        ('3', 'Natural Beauty', 'Landscape', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"]')
      `);
      
      await connection.query(`
        INSERT INTO clients (id, name, logo) VALUES 
        ('1', 'Luxury Hotel', 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel'),
        ('2', 'Fashion Brand', 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand'),
        ('3', 'Wedding Planner', 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner')
      `);
      
      await connection.query(`
        INSERT INTO partners (id, name, logo) VALUES 
        ('1', 'Canon', 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Canon'),
        ('2', 'Sony', 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Sony'),
        ('3', 'Adobe', 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Adobe'),
        ('4', 'Nikon', 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Nikon')
      `);
      
      await connection.query(`
        INSERT INTO services (id, title, description, \`order\`) VALUES 
        ('1', 'Wedding Photography', 'Capturing your special day with elegance and emotion', 1),
        ('2', 'Portrait Sessions', 'Professional portraits and personal branding', 2),
        ('3', 'Commercial', 'High-end product and corporate photography', 3),
        ('4', 'Fine Art', 'Artistic and conceptual visual stories', 4),
        ('5', 'Event Coverage', 'Corporate events and special occasions', 5),
        ('6', 'Content Creation', 'Social media and marketing content', 6)
      `);
    }
    
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Error:', error.message);
    console.log('💡 Make sure XAMPP is running (Apache + MySQL)');
  }
}

// Start server
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Ready!\n`);
  });
});