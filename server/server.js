import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
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

// ========== SQL Server Configuration ==========
// استخدام Windows Authentication
const sqlConfig = {
    server: process.env.DB_SERVER || 'localhost\SQLEXPRESS',
    database: process.env.DB_NAME || 'SpectraFrames',
    user: process.env.DB_USER || 'spectraframes',
    password: process.env.DB_PASSWORD || 'SpectraFrames2024!',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

console.log('🔌 Connecting to SQL Server:', sqlConfig.server);
console.log('📚 Database:', sqlConfig.database);
console.log('🔐 Authentication: Windows Authentication');

let pool = null;

async function connectToDatabase() {
    try {
        pool = await sql.connect(sqlConfig);
        console.log('✅ SQL Server Connected Successfully');
        await ensureTablesExist();
        await seedDefaultData();
        return true;
    } catch (err) {
        console.error('❌ SQL Server Connection Error:', err.message);
        console.log('\n📌 Troubleshooting tips:');
        console.log('   1. Make sure SQL Server is running');
        console.log('   2. Check if you can connect using SSMS with Windows Authentication');
        console.log('   3. Server name should be: localhost\\SQLEXPRESS');
        console.log('   4. Try restarting SQL Server service\n');
        return false;
    }
}

// Create Tables
async function ensureTablesExist() {
    try {
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Portfolio' AND xtype='U')
            CREATE TABLE Portfolio (
                Id VARCHAR(50) PRIMARY KEY,
                Title NVARCHAR(200) NOT NULL,
                Category NVARCHAR(100) NOT NULL,
                Description NVARCHAR(MAX),
                CoverImage NVARCHAR(500) NOT NULL,
                Images NVARCHAR(MAX),
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);
        
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Clients' AND xtype='U')
            CREATE TABLE Clients (
                Id VARCHAR(50) PRIMARY KEY,
                Name NVARCHAR(200) NOT NULL,
                Logo NVARCHAR(500) NOT NULL,
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);
        
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Partners' AND xtype='U')
            CREATE TABLE Partners (
                Id VARCHAR(50) PRIMARY KEY,
                Name NVARCHAR(200) NOT NULL,
                Logo NVARCHAR(500) NOT NULL,
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);
        
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Services' AND xtype='U')
            CREATE TABLE Services (
                Id VARCHAR(50) PRIMARY KEY,
                Title NVARCHAR(200) NOT NULL,
                Description NVARCHAR(500) NOT NULL,
                [Order] INT DEFAULT 0,
                Icon NVARCHAR(50) DEFAULT '📷',
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);
        
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Inquiries' AND xtype='U')
            CREATE TABLE Inquiries (
                Id VARCHAR(50) PRIMARY KEY,
                Name NVARCHAR(200) NOT NULL,
                Email NVARCHAR(200) NOT NULL,
                Phone NVARCHAR(50),
                ServiceType NVARCHAR(200),
                Message NVARCHAR(MAX) NOT NULL,
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);
        
        console.log('✅ Tables verified/created');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
}

// Seed Default Data
async function seedDefaultData() {
    try {
        const result = await pool.request().query('SELECT COUNT(*) as count FROM Portfolio');
        if (result.recordset[0].count === 0) {
            console.log('🌱 Seeding default portfolio data...');
            
            const defaultPortfolios = [
                { id: uuidv4(), title: 'Wedding Elegance', category: 'Wedding', coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', images: JSON.stringify(['https://images.unsplash.com/photo-1519741497674-611481863552?w=600']), description: 'Beautiful wedding moments captured with elegance' },
                { id: uuidv4(), title: 'Urban Stories', category: 'Street', coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', images: JSON.stringify(['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600']), description: 'Street photography from around the world' },
                { id: uuidv4(), title: 'Natural Beauty', category: 'Landscape', coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', images: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600']), description: 'Breathtaking landscapes' }
            ];
            
            for (const p of defaultPortfolios) {
                await pool.request()
                    .input('Id', sql.VarChar(50), p.id)
                    .input('Title', sql.NVarChar(200), p.title)
                    .input('Category', sql.NVarChar(100), p.category)
                    .input('Description', sql.NVarChar(sql.MAX), p.description)
                    .input('CoverImage', sql.NVarChar(500), p.coverImage)
                    .input('Images', sql.NVarChar(sql.MAX), p.images)
                    .query(`INSERT INTO Portfolio (Id, Title, Category, Description, CoverImage, Images) 
                            VALUES (@Id, @Title, @Category, @Description, @CoverImage, @Images)`);
            }
        }
        
        const clientsResult = await pool.request().query('SELECT COUNT(*) as count FROM Clients');
        if (clientsResult.recordset[0].count === 0) {
            console.log('🌱 Seeding default clients data...');
            
            const defaultClients = [
                { id: uuidv4(), name: 'Luxury Hotel', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel' },
                { id: uuidv4(), name: 'Fashion Brand', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand' },
                { id: uuidv4(), name: 'Wedding Planner', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner' }
            ];
            
            for (const c of defaultClients) {
                await pool.request()
                    .input('Id', sql.VarChar(50), c.id)
                    .input('Name', sql.NVarChar(200), c.name)
                    .input('Logo', sql.NVarChar(500), c.logo)
                    .query(`INSERT INTO Clients (Id, Name, Logo) VALUES (@Id, @Name, @Logo)`);
            }
        }
        
        const partnersResult = await pool.request().query('SELECT COUNT(*) as count FROM Partners');
        if (partnersResult.recordset[0].count === 0) {
            console.log('🌱 Seeding default partners data...');
            
            const defaultPartners = [
                { id: uuidv4(), name: 'Canon', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Canon' },
                { id: uuidv4(), name: 'Sony', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Sony' },
                { id: uuidv4(), name: 'Adobe', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Adobe' },
                { id: uuidv4(), name: 'Nikon', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Nikon' }
            ];
            
            for (const p of defaultPartners) {
                await pool.request()
                    .input('Id', sql.VarChar(50), p.id)
                    .input('Name', sql.NVarChar(200), p.name)
                    .input('Logo', sql.NVarChar(500), p.logo)
                    .query(`INSERT INTO Partners (Id, Name, Logo) VALUES (@Id, @Name, @Logo)`);
            }
        }
        
        const servicesResult = await pool.request().query('SELECT COUNT(*) as count FROM Services');
        if (servicesResult.recordset[0].count === 0) {
            console.log('🌱 Seeding default services data...');
            
            const defaultServices = [
                { id: uuidv4(), title: 'Wedding Photography', description: 'Capturing your special day with elegance and emotion', order: 1 },
                { id: uuidv4(), title: 'Portrait Sessions', description: 'Professional portraits and personal branding', order: 2 },
                { id: uuidv4(), title: 'Commercial', description: 'High-end product and corporate photography', order: 3 },
                { id: uuidv4(), title: 'Fine Art', description: 'Artistic and conceptual visual stories', order: 4 },
                { id: uuidv4(), title: 'Event Coverage', description: 'Corporate events and special occasions', order: 5 },
                { id: uuidv4(), title: 'Content Creation', description: 'Social media and marketing content', order: 6 }
            ];
            
            for (const s of defaultServices) {
                await pool.request()
                    .input('Id', sql.VarChar(50), s.id)
                    .input('Title', sql.NVarChar(200), s.title)
                    .input('Description', sql.NVarChar(500), s.description)
                    .input('Order', sql.Int, s.order)
                    .query(`INSERT INTO Services (Id, Title, Description, [Order]) 
                            VALUES (@Id, @Title, @Description, @Order)`);
            }
        }
        
        console.log('✅ Default data seeded successfully!');
    } catch (err) {
        console.error('Error seeding data:', err);
    }
}

// ========== API Endpoints ==========

// Portfolio
app.get('/api/portfolio', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Portfolio ORDER BY CreatedAt DESC');
        const portfolios = result.recordset.map(p => ({
            ...p,
            images: p.Images ? JSON.parse(p.Images) : []
        }));
        res.json(portfolios);
    } catch (error) {
        console.error('Error fetching portfolios:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/portfolio/:id', async (req, res) => {
    try {
        const result = await pool.request()
            .input('Id', sql.VarChar(50), req.params.id)
            .query('SELECT * FROM Portfolio WHERE Id = @Id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }
        
        const portfolio = {
            ...result.recordset[0],
            images: result.recordset[0].Images ? JSON.parse(result.recordset[0].Images) : []
        };
        res.json(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/portfolio', async (req, res) => {
    try {
        const id = uuidv4();
        const { title, category, description, coverImage, images } = req.body;
        
        await pool.request()
            .input('Id', sql.VarChar(50), id)
            .input('Title', sql.NVarChar(200), title)
            .input('Category', sql.NVarChar(100), category)
            .input('Description', sql.NVarChar(sql.MAX), description || '')
            .input('CoverImage', sql.NVarChar(500), coverImage)
            .input('Images', sql.NVarChar(sql.MAX), JSON.stringify(images || []))
            .query(`INSERT INTO Portfolio (Id, Title, Category, Description, CoverImage, Images) 
                    VALUES (@Id, @Title, @Category, @Description, @CoverImage, @Images)`);
        
        res.json({ success: true, portfolio: { id, title, category, description, coverImage, images } });
    } catch (error) {
        console.error('Error creating portfolio:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/portfolio/:id', async (req, res) => {
    try {
        const { title, category, description, coverImage, images } = req.body;
        
        await pool.request()
            .input('Id', sql.VarChar(50), req.params.id)
            .input('Title', sql.NVarChar(200), title)
            .input('Category', sql.NVarChar(100), category)
            .input('Description', sql.NVarChar(sql.MAX), description || '')
            .input('CoverImage', sql.NVarChar(500), coverImage)
            .input('Images', sql.NVarChar(sql.MAX), JSON.stringify(images || []))
            .query(`UPDATE Portfolio SET 
                    Title = @Title, 
                    Category = @Category, 
                    Description = @Description, 
                    CoverImage = @CoverImage, 
                    Images = @Images 
                    WHERE Id = @Id`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/portfolio/:id', async (req, res) => {
    try {
        await pool.request()
            .input('Id', sql.VarChar(50), req.params.id)
            .query('DELETE FROM Portfolio WHERE Id = @Id');
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        res.status(500).json({ error: error.message });
    }
});

// Clients
app.get('/api/clients', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Clients ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clients', async (req, res) => {
    try {
        const id = uuidv4();
        const { name, logo } = req.body;
        
        await pool.request()
            .input('Id', sql.VarChar(50), id)
            .input('Name', sql.NVarChar(200), name)
            .input('Logo', sql.NVarChar(500), logo)
            .query(`INSERT INTO Clients (Id, Name, Logo) VALUES (@Id, @Name, @Logo)`);
        
        res.json({ success: true, client: { id, name, logo } });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/clients/:id', async (req, res) => {
    try {
        await pool.request()
            .input('Id', sql.VarChar(50), req.params.id)
            .query('DELETE FROM Clients WHERE Id = @Id');
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: error.message });
    }
});

// Partners
app.get('/api/partners', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Partners ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/partners', async (req, res) => {
    try {
        const id = uuidv4();
        const { name, logo } = req.body;
        
        await pool.request()
            .input('Id', sql.VarChar(50), id)
            .input('Name', sql.NVarChar(200), name)
            .input('Logo', sql.NVarChar(500), logo)
            .query(`INSERT INTO Partners (Id, Name, Logo) VALUES (@Id, @Name, @Logo)`);
        
        res.json({ success: true, partner: { id, name, logo } });
    } catch (error) {
        console.error('Error creating partner:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/partners/:id', async (req, res) => {
    try {
        await pool.request()
            .input('Id', sql.VarChar(50), req.params.id)
            .query('DELETE FROM Partners WHERE Id = @Id');
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting partner:', error);
        res.status(500).json({ error: error.message });
    }
});

// Services
app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Services ORDER BY [Order] ASC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/services', async (req, res) => {
    try {
        const id = uuidv4();
        const { title, description, order, icon } = req.body;
        
        await pool.request()
            .input('Id', sql.VarChar(50), id)
            .input('Title', sql.NVarChar(200), title)
            .input('Description', sql.NVarChar(500), description)
            .input('Order', sql.Int, order || 0)
            .input('Icon', sql.NVarChar(50), icon || '📷')
            .query(`INSERT INTO Services (Id, Title, Description, [Order], Icon) 
                    VALUES (@Id, @Title, @Description, @Order, @Icon)`);
        
        res.json({ success: true, service: { id, title, description, order, icon } });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/services/:id', async (req, res) => {
    try {
        const { title, description, order, icon } = req.body;
        
        await pool.request()
            .input('Id', sql.VarChar(50), req.params.id)
            .input('Title', sql.NVarChar(200), title)
            .input('Description', sql.NVarChar(500), description)
            .input('Order', sql.Int, order || 0)
            .input('Icon', sql.NVarChar(50), icon || '📷')
            .query(`UPDATE Services SET 
                    Title = @Title, 
                    Description = @Description, 
                    [Order] = @Order, 
                    Icon = @Icon 
                    WHERE Id = @Id`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await pool.request()
            .input('Id', sql.VarChar(50), req.params.id)
            .query('DELETE FROM Services WHERE Id = @Id');
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: error.message });
    }
});

// Inquiries
app.get('/api/inquiries', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Inquiries ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/inquiries', async (req, res) => {
    try {
        const id = uuidv4();
        const { name, email, phone, service, message } = req.body;
        
        await pool.request()
            .input('Id', sql.VarChar(50), id)
            .input('Name', sql.NVarChar(200), name)
            .input('Email', sql.NVarChar(200), email)
            .input('Phone', sql.NVarChar(50), phone || '')
            .input('ServiceType', sql.NVarChar(200), service || '')
            .input('Message', sql.NVarChar(sql.MAX), message)
            .query(`INSERT INTO Inquiries (Id, Name, Email, Phone, ServiceType, Message) 
                    VALUES (@Id, @Name, @Email, @Phone, @ServiceType, @Message)`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving inquiry:', error);
        res.status(500).json({ error: error.message });
    }
});

// Image Upload
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

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export All Data (for backup)
app.get('/api/export-all', async (req, res) => {
    try {
        const portfolios = await pool.request().query('SELECT * FROM Portfolio');
        const clients = await pool.request().query('SELECT * FROM Clients');
        const partners = await pool.request().query('SELECT * FROM Partners');
        const services = await pool.request().query('SELECT * FROM Services');
        const inquiries = await pool.request().query('SELECT * FROM Inquiries');
        
        res.json({
            portfolios: portfolios.recordset.map(p => ({ ...p, images: p.Images ? JSON.parse(p.Images) : [] })),
            clients: clients.recordset,
            partners: partners.recordset,
            services: services.recordset,
            inquiries: inquiries.recordset
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
async function startServer() {
    const connected = await connectToDatabase();
    if (connected) {
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on ${SERVER_URL}`);
            console.log(`🗄️ SQL Server Express 2022 is connected`);
            console.log(`📁 Uploads: ${uploadsDir}`);
            console.log(`📁 Data: ${dataDir}`);
            console.log(`\n✅ Ready to accept requests!\n`);
        });
    } else {
        console.log('\n❌ Server cannot start without database connection');
        console.log('💡 Tip: Make sure SQL Server is running and you can connect using SSMS\n');
        process.exit(1);
    }
}

startServer();