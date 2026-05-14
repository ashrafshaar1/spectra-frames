import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';

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
function HomePage({ scrollToSection, portfolios, refreshPortfolios }) {
  useEffect(() => {
    refreshPortfolios();
  }, []);

  const [clientLogos] = useState([
    { id: 1, name: 'Luxury Hotel', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel' },
    { id: 2, name: 'Fashion Brand', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand' },
    { id: 3, name: 'Wedding Planner', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner' },
    { id: 4, name: 'Real Estate', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Real+Estate' },
    { id: 5, name: 'Magazine', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Magazine' },
  ]);

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
          <div className="clients-slider">
            <div className="clients-track">
              {clientLogos.map((client) => (
                <div key={client.id} className="client-card">
                  <img src={client.logo} alt={client.name} className="client-logo-img"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="client-logo-fallback">{client.name.substring(0, 2)}</div>
                  <p className="client-name">{client.name}</p>
                </div>
              ))}
              {clientLogos.map((client) => (
                <div key={`dup-${client.id}`} className="client-card">
                  <img src={client.logo} alt={client.name} className="client-logo-img"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="client-logo-fallback">{client.name.substring(0, 2)}</div>
                  <p className="client-name">{client.name}</p>
                </div>
              ))}
            </div>
          </div>
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
            {[
              { title: 'Wedding Photography', desc: 'Capturing your special day with elegance and emotion' },
              { title: 'Portrait Sessions', desc: 'Professional portraits and personal branding' },
              { title: 'Commercial', desc: 'High-end product and corporate photography' },
              { title: 'Fine Art', desc: 'Artistic and conceptual visual stories' },
              { title: 'Event Coverage', desc: 'Corporate events and special occasions' },
              { title: 'Content Creation', desc: 'Social media and marketing content' }
            ].map((service, index) => (
              <div key={index} className="service-card">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
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
            <form className="contact-form" action="mailto:spectraframes.00@gmail.com" method="post" encType="text/plain">
              <input type="text" name="name" placeholder="Your Name" required className="form-input" />
              <input type="email" name="email" placeholder="Your Email" required className="form-input" />
              <select name="service" className="form-select">
                <option>Wedding Photography</option>
                <option>Portrait Session</option>
                <option>Commercial Project</option>
                <option>Event Coverage</option>
                <option>Fine Art Commission</option>
              </select>
              <textarea name="message" rows="4" placeholder="Tell us about your vision..." required className="form-textarea"></textarea>
              <button type="submit" className="btn-submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

// Portfolio Detail Page with Gallery
function PortfolioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const portfolios = JSON.parse(localStorage.getItem('spectra_portfolios') || '[]');
    const found = portfolios.find(p => p.id === id);
    setItem(found);
    setLoading(false);
  }, [id]);

  const openGallery = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (item?.images?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (item?.images?.length || 1)) % (item?.images?.length || 1));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!item) return <div className="loading">Project not found</div>;

  const images = item.images || [item.coverImage];

  return (
    <div className="portfolio-detail">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        
        <div className="detail-header">
          <h1>{item.title}</h1>
          <span className="detail-category">{item.category}</span>
          <p className="detail-description">{item.description}</p>
          <p className="detail-photos-count">{images.length} photos in this gallery</p>
        </div>

        <div className="gallery-grid">
          {images.map((img, idx) => (
            <div key={idx} className="gallery-item" onClick={() => openGallery(idx)}>
              <img src={img} alt={`${item.title} ${idx + 1}`} />
              {idx === 0 && images.length > 1 && <div className="gallery-overlay"><span>+{images.length - 1} more</span></div>}
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

// Admin Panel Component with full image management for each portfolio
function AdminPanel() {
  const [portfolios, setPortfolios] = useState([]);
  const [partners, setPartners] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [showImageManager, setShowImageManager] = useState(false);
  
  // Portfolio form for new project
  const [formData, setFormData] = useState({
    title: '',
    category: 'Wedding',
    description: '',
    images: []
  });
  const [tempImages, setTempImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // For editing existing portfolio images
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [newImagesForPortfolio, setNewImagesForPortfolio] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // Partner form
  const [partnerFormData, setPartnerFormData] = useState({ name: '', logo: '' });
  const [partnerImagePreview, setPartnerImagePreview] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      loadPortfolios();
      loadPartners();
    }
  }, []);

  const loadPortfolios = () => {
    const saved = JSON.parse(localStorage.getItem('spectra_portfolios') || '[]');
    setPortfolios(saved);
  };

  const loadPartners = () => {
    const saved = JSON.parse(localStorage.getItem('spectra_partners') || '[]');
    if (saved.length === 0) {
      const defaultPartners = [
        { id: '1', name: 'Luxury Hotel', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Luxury+Hotel' },
        { id: '2', name: 'Fashion Brand', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Fashion+Brand' },
        { id: '3', name: 'Wedding Planner', logo: 'https://placehold.co/150x80/D4AF37/1A1A1A?text=Wedding+Planner' },
      ];
      localStorage.setItem('spectra_partners', JSON.stringify(defaultPartners));
      setPartners(defaultPartners);
    } else {
      setPartners(saved);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'ItShYpEr75@') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      loadPortfolios();
      loadPartners();
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

  const removeTempImage = (index) => {
    const newTemp = [...tempImages];
    const newPreviews = [...imagePreviews];
    newTemp.splice(index, 1);
    newPreviews.splice(index, 1);
    setTempImages(newTemp);
    setImagePreviews(newPreviews);
  };

  const handleAddPortfolio = (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please enter a title!');
      return;
    }

    if (tempImages.length === 0) {
      alert('Please upload at least one image!');
      return;
    }

    const newPortfolio = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      coverImage: tempImages[0],
      images: [...tempImages],
      createdAt: new Date().toISOString()
    };

    const updated = [...portfolios, newPortfolio];
    setPortfolios(updated);
    localStorage.setItem('spectra_portfolios', JSON.stringify(updated));
    
    setFormData({ title: '', category: 'Wedding', description: '', images: [] });
    setTempImages([]);
    setImagePreviews([]);
    alert('Portfolio added successfully!');
  };

  const handleDeletePortfolio = (id) => {
    if (window.confirm('Delete this portfolio and all its images?')) {
      const updated = portfolios.filter(p => p.id !== id);
      setPortfolios(updated);
      localStorage.setItem('spectra_portfolios', JSON.stringify(updated));
      alert('Portfolio deleted!');
    }
  };

  const openImageManager = (portfolio) => {
    setCurrentPortfolio(portfolio);
    setNewImagesForPortfolio([]);
    setNewImagePreviews([]);
    setShowImageManager(true);
  };

  const handleAddImagesToPortfolio = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    files.forEach(file => {
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

  const saveNewImagesToPortfolio = () => {
    if (newImagesForPortfolio.length === 0) {
      alert('Please select images to add!');
      return;
    }

    const updatedPortfolios = portfolios.map(p => {
      if (p.id === currentPortfolio.id) {
        return {
          ...p,
          images: [...p.images, ...newImagesForPortfolio],
          coverImage: p.coverImage || p.images[0] || newImagesForPortfolio[0]
        };
      }
      return p;
    });

    setPortfolios(updatedPortfolios);
    localStorage.setItem('spectra_portfolios', JSON.stringify(updatedPortfolios));
    setNewImagesForPortfolio([]);
    setNewImagePreviews([]);
    alert(`${newImagesForPortfolio.length} images added successfully!`);
    loadPortfolios();
  };

  const deleteImageFromPortfolio = (imageIndex) => {
    if (window.confirm('Delete this image from the gallery?')) {
      const updatedImages = [...currentPortfolio.images];
      updatedImages.splice(imageIndex, 1);
      
      const updatedPortfolios = portfolios.map(p => {
        if (p.id === currentPortfolio.id) {
          return {
            ...p,
            images: updatedImages,
            coverImage: updatedImages[0] || ''
          };
        }
        return p;
      });

      setPortfolios(updatedPortfolios);
      localStorage.setItem('spectra_portfolios', JSON.stringify(updatedPortfolios));
      setCurrentPortfolio({ ...currentPortfolio, images: updatedImages });
      alert('Image deleted!');
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerImagePreview(reader.result);
        setPartnerFormData({ ...partnerFormData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!partnerFormData.name || !partnerFormData.logo) {
      alert('Please fill name and upload logo!');
      return;
    }
    const newPartner = { id: Date.now().toString(), name: partnerFormData.name, logo: partnerFormData.logo };
    const updated = [...partners, newPartner];
    setPartners(updated);
    localStorage.setItem('spectra_partners', JSON.stringify(updated));
    setPartnerFormData({ name: '', logo: '' });
    setPartnerImagePreview('');
    alert('Partner added!');
  };

  const handleDeletePartner = (id) => {
    if (window.confirm('Delete this partner?')) {
      const updated = partners.filter(p => p.id !== id);
      setPartners(updated);
      localStorage.setItem('spectra_partners', JSON.stringify(updated));
      alert('Partner deleted!');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <div className="container">
          <div className="login-box">
            <button className="back-to-home" onClick={() => navigate('/')}>← Back to Home</button>
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
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
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>📷 Portfolio ({portfolios.length})</button>
          <button className={`tab-btn ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>🤝 Partners ({partners.length})</button>
        </div>
        
        {activeTab === 'portfolio' ? (
          <>
            <div className="admin-form">
              <h2>Add New Portfolio Project</h2>
              <form onSubmit={handleAddPortfolio}>
                <input type="text" name="title" placeholder="Project Title" value={formData.title} onChange={handleInputChange} required className="form-input" />
                <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                  <option>Wedding</option><option>Portrait</option><option>Landscape</option><option>Street</option>
                  <option>Wildlife</option><option>Architecture</option><option>Event</option><option>Commercial</option>
                </select>
                <textarea name="description" placeholder="Project Description" value={formData.description} onChange={handleInputChange} rows="3" className="form-textarea"></textarea>
                
                <div className="image-upload-area">
                  <label className="upload-label">📸 Upload Multiple Images (Select several at once)
                    <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} style={{ display: 'none' }} />
                  </label>
                  {imagePreviews.length > 0 && (
                    <div className="image-previews-grid">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="image-preview-item">
                          <img src={preview} alt={`Preview ${idx}`} />
                          <button type="button" onClick={() => removeTempImage(idx)}>✖</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button type="submit" className="btn-primary">➕ Create Portfolio</button>
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
                      <p className="photos-count">📷 {item.images?.length || 0} photos</p>
                      <button onClick={() => openImageManager(item)} className="edit-btn">🖼️ Manage Images</button>
                      <button onClick={() => handleDeletePortfolio(item.id)} className="delete-btn">🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="admin-form">
              <h2>Add Partner</h2>
              <form onSubmit={handleAddPartner}>
                <input type="text" name="name" placeholder="Partner Name" value={partnerFormData.name} onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })} required className="form-input" />
                <div className="image-upload-area">
                  <label className="upload-label">Upload Logo<input type="file" accept="image/*" onChange={handlePartnerImageUpload} style={{ display: 'none' }} /></label>
                  {partnerImagePreview && <div className="image-preview"><img src={partnerImagePreview} alt="Preview" /><button type="button" onClick={() => { setPartnerImagePreview(''); setPartnerFormData({ ...partnerFormData, logo: '' }); }}>Remove</button></div>}
                </div>
                <button type="submit" className="btn-primary">Add Partner</button>
              </form>
            </div>
            <div className="admin-list">
              <h2>Partners</h2>
              <div className="partners-admin-grid">
                {partners.map(partner => (
                  <div key={partner.id} className="partner-admin-card">
                    <img src={partner.logo} alt={partner.name} />
                    <div className="info"><h3>{partner.name}</h3><button onClick={() => handleDeletePartner(partner.id)} className="delete-btn">Delete</button></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Image Manager Modal */}
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
                <label className="upload-label">➕ Select Images to Add
                  <input type="file" accept="image/*" multiple onChange={handleAddImagesToPortfolio} style={{ display: 'none' }} />
                </label>
                {newImagePreviews.length > 0 && (
                  <div className="new-images-preview">
                    <h4>New images to add:</h4>
                    <div className="new-images-grid">
                      {newImagePreviews.map((preview, idx) => (
                        <div key={idx} className="new-image-item">
                          <img src={preview} alt={`New ${idx}`} />
                        </div>
                      ))}
                    </div>
                    <button onClick={saveNewImagesToPortfolio} className="btn-primary">💾 Save {newImagePreviews.length} Images</button>
                  </div>
                )}
              </div>

              <div className="existing-images-section">
                <h3>Existing Images ({currentPortfolio.images?.length || 0})</h3>
                <div className="existing-images-grid">
                  {currentPortfolio.images?.map((img, idx) => (
                    <div key={idx} className="existing-image-item">
                      <img src={img} alt={`Image ${idx + 1}`} />
                      <button onClick={() => deleteImageFromPortfolio(idx)} className="delete-image-btn">✖ Delete</button>
                    </div>
                  ))}
                </div>
                {(!currentPortfolio.images || currentPortfolio.images.length === 0) && (
                  <p className="no-images">No images yet. Add some above!</p>
                )}
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

  const loadPortfolios = () => {
    const saved = JSON.parse(localStorage.getItem('spectra_portfolios') || '[]');
    if (saved.length === 0) {
      const defaultPortfolios = [
        { id: '1', title: 'Wedding Elegance', category: 'Wedding', description: 'Beautiful wedding moments captured with elegance', coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600'] },
        { id: '2', title: 'Urban Stories', category: 'Street', description: 'Street photography from around the world', coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600'] },
        { id: '3', title: 'Natural Beauty', category: 'Landscape', description: 'Breathtaking landscapes and nature scenes', coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'] }
      ];
      localStorage.setItem('spectra_portfolios', JSON.stringify(defaultPortfolios));
      setPortfolios(defaultPortfolios);
    } else {
      setPortfolios(saved);
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
  const refreshPortfolios = () => setPortfolios(JSON.parse(localStorage.getItem('spectra_portfolios') || '[]'));

  return (
    <Router>
      <div className="app">
        {showScrollTop && <button onClick={scrollToTop} className="floating-scroll">↑</button>}
        <div className="admin-link"><Link to="/admin">Admin</Link></div>
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
              {/* Facebook */}
              <a href="https://facebook.com/spectraframes" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com/spectraframes" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.5 2 4 2.5 4 6.5v11C4 21.5 8.5 22 12 22s8-.5 8-4.5v-11C20 2.5 15.5 2 12 2zm0 4c3 0 6 .5 6 2.5v1c0 2-3 2.5-6 2.5s-6-.5-6-2.5v-1c0-2 3-2.5 6-2.5zm-6 7.5c0-1.5 2.5-2 6-2s6 .5 6 2V16c0 1.5-2.5 2-6 2s-6-.5-6-2v-2.5zM6 7.5c0-1 2-1.5 6-1.5s6 .5 6 1.5S16 9 12 9 6 8.5 6 7.5z"/>
                  <circle cx="12" cy="15" r="2"/>
                  <path d="M6 18.5v-2.2c.9.5 2.4.7 6 .7s5.1-.2 6-.7v2.2c0 1-2 1.5-6 1.5s-6-.5-6-1.5z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com/@spectraframes" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.64a6.34 6.34 0 0 0 10.86 4.7 6.33 6.33 0 0 0 1.93-4.7v-7c1.07.75 2.37 1.2 3.8 1.2V8.8a4.85 4.85 0 0 1-2-2.11z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/96171234567?text=Hello%20Spectra%20Frames,%20I%20want%20to%20book%20a%20photography%20session" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.23c-1.5 0-2.96-.4-4.24-1.16l-.3-.18-3.12.82.83-3.04-.2-.31c-.81-1.3-1.24-2.79-1.24-4.33 0-4.45 3.62-8.07 8.07-8.07s8.07 3.62 8.07 8.07-3.62 8.07-8.07 8.07zm4.43-6.05c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.64-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.38-.41-.52-.42-.14-.01-.29-.01-.44-.01-.14 0-.36.05-.56.24-.2.19-.76.74-.76 1.81 0 1.07.78 2.1.89 2.25.11.15 1.54 2.35 3.73 3.3.52.22.93.35 1.25.45.52.16.99.14 1.37.09.42-.05 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.09-.19-.15-.43-.27z"/>
                </svg>
              </a>
            </div>
            <div className="footer-contact-info">
              <p className="footer-contact">
                📍 Beirut, Lebanon | 📞 +961 71 123 456 | 
                <a href="mailto:spectraframes.00@gmail.com" className="footer-email-link"> spectraframes.00@gmail.com</a>
              </p>
            </div>
            <p className="footer-copyright">2024 Spectra Frames Photography Agency. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;