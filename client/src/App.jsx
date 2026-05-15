import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

// API URL
const API_URL = 'https://spectra-frames-api.onrender.com/api';

// Gallery Modal Component
function GalleryModal({ images, currentIndex, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="gallery-modal" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-close" onClick={onClose}>×</button>
        <button className="gallery-prev" onClick={onPrev}>‹</button>
        <img src={images[currentIndex]} alt={`Gallery ${currentIndex + 1}`} className="gallery-image" />
        <button className="gallery-next" onClick={onNext}>›</button>
        <div className="gallery-counter">{currentIndex + 1} / {images.length}</div>
      </div>
    </div>
  );
}

// Home Page Component
function HomePage({ scrollToSection, portfolios, refreshPortfolios, clients, refreshClients }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    refreshPortfolios();
    refreshClients();
    fetch(`${API_URL}/services`)
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error('Failed to load services:', err));
  }, []);

  const [formStatus, setFormStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Wedding Photography',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    try {
      const response = await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', service: 'Wedding Photography', message: '' });
        setTimeout(() => setFormStatus(''), 5000);
      } else {
        setFormStatus('error');
        setTimeout(() => setFormStatus(''), 5000);
      }
    } catch (error) {
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 5000);
    }
  };

  const uniqueClients = clients.filter((client, index, self) => 
    index === self.findIndex(c => c.id === client.id)
  );

  return (
    <>
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content-centered">
            <div className="logo-centered">
              <img src="/logo.png" alt="Spectra Frames Logo" className="logo-centered-img"
                onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
              <div className="logo-centered-fallback">SF</div>
            </div>
            <div className="hero-buttons-centered">
              <button className="btn-primary" onClick={() => scrollToSection('contact')}>Book Now</button>
              <button className="btn-secondary" onClick={() => scrollToSection('portfolio')}>View Work</button>
            </div>
          </div>
        </div>
      </section>

      <section className="clients-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Partners</h2>
            <p className="section-subtitle">Trusted by leading brands worldwide</p>
          </div>
          {uniqueClients && uniqueClients.length > 0 ? (
            <div className="clients-slider">
              <div className="clients-track">
                {uniqueClients.map((client) => (
                  <div key={client.id} className="client-card">
                    <img 
                      src={client.logo} 
                      alt={client.name} 
                      className="client-logo-img"
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                      }} 
                    />
                    <div className="client-logo-fallback">{client.name.substring(0, 2)}</div>
                    <p className="client-name">{client.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-clients-message">
              <p>Loading partners...</p>
            </div>
          )}
        </div>
      </section>

      <section id="portfolio" className="portfolio">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Portfolio</h2>
            <p className="section-subtitle">Click on any project to view gallery</p>
          </div>
          <div className="portfolio-grid">
            {portfolios.map((item) => (
              <Link to={`/portfolio/${item.id}`} key={item.id} className="portfolio-card-link">
                <div className="portfolio-card">
                  <img src={item.coverImage || item.images?.[0]} alt={item.title} className="portfolio-img" />
                  <div className="portfolio-overlay">
                    <div className="portfolio-info">
                      <span className="portfolio-category">{item.category}</span>
                      <h3 className="portfolio-title">{item.title}</h3>
                      <span className="portfolio-photos-count">{item.images?.length || 1} photos</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Professional photography tailored to your needs</p>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Let's Create Together</h2>
            <p className="section-subtitle">Ready to capture your next moment? Reach out to us</p>
          </div>
          <div className="contact-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              {formStatus === 'success' && <div className="form-success">Message sent successfully!</div>}
              {formStatus === 'error' && <div className="form-error">Something went wrong.</div>}
              {formStatus === 'sending' && <div className="form-sending">Sending...</div>}
              <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required className="form-input" />
              <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required className="form-input" />
              <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="form-input" />
              <select name="service" value={formData.service} onChange={handleChange} className="form-select">
                {services.map((service) => (
                  <option key={service.id} value={service.title}>{service.title}</option>
                ))}
              </select>
              <textarea name="message" rows="4" placeholder="Tell us about your vision..." value={formData.message} onChange={handleChange} required className="form-textarea"></textarea>
              <button type="submit" className="btn-submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

// Portfolio Detail Page - مع تحسين عرض الأخطاء وفحص ID
function PortfolioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        console.log('🔍 Fetching portfolio with ID:', id);
        console.log('📡 API URL:', `${API_URL}/portfolio/${id}`);
        
        const response = await fetch(`${API_URL}/portfolio/${id}`);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Portfolio with ID "${id}" not found on server`);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Portfolio data loaded:', data);
        
        if (!data || !data.id) {
          throw new Error('Invalid portfolio data received');
        }
        
        setItem(data);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading portfolio detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPortfolio();
    } else {
      setError('No portfolio ID provided');
      setLoading(false);
    }
  }, [id]);

  const openGallery = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % (item?.images?.length || 1));
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + (item?.images?.length || 1)) % (item?.images?.length || 1));

  if (loading) return <div className="loading">Loading...</div>;
  
  if (error) {
    return (
      <div className="portfolio-detail">
        <div className="container">
          <div className="loading" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#dc3545', marginBottom: '20px' }}>⚠️ Error: {error}</p>
            <p style={{ color: '#B8B0A8', marginBottom: '30px' }}>The portfolio item you're looking for might have been deleted or the ID is incorrect.</p>
            <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="portfolio-detail">
        <div className="container">
          <div className="loading" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#D4AF37', marginBottom: '30px' }}>Project not found</p>
            <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  const images = item.images || (item.coverImage ? [item.coverImage] : []);

  return (
    <div className="portfolio-detail">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>Back to Home</button>
        <div className="detail-header">
          <h1>{item.title}</h1>
          <span className="detail-category">{item.category}</span>
          <p className="detail-description">{item.description}</p>
          <p className="detail-photos-count">{images.length} photos</p>
        </div>
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <div key={idx} className="gallery-item" onClick={() => openGallery(idx)}>
              <img src={img} alt={`${item.title} ${idx + 1}`} />
              {idx === 0 && images.length > 1 && <div className="gallery-overlay"><span>+{images.length - 1}</span></div>}
            </div>
          ))}
        </div>
        {modalOpen && (
          <GalleryModal 
            images={images} 
            currentIndex={currentImageIndex} 
            onClose={() => setModalOpen(false)} 
            onNext={nextImage} 
            onPrev={prevImage} 
          />
        )}
      </div>
    </div>
  );
}

// Admin Panel Component
function AdminPanel() {
  const [portfolios, setPortfolios] = useState([]);
  const [partners, setPartners] = useState([]);
  const [clients, setClients] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [showImageManager, setShowImageManager] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  const [formData, setFormData] = useState({ title: '', category: 'Wedding', description: '', images: [] });
  const [tempImages, setTempImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [newImagesForPortfolio, setNewImagesForPortfolio] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [partnerFormData, setPartnerFormData] = useState({ name: '', logo: '' });
  const [partnerImagePreview, setPartnerImagePreview] = useState('');
  const [clientFormData, setClientFormData] = useState({ name: '', logo: '' });
  const [clientImagePreview, setClientImagePreview] = useState('');
  
  const [serviceFormData, setServiceFormData] = useState({ title: '', description: '' });
  const [editingService, setEditingService] = useState(null);
  const [editServiceForm, setEditServiceForm] = useState({ title: '', description: '' });

  const navigate = useNavigate();

  const uploadToServer = async (base64Image) => {
    try {
      console.log('📤 Uploading image to server...');
      const blob = await fetch(base64Image).then(r => r.blob());
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      const response = await fetch(`${API_URL}/upload-image`, { method: 'POST', body: formData });
      const data = await response.json();
      console.log('✅ Server response:', data);
      if (data.url) {
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const loadPortfolios = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio`);
      const data = await res.json();
      console.log('📋 Loaded portfolios:', data);
      setPortfolios(data);
    } catch (err) {
      console.error('Failed to load portfolios:', err);
      setPortfolios([]);
    }
  };

  const loadPartners = async () => {
    try {
      const res = await fetch(`${API_URL}/partners`);
      const data = await res.json();
      const unique = data.filter((item, index, self) => index === self.findIndex(i => i.id === item.id));
      setPartners(unique);
    } catch (err) {
      setPartners([]);
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`);
      const data = await res.json();
      const unique = data.filter((item, index, self) => index === self.findIndex(i => i.id === item.id));
      setClients(unique);
    } catch (err) {
      setClients([]);
    }
  };

  const loadInquiries = async () => {
    try {
      const res = await fetch(`${API_URL}/inquiries`);
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      setInquiries([]);
    }
  };

  const loadServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setServices([]);
    }
  };

  const refreshAllData = () => {
    loadPortfolios();
    loadPartners();
    loadClients();
    loadInquiries();
    loadServices();
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      refreshAllData();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      refreshAllData();
    } else {
      alert('Wrong password! Use: admin123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    files.forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`Image ${file.name} too large! Max 50MB`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        newPreviews.push(reader.result);
        if (newImages.length === files.length) {
          setTempImages([...tempImages, ...newImages]);
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageFromUrl = () => {
    if (imageUrlInput && imageUrlInput.trim() !== '') {
      setTempImages([...tempImages, imageUrlInput]);
      setImagePreviews([...imagePreviews, imageUrlInput]);
      setImageUrlInput('');
      alert('Image URL added!');
    }
  };

  const removeTempImage = (index) => {
    const newTemp = [...tempImages];
    const newPreviews = [...imagePreviews];
    newTemp.splice(index, 1);
    newPreviews.splice(index, 1);
    setTempImages(newTemp);
    setImagePreviews(newPreviews);
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please enter a title!');
      return;
    }
    if (tempImages.length === 0) {
      alert('Please add at least one image!');
      return;
    }
    
    setUploading(true);
    const uploadedUrls = [];
    for (const img of tempImages) {
      if (img.startsWith('http')) {
        uploadedUrls.push(img);
      } else {
        const url = await uploadToServer(img);
        if (url) {
          uploadedUrls.push(url);
        } else {
          alert('Failed to upload image');
          setUploading(false);
          return;
        }
      }
    }
    
    const newPortfolio = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      coverImage: uploadedUrls[0],
      images: uploadedUrls
    };
    
    const res = await fetch(`${API_URL}/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPortfolio)
    });
    
    const data = await res.json();
    console.log('Server response:', data);
    
    if (res.ok) {
      alert('Portfolio added successfully!');
      setFormData({ title: '', category: 'Wedding', description: '', images: [] });
      setTempImages([]);
      setImagePreviews([]);
      loadPortfolios();
    }
    setUploading(false);
  };

  const handleDeletePortfolio = async (id) => {
    if (window.confirm('Delete this portfolio?')) {
      const res = await fetch(`${API_URL}/portfolio/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted!');
        loadPortfolios();
      }
    }
  };

  const openImageManager = (portfolio) => {
    setCurrentPortfolio(portfolio);
    setNewImagesForPortfolio([]);
    setNewImagePreviews([]);
    setImageUrlInput('');
    setShowImageManager(true);
  };

  const handleAddImagesToPortfolio = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];
    files.forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`Image ${file.name} too large!`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        newPreviews.push(reader.result);
        if (newImages.length === files.length) {
          setNewImagesForPortfolio([...newImagesForPortfolio, ...newImages]);
          setNewImagePreviews([...newImagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageUrlToManager = () => {
    if (imageUrlInput && imageUrlInput.trim() !== '') {
      setNewImagesForPortfolio([...newImagesForPortfolio, imageUrlInput]);
      setNewImagePreviews([...newImagePreviews, imageUrlInput]);
      setImageUrlInput('');
      alert('URL added!');
    }
  };

  const saveNewImagesToPortfolio = async () => {
    if (newImagesForPortfolio.length === 0) {
      alert('No images to add!');
      return;
    }
    
    setUploading(true);
    const uploadedUrls = [];
    for (const img of newImagesForPortfolio) {
      if (img.startsWith('http')) {
        uploadedUrls.push(img);
      } else {
        const url = await uploadToServer(img);
        if (url) uploadedUrls.push(url);
      }
    }
    
    const updatedPortfolio = {
      ...currentPortfolio,
      images: [...currentPortfolio.images, ...uploadedUrls],
      coverImage: currentPortfolio.coverImage || uploadedUrls[0]
    };
    
    const res = await fetch(`${API_URL}/portfolio/${currentPortfolio.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPortfolio)
    });
    
    if (res.ok) {
      alert('Images added!');
      setNewImagesForPortfolio([]);
      setNewImagePreviews([]);
      setShowImageManager(false);
      loadPortfolios();
    }
    setUploading(false);
  };

  const deleteImageFromPortfolio = async (imageIndex) => {
    if (window.confirm('Delete this image?')) {
      const updatedImages = [...currentPortfolio.images];
      updatedImages.splice(imageIndex, 1);
      const res = await fetch(`${API_URL}/portfolio/${currentPortfolio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentPortfolio, images: updatedImages, coverImage: updatedImages[0] || '' })
      });
      if (res.ok) {
        alert('Image deleted');
        loadPortfolios();
        setCurrentPortfolio({ ...currentPortfolio, images: updatedImages });
      }
    }
  };

  const closeImageManager = () => {
    setShowImageManager(false);
    setCurrentPortfolio(null);
    setNewImagesForPortfolio([]);
    setNewImagePreviews([]);
  };

  const handlePartnerImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo too large! Max 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerImagePreview(reader.result);
        setPartnerFormData({ ...partnerFormData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerFormData.name || !partnerFormData.logo) {
      alert('Please fill name and logo!');
      return;
    }
    
    let logoUrl = partnerFormData.logo;
    if (!logoUrl.startsWith('http')) {
      const uploadedUrl = await uploadToServer(logoUrl);
      if (uploadedUrl) {
        logoUrl = uploadedUrl;
      } else {
        alert('Failed to upload logo');
        return;
      }
    }
    
    const res = await fetch(`${API_URL}/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: partnerFormData.name, logo: logoUrl })
    });
    
    if (res.ok) {
      alert('Partner added!');
      setPartnerFormData({ name: '', logo: '' });
      setPartnerImagePreview('');
      loadPartners();
      loadClients();
    }
  };

  const handleDeletePartner = async (id) => {
    if (window.confirm('Delete this partner?')) {
      const res = await fetch(`${API_URL}/partners/${id}`, { method: 'DELETE' });
      if (res.ok) { 
        alert('Deleted!');
        loadPartners();
        loadClients();
      }
    }
  };

  const handleClientImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo too large! Max 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientImagePreview(reader.result);
        setClientFormData({ ...clientFormData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!clientFormData.name || !clientFormData.logo) {
      alert('Please fill name and logo!');
      return;
    }
    
    let logoUrl = clientFormData.logo;
    if (!logoUrl.startsWith('http')) {
      const uploadedUrl = await uploadToServer(logoUrl);
      if (uploadedUrl) {
        logoUrl = uploadedUrl;
      } else {
        alert('Failed to upload logo');
        return;
      }
    }
    
    const res = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: clientFormData.name, logo: logoUrl })
    });
    
    if (res.ok) {
      alert('Client added!');
      setClientFormData({ name: '', logo: '' });
      setClientImagePreview('');
      loadClients();
      loadPartners();
    }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm('Delete this client?')) {
      const res = await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
      if (res.ok) { 
        alert('Deleted!');
        loadClients();
        loadPartners();
      }
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceFormData.title || !serviceFormData.description) {
      alert('Please fill title and description!');
      return;
    }
    
    const res = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceFormData)
    });
    
    if (res.ok) {
      alert('Service added!');
      setServiceFormData({ title: '', description: '' });
      loadServices();
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Delete this service?')) {
      const res = await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted!');
        loadServices();
      }
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setEditServiceForm({
      title: service.title,
      description: service.description
    });
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/services/${editingService.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editServiceForm)
    });
    
    if (res.ok) {
      alert('Service updated!');
      setEditingService(null);
      setEditServiceForm({ title: '', description: '' });
      loadServices();
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setEditServiceForm({ title: '', description: '' });
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <div className="container">
          <div className="login-box">
            <button className="back-to-home" onClick={() => navigate('/')}>Back to Home</button>
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
              <button type="submit" className="btn-primary">Login</button>
            </form>
            <p className="hint">Password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel - Spectra Frames</h1>
          <div>
            <button onClick={refreshAllData} className="btn-secondary" style={{ marginRight: '10px' }}>Refresh</button>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>Portfolio ({portfolios.length})</button>
          <button className={`tab-btn ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>Partners ({partners.length})</button>
          <button className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>Clients ({clients.length})</button>
          <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services ({services.length})</button>
          <button className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`} onClick={() => setActiveTab('inquiries')}>Inquiries ({inquiries.length})</button>
        </div>
        
        {activeTab === 'portfolio' && (
          <>
            <div className="admin-form">
              <h2>Add New Portfolio Project</h2>
              <form onSubmit={handleAddPortfolio}>
                <input type="text" name="title" placeholder="Project Title" value={formData.title} onChange={handleInputChange} required className="form-input" />
                <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                  <option>Wedding</option><option>Portrait</option><option>Landscape</option><option>Street</option>
                  <option>Wildlife</option><option>Architecture</option><option>Event</option><option>Commercial</option>
                </select>
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="3" className="form-textarea"></textarea>
                <div className="image-upload-area">
                  <h3>Add Images</h3>
                  <label className="upload-label">Upload from Device (Max 50MB)
                    <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} style={{ display: 'none' }} />
                  </label>
                  <div className="url-input-group">
                    <input type="text" placeholder="Or enter image URL" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="form-input" />
                    <button type="button" onClick={addImageFromUrl} className="btn-secondary">Add URL</button>
                  </div>
                  {uploading && <div className="form-sending">Uploading...</div>}
                  {imagePreviews.length > 0 && (
                    <div className="image-previews-grid">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="image-preview-item">
                          <img src={preview} alt="Preview" />
                          <button type="button" onClick={() => removeTempImage(idx)}>✖</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-primary" disabled={uploading}>Create Portfolio</button>
              </form>
            </div>
            <div className="admin-list">
              <h2>Your Portfolio Projects</h2>
              <div className="portfolio-admin-grid">
                {portfolios.map(item => (
                  <div key={item.id} className="portfolio-admin-card">
                    <img src={item.coverImage || item.images?.[0]} alt={item.title} />
                    <div className="info">
                      <h3>{item.title}</h3>
                      <p>{item.category}</p>
                      <p className="photos-count">{item.images?.length || 0} photos</p>
                      <button onClick={() => openImageManager(item)} className="edit-btn">Manage Images</button>
                      <button onClick={() => handleDeletePortfolio(item.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'partners' && (
          <>
            <div className="admin-form">
              <h2>Add Partner</h2>
              <form onSubmit={handleAddPartner}>
                <input type="text" name="name" placeholder="Partner Name" value={partnerFormData.name} onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })} required className="form-input" />
                <div className="image-upload-area">
                  <label className="upload-label">Upload Logo (Max 5MB)
                    <input type="file" accept="image/*" onChange={handlePartnerImageUpload} style={{ display: 'none' }} />
                  </label>
                  {partnerImagePreview && <div className="image-preview"><img src={partnerImagePreview} alt="Preview" /><button type="button" onClick={() => { setPartnerImagePreview(''); setPartnerFormData({ ...partnerFormData, logo: '' }); }}>Remove</button></div>}
                </div>
                <button type="submit" className="btn-primary">Add Partner</button>
              </form>
            </div>
            <div className="admin-list">
              <h2>Partners ({partners.length})</h2>
              <div className="partners-admin-grid">
                {partners.map(partner => (
                  <div key={partner.id} className="partner-admin-card">
                    <img src={partner.logo} alt={partner.name} />
                    <div className="info">
                      <h3>{partner.name}</h3>
                      <button onClick={() => handleDeletePartner(partner.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'clients' && (
          <>
            <div className="admin-form">
              <h2>Add Client Logo</h2>
              <form onSubmit={handleAddClient}>
                <input type="text" name="name" placeholder="Client Name" value={clientFormData.name} onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })} required className="form-input" />
                <div className="image-upload-area">
                  <label className="upload-label">Upload Logo (Max 5MB)
                    <input type="file" accept="image/*" onChange={handleClientImageUpload} style={{ display: 'none' }} />
                  </label>
                  {clientImagePreview && <div className="image-preview"><img src={clientImagePreview} alt="Preview" /><button type="button" onClick={() => { setClientImagePreview(''); setClientFormData({ ...clientFormData, logo: '' }); }}>Remove</button></div>}
                </div>
                <button type="submit" className="btn-primary">Add Client</button>
              </form>
            </div>
            <div className="admin-list">
              <h2>Clients Logos ({clients.length})</h2>
              <div className="partners-admin-grid">
                {clients.map(client => (
                  <div key={client.id} className="partner-admin-card">
                    <img src={client.logo} alt={client.name} />
                    <div className="info">
                      <h3>{client.name}</h3>
                      <button onClick={() => handleDeleteClient(client.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <div className="admin-form">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <form onSubmit={editingService ? handleUpdateService : handleAddService}>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Service Title" 
                  value={editingService ? editServiceForm.title : serviceFormData.title} 
                  onChange={(e) => editingService 
                    ? setEditServiceForm({ ...editServiceForm, title: e.target.value })
                    : setServiceFormData({ ...serviceFormData, title: e.target.value })
                  } 
                  required 
                  className="form-input" 
                />
                <textarea 
                  name="description" 
                  placeholder="Service Description" 
                  value={editingService ? editServiceForm.description : serviceFormData.description} 
                  onChange={(e) => editingService 
                    ? setEditServiceForm({ ...editServiceForm, description: e.target.value })
                    : setServiceFormData({ ...serviceFormData, description: e.target.value })
                  } 
                  rows="3" 
                  required 
                  className="form-textarea"
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary">
                    {editingService ? 'Update Service' : 'Add Service'}
                  </button>
                  {editingService && (
                    <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div className="admin-list">
              <h2>Services List ({services.length})</h2>
              <div className="services-admin-grid">
                {services.map(service => (
                  <div key={service.id} className="service-admin-card">
                    <div className="info">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button onClick={() => handleEditService(service)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDeleteService(service.id)} className="delete-btn">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'inquiries' && (
          <div className="admin-list">
            <h2>Contact Inquiries ({inquiries.length})</h2>
            <div className="inquiries-list">
              {inquiries.map(inquiry => (
                <div key={inquiry.id} className="inquiry-card">
                  <p><strong>Name:</strong> {inquiry.name}</p>
                  <p><strong>Email:</strong> {inquiry.email}</p>
                  <p><strong>Phone:</strong> {inquiry.phone || '-'}</p>
                  <p><strong>Service:</strong> {inquiry.serviceType}</p>
                  <p><strong>Message:</strong> {inquiry.message}</p>
                  <p><strong>Date:</strong> {new Date(inquiry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {showImageManager && currentPortfolio && (
        <div className="image-manager-modal">
          <div className="image-manager-content">
            <div className="image-manager-header">
              <h2>Manage Images - {currentPortfolio.title}</h2>
              <button className="close-modal" onClick={closeImageManager}>×</button>
            </div>
            <div className="image-manager-body">
              <div className="add-images-section">
                <h3>Add New Images</h3>
                <label className="upload-label">Upload from Device (Max 50MB)
                  <input type="file" accept="image/*" multiple onChange={handleAddImagesToPortfolio} style={{ display: 'none' }} />
                </label>
                <div className="url-input-group">
                  <input type="text" placeholder="Or enter image URL" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="form-input" />
                  <button type="button" onClick={addImageUrlToManager} className="btn-secondary">Add URL</button>
                </div>
                {uploading && <div className="form-sending">Uploading...</div>}
                {newImagePreviews.length > 0 && (
                  <div className="new-images-preview">
                    <h4>New images to add:</h4>
                    <div className="new-images-grid">
                      {newImagePreviews.map((preview, idx) => <div key={idx} className="new-image-item"><img src={preview} alt="New" /></div>)}
                    </div>
                    <button onClick={saveNewImagesToPortfolio} className="btn-primary" disabled={uploading}>Save Images</button>
                  </div>
                )}
              </div>
              <div className="existing-images-section">
                <h3>Existing Images ({currentPortfolio.images?.length || 0})</h3>
                <div className="existing-images-grid">
                  {currentPortfolio.images?.map((img, idx) => (
                    <div key={idx} className="existing-image-item">
                      <img src={img} alt="Existing" />
                      <button onClick={() => deleteImageFromPortfolio(idx)} className="delete-image-btn">✖</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App
function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [clients, setClients] = useState([]);

  const loadPortfolios = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio`);
      const data = await res.json();
      console.log('🏠 Main App - Portfolios:', data);
      setPortfolios(data);
    } catch (err) {
      console.error('Failed to load portfolios:', err);
      setPortfolios([]);
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`);
      const data = await res.json();
      const unique = data.filter((item, index, self) => index === self.findIndex(i => i.id === item.id));
      setClients(unique);
    } catch (err) {
      setClients([]);
    }
  };

  useEffect(() => {
    loadPortfolios();
    loadClients();
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const refreshPortfolios = () => loadPortfolios();
  const refreshClients = () => loadClients();

  return (
    <Router>
      <div className="app">
        {showScrollTop && <button onClick={scrollToTop} className="floating-scroll">↑</button>}
        <div className="admin-link"><Link to="/admin">Admin</Link></div>
        <Routes>
          <Route path="/" element={<HomePage scrollToSection={scrollToSection} portfolios={portfolios} refreshPortfolios={refreshPortfolios} clients={clients} refreshClients={refreshClients} />} />
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <footer className="footer">
          <div className="container">
            <div className="footer-logo">
              <span className="footer-logo-text">SPECTRA FRAMES</span>
            </div>
            <div className="footer-social">
              <a href="https://facebook.com/spectraframes" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com/spectraframes" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <FaInstagram />
              </a>
              <a href="https://tiktok.com/@spectraframes" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                <FaTiktok />
              </a>
              <a href="https://wa.me/96171234567" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                <FaWhatsapp />
              </a>
            </div>
            <div className="footer-contact-info">
              <p className="footer-contact">Beirut, Lebanon | +961 71 123 456 | <a href="mailto:spectraframes.00@gmail.com" className="footer-email-link">spectraframes.00@gmail.com</a></p>
            </div>
            <p className="footer-copyright">2024 Spectra Frames Photography Agency. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;