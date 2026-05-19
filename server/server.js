import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// تحميل الـ .env من المسار الصحيح
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Checking env variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// ========== Supabase Client ==========
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials! Check your .env file');
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    global: { WebSocket: ws },
    realtime: { params: { eventsPerSecond: 10 } }
  }
);

console.log('✅ Supabase client initialized');

// ========== Helper Functions ==========
function generateId() {
  return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
}

// ========== UPLOAD IMAGE TO SUPABASE STORAGE ==========
app.post('/api/upload-image', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      console.log('❌ No image provided');
      return res.status(400).json({ error: 'No image provided' });
    }
    
    console.log('📸 Received image, length:', image.length);
    
    let base64Data = image;
    if (image.includes(';base64,')) {
      base64Data = image.split(';base64,').pop();
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
    
    console.log('📤 Uploading to Supabase Storage:', fileName);
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(`public/${fileName}`, buffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(`public/${fileName}`);
    
    console.log('✅ Image uploaded:', publicUrl);
    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload-multiple', async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !images.length) {
      return res.status(400).json({ error: 'No images provided' });
    }
    
    const urls = [];
    for (const image of images) {
      let base64Data = image;
      if (image.includes(';base64,')) {
        base64Data = image.split(';base64,').pop();
      }
      
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
      
      const { error } = await supabase.storage
        .from('images')
        .upload(`public/${fileName}`, buffer, {
          contentType: 'image/png',
          cacheControl: '3600'
        });
      
      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(`public/${fileName}`);
        urls.push(publicUrl);
      }
    }
    
    res.json({ success: true, urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/delete-image', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });
  
  try {
    const path = url.split('/').pop();
    const { error } = await supabase.storage
      .from('images')
      .remove([`public/${path}`]);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== API Endpoints ==========

// ===== PORTFOLIO =====
app.get('/api/portfolio', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data.map(p => ({ ...p, images: p.images || [] })));
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/portfolio/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json({ ...data, images: data.images || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio', async (req, res) => {
  try {
    const { title, category, description, coverImage, images } = req.body;
    const id = generateId();
    
    console.log('📝 Creating portfolio with ID:', id);
    
    const { data, error } = await supabase
      .from('portfolios')
      .insert([{ 
        id, 
        title, 
        category, 
        description, 
        coverimage: coverImage,  // اسم العمود الصحيح في Supabase
        images 
      }])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Portfolio created:', data);
    res.json({ success: true, portfolio: data });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/portfolio/:id', async (req, res) => {
  try {
    const { title, category, description, coverImage, images } = req.body;
    
    const { data, error } = await supabase
      .from('portfolios')
      .update({ 
        title, 
        category, 
        description, 
        coverimage: coverImage,
        images 
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, portfolio: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/portfolio/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CLIENTS =====
app.get('/api/clients', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, logo } = req.body;
    const id = generateId();
    
    console.log('📝 Creating client:', { id, name });
    
    const { data, error } = await supabase
      .from('clients')
      .insert([{ id, name, logo }])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Client created:', data);
    res.json({ success: true, client: data });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PARTNERS =====
app.get('/api/partners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    const { name, logo } = req.body;
    const id = generateId();
    
    console.log('📝 Creating partner:', { id, name });
    
    const { data, error } = await supabase
      .from('partners')
      .insert([{ id, name, logo }])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Partner created:', data);
    res.json({ success: true, partner: data });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/partners/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SERVICES =====
app.get('/api/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { title, description, order, icon } = req.body;
    const id = generateId();
    
    console.log('📝 Creating service:', { id, title });
    
    const { data, error } = await supabase
      .from('services')
      .insert([{ id, title, description, order, icon }])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Service created:', data);
    res.json({ success: true, service: data });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { title, description, order, icon } = req.body;
    
    const { data, error } = await supabase
      .from('services')
      .update({ title, description, order, icon })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, service: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== INQUIRIES =====
app.get('/api/inquiries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    const id = generateId();
    
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{ id, name, email, phone, serviceType: service, message }])
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== DELETE ALL DATA =====
app.delete('/api/delete-all-data', async (req, res) => {
  try {
    const { secret } = req.query;
    if (secret !== 'DELETE_ALL_SPECTRA') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await supabase.from('portfolios').delete().neq('id', '0');
    await supabase.from('clients').delete().neq('id', '0');
    await supabase.from('partners').delete().neq('id', '0');
    await supabase.from('services').delete().neq('id', '0');
    await supabase.from('inquiries').delete().neq('id', '0');
    
    const { data: files } = await supabase.storage.from('images').list('public');
    if (files && files.length > 0) {
      await supabase.storage.from('images').remove(files.map(f => `public/${f.name}`));
    }
    
    console.log('🗑️ All data deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting all data:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== SEED DEFAULT DATA =====
async function seedDefaultData() {
  const { data: existing } = await supabase.from('portfolios').select('*', { count: 'exact', head: true });
  
  if (!existing || existing.length === 0) {
    console.log('🌱 Seeding default data...');
    
    await supabase.from('portfolios').insert([
      { id: '1', title: 'Wedding Elegance', category: 'Wedding', coverimage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600'] },
      { id: '2', title: 'Urban Stories', category: 'Street', coverimage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'] },
      { id: '3', title: 'Natural Beauty', category: 'Landscape', coverimage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'] }
    ]);
    
    await supabase.from('clients').insert([
      { id: '1', name: 'Luxury Hotel', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel' },
      { id: '2', name: 'Fashion Brand', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand' },
      { id: '3', name: 'Wedding Planner', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner' }
    ]);
    
    await supabase.from('partners').insert([
      { id: '1', name: 'Canon', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Canon' },
      { id: '2', name: 'Sony', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Sony' },
      { id: '3', name: 'Adobe', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Adobe' },
      { id: '4', name: 'Nikon', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Nikon' }
    ]);
    
    await supabase.from('services').insert([
      { id: '1', title: 'Wedding Photography', description: 'Capturing your special day', order: 1 },
      { id: '2', title: 'Portrait Sessions', description: 'Professional portraits', order: 2 },
      { id: '3', title: 'Commercial', description: 'High-end product photography', order: 3 },
      { id: '4', title: 'Fine Art', description: 'Artistic visual stories', order: 4 },
      { id: '5', title: 'Event Coverage', description: 'Corporate events', order: 5 },
      { id: '6', title: 'Content Creation', description: 'Social media content', order: 6 }
    ]);
    
    console.log('✅ Default data seeded');
  }
}

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'supabase', timestamp: new Date().toISOString() });
});

// ===== START SERVER =====
async function startServer() {
  await seedDefaultData();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🗄️ Supabase (PostgreSQL + Storage)`);
    console.log(`✅ Ready!\n`);
  });
}

startServer();