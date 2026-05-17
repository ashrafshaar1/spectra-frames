import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaUserLock } from 'react-icons/fa';

// API URL
const API_URL = 'https://spectra-frames-api.onrender.com/api';
// للـ local development استخدم:
// const API_URL = 'http://localhost:3001/api';

// Admin credentials
const ADMIN_USERNAME = 'ashrafshaar';
const ADMIN_PASSWORD = 'ItShYpEr75@';

// Lazy Image Component with skeleton loader (معدل)
function LazyImage({ src, alt, className, onError }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className={`${className} image-error`} style={{
        background: '#2a2a2a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#D4AF37',
        fontSize: '14px'
      }}>
        📷
      </div>
    );
  }
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!loaded && (
        <div 
          className="image-skeleton"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-loading 1.5s infinite',
            borderRadius: 'inherit',
            zIndex: 1
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'relative',
          zIndex: 2
        }}
      />
    </div>
  );
}

// Gallery Modal Component
function GalleryModal({ images, currentIndex, onClose, onNext, onPrev }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

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
        
        {!imageLoaded && (
          <div 
            className="image-skeleton"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              background: 'linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-loading 1.5s infinite',
              borderRadius: '8px'
            }}
          />
        )}
        <img 
          src={images[currentIndex]} 
          alt={`Gallery ${currentIndex + 1}`} 
          className="gallery-image"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
        
        <button className="gallery-next" onClick={onNext}>›</button>
        <div className="gallery-counter">{currentIndex + 1} / {images.length}</div>
      </div>
    </div>
  );
}

// Home Page Component
function HomePage({ scrollToSection, portfolios, refreshPortfolios }) {
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [formStatus, setFormStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Wedding Photography',
    message: ''
  });

  const loadData = () => {
    fetch(`${API_URL}/clients`)
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => console.error('Failed to load clients:', err));
    
    fetch(`${API_URL}/partners`)
      .then(res => res.json())
      .then(data => setPartners(data))
      .catch(err => console.error('Failed to load partners:', err));
    
    fetch(`${API_URL}/services`)
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error('Failed to load services:', err));
  };

  useEffect(() => {
    refreshPortfolios();
    loadData();
    
    const interval = setInterval(() => loadData(), 10000);
    return () => clearInterval(interval);
  }, []);

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

      {clients.length > 0 && (
        <section className="clients-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Clients</h2>
              <p className="section-subtitle">Trusted by leading brands worldwide</p>
            </div>
            <div className="clients-slider">
              <div className="clients-track">
                {clients.map((client) => (
                  <div key={client._id} className="client-card">
                    <div className="client-logo-img" style={{ position: 'relative', width: '130px', height: '70px' }}>
                      <LazyImage src={client.logo} alt={client.name} className="client-logo-img" />
                    </div>
                    <p className="client-name">{client.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {partners.length > 0 && (
        <section className="partners-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Partners</h2>
              <p className="section-subtitle">Collaborating with industry leaders</p>
            </div>
            <div className="partners-slider">
              <div className="partners-track">
                {partners.map((partner) => (
                  <div key={partner._id} className="partner-card">
                    <div className="partner-logo-img" style={{ position: 'relative', width: '130px', height: '70px' }}>
                      <LazyImage src={partner.logo} alt={partner.name} className="partner-logo-img" />
                    </div>
                    <p className="partner-name">{partner.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="portfolio" className="portfolio">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Portfolio</h2>
            <p className="section-subtitle">Click on any project to view gallery</p>
          </div>
          <div className="portfolio-grid">
            {portfolios.map((item) => (
              <Link to={`/portfolio/${item._id}`} key={item._id} className="portfolio-card-link">
                <div className="portfolio-card">
                  <div className="portfolio-img">
                    <LazyImage 
                      src={item.coverImage || item.images?.[0]} 
                      alt={item.title} 
                      className="portfolio-img-img"
                    />
                  </div>
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
              <div key={service._id} className="service-card">
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
                  <option key={service._id} value={service.title}>{service.title}</option>
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

// Portfolio Detail Page
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
        const res = await fetch(`${API_URL}/portfolio/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPortfolio();
  }, [id]);

  const openGallery = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % (item?.images?.length || 1));
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + (item?.images?.length || 1)) % (item?.images?.length || 1));

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="loading">Error: {error}</div>;
  if (!item) return <div className="loading">Not found</div>;

  const images = item.images || (item.coverImage ? [item.coverImage] : []);

  return (
    <div className="portfolio-detail">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        <div className="detail-header">
          <h1>{item.title}</h1>
          <span className="detail-category">{item.category}</span>
          <p className="detail-description">{item.description}</p>
          <p className="detail-photos-count">{images.length} photos</p>
        </div>
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <div key={idx} className="gallery-item" onClick={() => openGallery(idx)}>
              <LazyImage src={img} alt={`${item.title} ${idx + 1}`} className="" />
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [showImageManager, setShowImageManager] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [formKey, setFormKey] = useState(0);
  
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

  const showModalMessage = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  const showConfirmModalMessage = (message, action, id) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (confirmAction) {
      confirmAction(confirmId);
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmId(null);
  };

  // ========== DELETE FUNCTIONS (المصلحة) ==========
  
  const handleDeletePortfolio = async (id) => {
    console.log('🛑 Deleting portfolio with _id:', id);
    if (!id || id === 'undefined') {
      showModalMessage('Error', 'Invalid ID');
      return;
    }
    
    showConfirmModalMessage('Are you sure you want to delete this portfolio?', async () => {
      try {
        const res = await fetch(`${API_URL}/portfolio/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showModalMessage('Success', 'Portfolio deleted successfully!');
          loadPortfolios();
        } else {
          const error = await res.json();
          showModalMessage('Error', error.error || 'Delete failed');
        }
      } catch (error) {
        showModalMessage('Error', 'Network error');
      }
    }, id);
  };

  const handleDeletePartner = async (id) => {
    console.log('🛑 Deleting partner with _id:', id);
    if (!id || id === 'undefined') {
      showModalMessage('Error', 'Invalid ID');
      return;
    }
    
    showConfirmModalMessage('Are you sure you want to delete this partner?', async () => {
      try {
        const res = await fetch(`${API_URL}/partners/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showModalMessage('Success', 'Partner deleted successfully!');
          loadPartners();
        } else {
          showModalMessage('Error', 'Delete failed');
        }
      } catch (error) {
        showModalMessage('Error', 'Network error');
      }
    }, id);
  };

  const handleDeleteClient = async (id) => {
    console.log('🛑 Deleting client with _id:', id);
    if (!id || id === 'undefined') {
      showModalMessage('Error', 'Invalid ID');
      return;
    }
    
    showConfirmModalMessage('Are you sure you want to delete this client?', async () => {
      try {
        const res = await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showModalMessage('Success', 'Client deleted successfully!');
          loadClients();
        } else {
          showModalMessage('Error', 'Delete failed');
        }
      } catch (error) {
        showModalMessage('Error', 'Network error');
      }
    }, id);
  };

  const handleDeleteService = async (id) => {
    console.log('🛑 Deleting service with _id:', id);
    if (!id || id === 'undefined') {
      showModalMessage('Error', 'Invalid ID');
      return;
    }
    
    showConfirmModalMessage('Are you sure you want to delete this service?', async () => {
      try {
        const res = await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showModalMessage('Success', 'Service deleted successfully!');
          loadServices();
        } else {
          showModalMessage('Error', 'Delete failed');
        }
      } catch (error) {
        showModalMessage('Error', 'Network error');
      }
    }, id);
  };

  const handleDeleteAllPartners = async () => {
    showConfirmModalMessage('Are you sure you want to DELETE ALL PARTNERS?', async () => {
      for (const partner of partners) {
        await fetch(`${API_URL}/partners/${partner._id}`, { method: 'DELETE' });
      }
      showModalMessage('Success', 'All partners deleted!');
      loadPartners();
    }, null);
  };

  const handleDeleteAllClients = async () => {
    showConfirmModalMessage('Are you sure you want to DELETE ALL CLIENTS?', async () => {
      for (const client of clients) {
        await fetch(`${API_URL}/clients/${client._id}`, { method: 'DELETE' });
      }
      showModalMessage('Success', 'All clients deleted!');
      loadClients();
    }, null);
  };

  // Upload functions
  const uploadToServer = async (base64Image, onProgress) => {
    try {
      const blob = await fetch(base64Image).then(r => r.blob());
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/upload-image`);
        
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              onProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
        }
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.response);
            resolve(data.url);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  // Load functions
  const loadPortfolios = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio`);
      const data = await res.json();
      setPortfolios(data);
    } catch (err) {
      setPortfolios([]);
    }
  };

  const loadPartners = async () => {
    try {
      const res = await fetch(`${API_URL}/partners`);
      const data = await res.json();
      setPartners(data);
    } catch (err) {
      setPartners([]);
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`);
      const data = await res.json();
      setClients(data);
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
    setLoginError('');
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      refreshAllData();
    } else {
      setLoginError('Invalid username or password!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('adminLoggedIn');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 50 * 1024 * 1024) {
        showModalMessage('Error', `Image ${file.name} too large!`);
        continue;
      }
      
      setUploading(true);
      setUploadProgress(0);
      
      const reader = new FileReader();
      const uploadPromise = new Promise((resolve) => {
        reader.onloadend = async () => {
          const base64Image = reader.result;
          const url = await uploadToServer(base64Image, (progress) => {
            setUploadProgress(progress);
          });
          resolve(url);
        };
      });
      
      reader.readAsDataURL(file);
      const url = await uploadPromise;
      
      if (url) {
        newImages.push(url);
        newPreviews.push(url);
      }
    }
    
    setTempImages([...tempImages, ...newImages]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setUploading(false);
    setTimeout(() => setUploadProgress(0), 1000);
  };

  const addImageFromUrl = () => {
    if (imageUrlInput && imageUrlInput.trim() !== '') {
      setTempImages([...tempImages, imageUrlInput]);
      setImagePreviews([...imagePreviews, imageUrlInput]);
      setImageUrlInput('');
      showModalMessage('Success', 'Image URL added successfully!');
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
      showModalMessage('Error', 'Please enter a title!');
      return;
    }
    if (tempImages.length === 0) {
      showModalMessage('Error', 'Please add at least one image!');
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
    
    if (res.ok) {
      showModalMessage('Success', 'Portfolio added successfully!');
      setFormData({ title: '', category: 'Wedding', description: '', images: [] });
      setTempImages([]);
      setImagePreviews([]);
      loadPortfolios();
      setFormKey(prev => prev + 1);
    } else {
      showModalMessage('Error', 'Failed to save portfolio');
    }
    setUploading(false);
  };

  const openImageManager = (portfolio) => {
    setCurrentPortfolio(portfolio);
    setNewImagesForPortfolio([]);
    setNewImagePreviews([]);
    setImageUrlInput('');
    setShowImageManager(true);
  };

  const handleAddImagesToPortfolio = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 50 * 1024 * 1024) continue;
      
      setUploading(true);
      setUploadProgress(0);
      
      const reader = new FileReader();
      const uploadPromise = new Promise((resolve) => {
        reader.onloadend = async () => {
          const base64Image = reader.result;
          const url = await uploadToServer(base64Image, (progress) => {
            setUploadProgress(progress);
          });
          resolve(url);
        };
      });
      
      reader.readAsDataURL(file);
      const url = await uploadPromise;
      
      if (url) {
        newImages.push(url);
        newPreviews.push(url);
      }
    }
    
    setNewImagesForPortfolio([...newImagesForPortfolio, ...newImages]);
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
    setUploading(false);
    setTimeout(() => setUploadProgress(0), 1000);
  };

  const addImageUrlToManager = () => {
    if (imageUrlInput && imageUrlInput.trim() !== '') {
      setNewImagesForPortfolio([...newImagesForPortfolio, imageUrlInput]);
      setNewImagePreviews([...newImagePreviews, imageUrlInput]);
      setImageUrlInput('');
      showModalMessage('Success', 'Image URL added successfully!');
    }
  };

  const saveNewImagesToPortfolio = async () => {
    if (newImagesForPortfolio.length === 0) {
      showModalMessage('Error', 'No images to add!');
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
    
    const res = await fetch(`${API_URL}/portfolio/${currentPortfolio._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPortfolio)
    });
    
    if (res.ok) {
      showModalMessage('Success', `${uploadedUrls.length} images added!`);
      setNewImagesForPortfolio([]);
      setNewImagePreviews([]);
      setShowImageManager(false);
      loadPortfolios();
    }
    setUploading(false);
  };

  const deleteImageFromPortfolio = (imageIndex) => {
    showConfirmModalMessage('Delete this image?', async () => {
      const updatedImages = [...currentPortfolio.images];
      updatedImages.splice(imageIndex, 1);
      const res = await fetch(`${API_URL}/portfolio/${currentPortfolio._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentPortfolio, images: updatedImages, coverImage: updatedImages[0] || '' })
      });
      if (res.ok) {
        showModalMessage('Success', 'Image deleted!');
        loadPortfolios();
        setCurrentPortfolio({ ...currentPortfolio, images: updatedImages });
      }
    }, null);
  };

  const closeImageManager = () => {
    setShowImageManager(false);
    setCurrentPortfolio(null);
    setNewImagesForPortfolio([]);
    setNewImagePreviews([]);
  };

  const handlePartnerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showModalMessage('Error', 'Logo too large!');
        return;
      }
      
      setUploading(true);
      setUploadProgress(0);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const uploadedUrl = await uploadToServer(base64Image, (progress) => {
          setUploadProgress(progress);
        });
        if (uploadedUrl) {
          setPartnerImagePreview(uploadedUrl);
          setPartnerFormData({ ...partnerFormData, logo: uploadedUrl });
        }
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerFormData.name || !partnerFormData.logo) {
      showModalMessage('Error', 'Please fill name and logo!');
      return;
    }
    
    let logoUrl = partnerFormData.logo;
    if (!logoUrl.startsWith('http')) {
      const uploadedUrl = await uploadToServer(logoUrl);
      if (uploadedUrl) logoUrl = uploadedUrl;
    }
    
    const res = await fetch(`${API_URL}/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: partnerFormData.name, logo: logoUrl })
    });
    
    if (res.ok) {
      showModalMessage('Success', 'Partner added!');
      setPartnerFormData({ name: '', logo: '' });
      setPartnerImagePreview('');
      loadPartners();
    } else {
      showModalMessage('Error', 'Failed to add partner');
    }
  };

  const handleClientImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showModalMessage('Error', 'Logo too large!');
        return;
      }
      
      setUploading(true);
      setUploadProgress(0);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const uploadedUrl = await uploadToServer(base64Image, (progress) => {
          setUploadProgress(progress);
        });
        if (uploadedUrl) {
          setClientImagePreview(uploadedUrl);
          setClientFormData({ ...clientFormData, logo: uploadedUrl });
        }
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!clientFormData.name || !clientFormData.logo) {
      showModalMessage('Error', 'Please fill name and logo!');
      return;
    }
    
    let logoUrl = clientFormData.logo;
    if (!logoUrl.startsWith('http')) {
      const uploadedUrl = await uploadToServer(logoUrl);
      if (uploadedUrl) logoUrl = uploadedUrl;
    }
    
    const res = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: clientFormData.name, logo: logoUrl })
    });
    
    if (res.ok) {
      showModalMessage('Success', 'Client added!');
      setClientFormData({ name: '', logo: '' });
      setClientImagePreview('');
      loadClients();
    } else {
      showModalMessage('Error', 'Failed to add client');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceFormData.title || !serviceFormData.description) {
      showModalMessage('Error', 'Please fill title and description!');
      return;
    }
    
    const res = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceFormData)
    });
    
    if (res.ok) {
      showModalMessage('Success', 'Service added!');
      setServiceFormData({ title: '', description: '' });
      loadServices();
    } else {
      showModalMessage('Error', 'Failed to add service');
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
    const res = await fetch(`${API_URL}/services/${editingService._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editServiceForm)
    });
    
    if (res.ok) {
      showModalMessage('Success', 'Service updated!');
      setEditingService(null);
      loadServices();
    } else {
      showModalMessage('Error', 'Failed to update service');
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
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
              {loginError && <div className="form-error">{loginError}</div>}
              <button type="submit" className="btn-primary">Login</button>
            </form>
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
              <form key={`portfolio-${formKey}`} onSubmit={handleAddPortfolio}>
                <input type="text" name="title" placeholder="Project Title" value={formData.title} onChange={handleInputChange} required className="form-input" />
                <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                  <option>Wedding</option><option>Portrait</option><option>Landscape</option><option>Street</option>
                  <option>Wildlife</option><option>Architecture</option><option>Event</option><option>Commercial</option>
                </select>
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="3" className="form-textarea"></textarea>
                <div className="image-upload-area">
                  <h3>Add Images</h3>
                  <label className="upload-label">Upload from Device
                    <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} style={{ display: 'none' }} />
                  </label>
                  <div className="url-input-group">
                    <input type="text" placeholder="Or enter image URL" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="form-input" />
                    <button type="button" onClick={addImageFromUrl} className="btn-secondary">Add URL</button>
                  </div>
                  {uploading && (
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                        <span className="progress-text">{uploadProgress}%</span>
                      </div>
                    </div>
                  )}
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
              <h2>Your Portfolio Projects ({portfolios.length})</h2>
              <div className="portfolio-admin-grid">
                {portfolios.map(item => (
                  <div key={item._id} className="portfolio-admin-card">
                    <img src={item.coverImage || item.images?.[0]} alt={item.title} />
                    <div className="info">
                      <h3>{item.title}</h3>
                      <p>{item.category}</p>
                      <p className="photos-count">{item.images?.length || 0} photos</p>
                      <button onClick={() => openImageManager(item)} className="edit-btn">Manage Images</button>
                      <button onClick={() => handleDeletePortfolio(item._id)} className="delete-btn">Delete</button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Add Partner</h2>
                {partners.length > 0 && (
                  <button onClick={handleDeleteAllPartners} className="delete-all-btn">Delete All</button>
                )}
              </div>
              <form onSubmit={handleAddPartner}>
                <input type="text" placeholder="Partner Name" value={partnerFormData.name} onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })} required className="form-input" />
                <div className="image-upload-area">
                  <label className="upload-label">Upload Logo
                    <input type="file" accept="image/*" onChange={handlePartnerImageUpload} style={{ display: 'none' }} />
                  </label>
                  {uploading && <div className="progress-bar" style={{ width: `${uploadProgress}%`, padding: '5px' }}>{uploadProgress}%</div>}
                  {partnerImagePreview && (
                    <div className="image-preview">
                      <img src={partnerImagePreview} alt="Preview" />
                      <button type="button" onClick={() => { setPartnerImagePreview(''); setPartnerFormData({ ...partnerFormData, logo: '' }); }}>Remove</button>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-primary">Add Partner</button>
              </form>
            </div>
            <div className="admin-list">
              <h2>Partners ({partners.length})</h2>
              <div className="partners-admin-grid">
                {partners.map(partner => (
                  <div key={partner._id} className="partner-admin-card">
                    <img src={partner.logo} alt={partner.name} />
                    <h3>{partner.name}</h3>
                    <button onClick={() => handleDeletePartner(partner._id)} className="delete-btn">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'clients' && (
          <>
            <div className="admin-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Add Client</h2>
                {clients.length > 0 && (
                  <button onClick={handleDeleteAllClients} className="delete-all-btn">Delete All</button>
                )}
              </div>
              <form onSubmit={handleAddClient}>
                <input type="text" placeholder="Client Name" value={clientFormData.name} onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })} required className="form-input" />
                <div className="image-upload-area">
                  <label className="upload-label">Upload Logo
                    <input type="file" accept="image/*" onChange={handleClientImageUpload} style={{ display: 'none' }} />
                  </label>
                  {uploading && <div className="progress-bar" style={{ width: `${uploadProgress}%`, padding: '5px' }}>{uploadProgress}%</div>}
                  {clientImagePreview && (
                    <div className="image-preview">
                      <img src={clientImagePreview} alt="Preview" />
                      <button type="button" onClick={() => { setClientImagePreview(''); setClientFormData({ ...clientFormData, logo: '' }); }}>Remove</button>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-primary">Add Client</button>
              </form>
            </div>
            <div className="admin-list">
              <h2>Clients ({clients.length})</h2>
              <div className="partners-admin-grid">
                {clients.map(client => (
                  <div key={client._id} className="partner-admin-card">
                    <img src={client.logo} alt={client.name} />
                    <h3>{client.name}</h3>
                    <button onClick={() => handleDeleteClient(client._id)} className="delete-btn">Delete</button>
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
                <input type="text" placeholder="Service Title" value={editingService ? editServiceForm.title : serviceFormData.title} onChange={(e) => editingService ? setEditServiceForm({ ...editServiceForm, title: e.target.value }) : setServiceFormData({ ...serviceFormData, title: e.target.value })} required className="form-input" />
                <textarea placeholder="Service Description" value={editingService ? editServiceForm.description : serviceFormData.description} onChange={(e) => editingService ? setEditServiceForm({ ...editServiceForm, description: e.target.value }) : setServiceFormData({ ...serviceFormData, description: e.target.value })} rows="3" required className="form-textarea" />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary">{editingService ? 'Update' : 'Add'}</button>
                  {editingService && <button type="button" onClick={handleCancelEdit} className="btn-secondary">Cancel</button>}
                </div>
              </form>
            </div>
            <div className="admin-list">
              <h2>Services ({services.length})</h2>
              <div className="services-admin-grid">
                {services.map(service => (
                  <div key={service._id} className="service-admin-card">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => handleEditService(service)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteService(service._id)} className="delete-btn">Delete</button>
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
                <div key={inquiry._id} className="inquiry-card">
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
      
      {/* Modals */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalTitle}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{modalMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={() => setShowModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
      
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={() => setShowConfirmModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-icon">⚠️</div>
              <p>{confirmMessage}</p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="modal-btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="modal-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
      
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
                <label className="upload-label">Upload from Device
                  <input type="file" accept="image/*" multiple onChange={handleAddImagesToPortfolio} style={{ display: 'none' }} />
                </label>
                <div className="url-input-group">
                  <input type="text" placeholder="Or enter image URL" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="form-input" />
                  <button type="button" onClick={addImageUrlToManager} className="btn-secondary">Add URL</button>
                </div>
                {newImagePreviews.length > 0 && (
                  <div>
                    <h4>New images to add:</h4>
                    <div className="new-images-grid">
                      {newImagePreviews.map((preview, idx) => (
                        <div key={idx} className="new-image-item">
                          <img src={preview} alt="New" />
                        </div>
                      ))}
                    </div>
                    <button onClick={saveNewImagesToPortfolio} className="btn-primary">Save Images</button>
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

  const loadPortfolios = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio`);
      const data = await res.json();
      setPortfolios(data);
    } catch (err) {
      setPortfolios([]);
    }
  };

  useEffect(() => {
    loadPortfolios();
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const refreshPortfolios = () => loadPortfolios();

  return (
    <Router>
      <div className="app">
        {showScrollTop && <button onClick={scrollToTop} className="floating-scroll">↑</button>}
        
        <div className="admin-icon-wrapper">
          <Link to="/admin" className="admin-icon-link">
            <FaUserLock className="admin-icon" />
          </Link>
        </div>
        
        <Routes>
          <Route path="/" element={<HomePage scrollToSection={scrollToSection} portfolios={portfolios} refreshPortfolios={refreshPortfolios} />} />
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        
        <footer className="footer">
          <div className="container">
            <div className="footer-logo">
              <span className="footer-logo-text">SPECTRA FRAMES</span>
            </div>
            <div className="footer-social">
              <a href="https://facebook.com/spectraframes" target="_blank" rel="noopener noreferrer" className="social-link facebook"><FaFacebookF /></a>
              <a href="https://instagram.com/spectraframes" target="_blank" rel="noopener noreferrer" className="social-link instagram"><FaInstagram /></a>
              <a href="https://tiktok.com/@spectraframes" target="_blank" rel="noopener noreferrer" className="social-link tiktok"><FaTiktok /></a>
              <a href="https://wa.me/96171234567" target="_blank" rel="noopener noreferrer" className="social-link whatsapp"><FaWhatsapp /></a>
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