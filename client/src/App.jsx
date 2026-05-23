import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaUserLock, FaPlay, FaPause, FaGlobe, FaSun, FaMoon, FaRobot } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import ChatBot from './components/ChatBot';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_qhrwy34';
const EMAILJS_TEMPLATE_ID = 'template_0yx6nqj';
const EMAILJS_PUBLIC_KEY = 'rbiW7auqOWJEo7b20';

// API URL - Production
const API_URL = 'https://spectra-frames-api.onrender.com/api';

// Admin credentials
const ADMIN_USERNAME = 'ashrafshaar';
const ADMIN_PASSWORD = 'ItShYpEr75@';

// Translations
const translations = {
  en: {
    hero: { bookNow: 'Book Now', viewWork: 'View Work' },
    clients: { title: 'Our Clients', subtitle: 'Trusted by leading brands worldwide' },
    partners: { title: 'Our Partners', subtitle: 'Collaborating with industry leaders' },
    portfolio: { title: 'Our Portfolio', subtitle: 'Click on any project to view gallery' },
    services: { title: 'Our Services', subtitle: 'Professional photography tailored to your needs' },
    contact: { title: "Let's Create Together", subtitle: 'Ready to capture your next moment? Reach out to us', name: 'Your Name', email: 'Your Email', phone: 'Phone Number', message: 'Tell us about your vision...', send: 'Send Message', success: 'Message sent successfully! We\'ll contact you soon.', error: 'Something went wrong. Please try again later.', sending: 'Sending...' },
    pricing: { title: 'Packages', subtitle: 'Choose the perfect package for your needs', viewPackages: 'View Packages', backToHome: 'Back to Home', comingSoon: 'Coming Soon', emptyMessage: 'Packages are being prepared. Please check back later or contact us for custom quotes.', socialTitle: 'Social Media Packages', socialDesc: 'Perfect for influencers, brands, and content creators', photoTitle: 'Photography Sessions', photoDesc: 'Professional photography for your special moments', mostPopular: 'Most Popular', bookNow: 'Book Now', perMonth: 'month', perSession: 'session' },
    video: { title: 'Featured Film', subtitle: 'Watch our latest showcase' },
    footer: { designed: 'Designed & Published by', allRights: 'All rights reserved' },
    admin: { loginTitle: 'Admin Login', username: 'Username', password: 'Password', login: 'Login', panelTitle: 'Admin Panel - Spectra Frames', refresh: 'Refresh', logout: 'Logout', portfolio: 'Portfolio', partners: 'Partners', clients: 'Clients', services: 'Services', packages: 'Packages', inquiries: 'Inquiries', addPortfolio: 'Add New Portfolio', title: 'Title', category: 'Category', description: 'Description', images: 'Images', uploadImages: 'Upload Images', addUrl: 'Add URL', create: 'Create', manageImages: 'Manage Images', delete: 'Delete', edit: 'Edit', deleteAll: 'Delete All', addPartner: 'Add Partner', addClient: 'Add Client', name: 'Name', logo: 'Logo', addService: 'Add Service', editService: 'Edit Service', managePackages: 'Manage Packages', addPackage: 'Add New Package', editPackage: 'Edit Package', packageName: 'Package Name', price: 'Price', features: 'Features', popular: 'Mark as "Most Popular"', duration: 'Duration', perMonth: 'Per Month', perSession: 'Per Session', monthly: 'Monthly', perSessionLabel: 'Per Session', comingSoonLabel: 'Coming Soon', cancel: 'Cancel', add: 'Add', popularBadge: 'Popular', addImages: 'Add Images', upload: 'Upload', saveImages: 'Save Images', existingImages: 'Existing Images' }
  },
  ar: {
    hero: { bookNow: 'احجز الآن', viewWork: 'شاهد الأعمال' },
    clients: { title: 'عملاؤنا', subtitle: 'موثوق من قبل كبرى العلامات التجارية' },
    partners: { title: 'شركاؤنا', subtitle: 'نتعاون مع قادة الصناعة' },
    portfolio: { title: 'أعمالنا', subtitle: 'انقر على أي مشروع لمشاهدة المعرض' },
    services: { title: 'خدماتنا', subtitle: 'تصوير احترافي مصمم حسب احتياجاتك' },
    contact: { title: 'لنبدع معاً', subtitle: 'هل أنت مستعد لتوثيق لحظتك القادمة؟ تواصل معنا', name: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'رقم الهاتف', message: 'أخبرنا عن رؤيتك...', send: 'إرسال', success: 'تم إرسال الرسالة بنجاح! سنتواصل معك قريباً', error: 'حدث خطأ. يرجى المحاولة لاحقاً', sending: 'جاري الإرسال...' },
    pricing: { title: 'الباقات', subtitle: 'اختر الباقة المناسبة لاحتياجاتك', viewPackages: 'عرض الباقات', backToHome: 'العودة للرئيسية', comingSoon: 'قريباً', emptyMessage: 'يتم تجهيز الباقات. يرجى العودة لاحقاً أو التواصل معنا للحصول على عروض مخصصة.', socialTitle: 'باقات التواصل الاجتماعي', socialDesc: 'مثالية للمؤثرين والعلامات التجارية ومنشئي المحتوى', photoTitle: 'جلسات التصوير', photoDesc: 'تصوير احترافي للحظاتك المميزة', mostPopular: 'الأكثر طلباً', bookNow: 'احجز الآن', perMonth: 'شهر', perSession: 'جلسة' },
    video: { title: 'فيديو تعريفي', subtitle: 'شاهد أحدث أعمالنا' },
    footer: { designed: 'تصميم ونشر بواسطة', allRights: 'جميع الحقوق محفوظة' },
    admin: { loginTitle: 'دخول المشرف', username: 'اسم المستخدم', password: 'كلمة المرور', login: 'دخول', panelTitle: 'لوحة التحكم - سبيكترا فرامز', refresh: 'تحديث', logout: 'تسجيل خروج', portfolio: 'الأعمال', partners: 'الشركاء', clients: 'العملاء', services: 'الخدمات', packages: 'الباقات', inquiries: 'الاستفسارات', addPortfolio: 'إضافة عمل جديد', title: 'العنوان', category: 'التصنيف', description: 'الوصف', images: 'الصور', uploadImages: 'رفع الصور', addUrl: 'إضافة رابط', create: 'إنشاء', manageImages: 'إدارة الصور', delete: 'حذف', edit: 'تعديل', deleteAll: 'حذف الكل', addPartner: 'إضافة شريك', addClient: 'إضافة عميل', name: 'الاسم', logo: 'الشعار', addService: 'إضافة خدمة', editService: 'تعديل خدمة', managePackages: 'إدارة الباقات', addPackage: 'إضافة باقة جديدة', editPackage: 'تعديل باقة', packageName: 'اسم الباقة', price: 'السعر', features: 'الميزات', popular: 'تحديد كـ "الأكثر طلباً"', duration: 'المدة', perMonth: 'شهري', perSession: 'لكل جلسة', monthly: 'شهري', perSessionLabel: 'لكل جلسة', comingSoonLabel: 'قريباً', cancel: 'إلغاء', add: 'إضافة', popularBadge: 'الأكثر طلباً', addImages: 'إضافة صور', upload: 'رفع', saveImages: 'حفظ الصور', existingImages: 'الصور الموجودة' }
  },
  fr: {
    hero: { bookNow: 'Réserver', viewWork: 'Voir le travail' },
    clients: { title: 'Nos Clients', subtitle: 'Approuvé par les plus grandes marques' },
    partners: { title: 'Nos Partenaires', subtitle: 'Collaboration avec des leaders du secteur' },
    portfolio: { title: 'Notre Portfolio', subtitle: 'Cliquez sur un projet pour voir la galerie' },
    services: { title: 'Nos Services', subtitle: 'Photographie professionnelle adaptée à vos besoins' },
    contact: { title: 'Créez avec Nous', subtitle: 'Prêt à capturer votre prochain moment? Contactez-nous', name: 'Votre Nom', email: 'Votre Email', phone: 'Numéro de Téléphone', message: 'Parlez-nous de votre vision...', send: 'Envoyer', success: 'Message envoyé avec succès! Nous vous contacterons bientôt.', error: 'Une erreur est survenue. Veuillez réessayer plus tard.', sending: 'Envoi en cours...' },
    pricing: { title: 'Forfaits', subtitle: 'Choisissez le forfait parfait pour vos besoins', viewPackages: 'Voir les forfaits', backToHome: 'Retour à l\'accueil', comingSoon: 'Bientôt disponible', emptyMessage: 'Les forfaits sont en préparation. Veuillez revenir plus tard ou nous contacter pour des devis personnalisés.', socialTitle: 'Forfaits Médias Sociaux', socialDesc: 'Parfait pour les influenceurs, marques et créateurs de contenu', photoTitle: 'Séances Photo', photoDesc: 'Photographie professionnelle pour vos moments spéciaux', mostPopular: 'Le Plus Populaire', bookNow: 'Réserver', perMonth: 'mois', perSession: 'séance' },
    video: { title: 'Vidéo Présentation', subtitle: 'Regardez notre dernière réalisation' },
    footer: { designed: 'Conçu et publié par', allRights: 'Tous droits réservés' },
    admin: { loginTitle: 'Connexion Admin', username: 'Nom d\'utilisateur', password: 'Mot de passe', login: 'Se connecter', panelTitle: 'Panneau d\'administration - Spectra Frames', refresh: 'Actualiser', logout: 'Déconnexion', portfolio: 'Portfolio', partners: 'Partenaires', clients: 'Clients', services: 'Services', packages: 'Forfaits', inquiries: 'Demandes', addPortfolio: 'Ajouter un portfolio', title: 'Titre', category: 'Catégorie', description: 'Description', images: 'Images', uploadImages: 'Télécharger des images', addUrl: 'Ajouter une URL', create: 'Créer', manageImages: 'Gérer les images', delete: 'Supprimer', edit: 'Modifier', deleteAll: 'Tout supprimer', addPartner: 'Ajouter un partenaire', addClient: 'Ajouter un client', name: 'Nom', logo: 'Logo', addService: 'Ajouter un service', editService: 'Modifier le service', managePackages: 'Gérer les forfaits', addPackage: 'Ajouter un forfait', editPackage: 'Modifier le forfait', packageName: 'Nom du forfait', price: 'Prix', features: 'Caractéristiques', popular: 'Marquer comme "Populaire"', duration: 'Durée', perMonth: 'Par mois', perSession: 'Par séance', monthly: 'Mensuel', perSessionLabel: 'Par séance', comingSoonLabel: 'Bientôt', cancel: 'Annuler', add: 'Ajouter', popularBadge: 'Populaire', addImages: 'Ajouter des images', upload: 'Télécharger', saveImages: 'Enregistrer les images', existingImages: 'Images existantes' }
  }
};

// LogoImage component
function LogoImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!loaded && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#2a2a2a', borderRadius: '8px' }} />}
      <img src={src} alt={alt} className={className} onLoad={() => setLoaded(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: loaded ? 1 : 0, transition: 'opacity 0.2s ease' }} />
    </div>
  );
}

// PortfolioImage component
function PortfolioImage({ src, alt, className }) {
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { setImageSrc(src); observer.unobserve(entry.target); } });
    }, { rootMargin: '200px', threshold: 0.1 });
    if (imgRef.current) observer.observe(imgRef.current);
    return () => { if (imgRef.current) observer.unobserve(imgRef.current); };
  }, [src]);
  return (
    <div ref={imgRef} className={className} style={{ width: '100%', height: '100%' }}>
      {imageSrc ? <img src={imageSrc} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} loading="lazy" /> : <div style={{ background: 'linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)', backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite', width: '100%', height: '100%' }} />}
    </div>
  );
}

// Gallery Modal Component
function GalleryModal({ images, currentIndex, onClose, onNext, onPrev }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => { setImageLoaded(false); }, [currentIndex]);
  useEffect(() => { const handleEsc = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', handleEsc); return () => window.removeEventListener('keydown', handleEsc); }, [onClose]);
  return (
    <div className="gallery-modal" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-close" onClick={onClose}>×</button>
        <button className="gallery-prev" onClick={onPrev}>‹</button>
        {!imageLoaded && <div className="image-skeleton" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)', backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite', borderRadius: '8px' }} />}
        <img src={images[currentIndex]} alt={`Gallery ${currentIndex + 1}`} className="gallery-image" onLoad={() => setImageLoaded(true)} style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }} />
        <button className="gallery-next" onClick={onNext}>›</button>
        <div className="gallery-counter">{currentIndex + 1} / {images.length}</div>
      </div>
    </div>
  );
}

// Loading Screen Component
function LoadingScreen({ onComplete, logoSrc }) {
  useEffect(() => {
    const timer = setTimeout(() => { onComplete(); }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <div className="loading-screen">
      <div className="loader">
        <img src={logoSrc} alt="Spectra Frames" className="loader-logo-img" />
      </div>
    </div>
  );
}

// Packages Page Component
function PackagesPage({ packagesData, t }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const hasSocialPackages = packagesData.social.length > 0;
  const hasPhotoPackages = packagesData.photo.length > 0;

  if (!hasSocialPackages && !hasPhotoPackages) {
    return (
      <div className="packages-page">
        <div className="container">
          <button className="back-btn" onClick={() => navigate('/')}>← {t.pricing.backToHome}</button>
          <div className="packages-header">
            <h1 className="packages-main-title">{t.pricing.title}</h1>
            <p className="packages-subtitle">{t.pricing.comingSoon}</p>
          </div>
          <div className="empty-packages">
            <p>{t.pricing.emptyMessage}</p>
            <button className="btn-primary" onClick={() => navigate('/#contact')}>{t.contact.send}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="packages-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>← {t.pricing.backToHome}</button>
        
        <div className="packages-header">
          <h1 className="packages-main-title">{t.pricing.title}</h1>
          <p className="packages-subtitle">{t.pricing.subtitle}</p>
        </div>

        {hasSocialPackages && (
          <div className="packages-category">
            <h2 className="packages-category-title">{t.pricing.socialTitle}</h2>
            <p className="packages-category-desc">{t.pricing.socialDesc}</p>
            <div className="packages-grid">
              {packagesData.social.map((pkg) => (
                <div key={pkg.id} className={`package-card ${pkg.popular ? 'featured' : ''}`}>
                  {pkg.popular && <div className="featured-badge">{t.pricing.mostPopular}</div>}
                  <h3 className="package-name">{pkg.name}</h3>
                  <div className="package-price">{pkg.price}<span> / {pkg.duration === 'month' ? t.pricing.perMonth : t.pricing.perSession}</span></div>
                  <ul className="package-features">
                    {pkg.features.map((feature, i) => (<li key={i}>✓ {feature}</li>))}
                  </ul>
                  <button className="package-btn" onClick={() => window.location.href = 'mailto:spectraframes.00@gmail.com?subject=Social Media Package Booking'}>{t.pricing.bookNow} →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasPhotoPackages && (
          <div className="packages-category">
            <h2 className="packages-category-title">{t.pricing.photoTitle}</h2>
            <p className="packages-category-desc">{t.pricing.photoDesc}</p>
            <div className="packages-grid">
              {packagesData.photo.map((pkg) => (
                <div key={pkg.id} className={`package-card ${pkg.popular ? 'featured' : ''}`}>
                  {pkg.popular && <div className="featured-badge">{t.pricing.mostPopular}</div>}
                  <h3 className="package-name">{pkg.name}</h3>
                  <div className="package-price">{pkg.price}<span> / {pkg.duration === 'month' ? t.pricing.perMonth : t.pricing.perSession}</span></div>
                  <ul className="package-features">
                    {pkg.features.map((feature, i) => (<li key={i}>✓ {feature}</li>))}
                  </ul>
                  <button className="package-btn" onClick={() => window.location.href = 'mailto:spectraframes.00@gmail.com?subject=Photography Session Booking'}>{t.pricing.bookNow} →</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Home Page Component
function HomePage({ scrollToSection, portfolios, refreshPortfolios, t, packagesData, logoSrc }) {
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
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef(null);

  const loadData = () => {
    fetch(`${API_URL}/clients`).then(res => res.json()).then(data => setClients(data)).catch(err => console.error('Failed to load clients:', err));
    fetch(`${API_URL}/partners`).then(res => res.json()).then(data => setPartners(data)).catch(err => console.error('Failed to load partners:', err));
    fetch(`${API_URL}/services`).then(res => res.json()).then(data => setServices(data)).catch(err => console.error('Failed to load services:', err));
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
      const templateParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        message: formData.message,
        to_email: 'spectraframes.00@gmail.com'
      };
      const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      if (result.status === 200) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', service: 'Wedding Photography', message: '' });
        setTimeout(() => setFormStatus(''), 5000);
      } else {
        setFormStatus('error');
        setTimeout(() => setFormStatus(''), 5000);
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 5000);
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
      setVideoPlaying(!videoPlaying);
    }
  };

  return (
    <>
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content-centered">
            <div className="logo-centered">
              <img src={logoSrc} alt="Spectra Frames Logo" className="logo-centered-img"
                onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
              <div className="logo-centered-fallback">SF</div>
            </div>
            <div className="hero-buttons-centered">
              <button className="btn-primary" onClick={() => scrollToSection('contact')}>{t.hero.bookNow}</button>
              <button className="btn-secondary" onClick={() => scrollToSection('portfolio')}>{t.hero.viewWork}</button>
            </div>
          </div>
        </div>
      </section>

      {clients.length > 0 && (
        <section className="clients-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">{t.clients.title}</h2>
              <p className="section-subtitle">{t.clients.subtitle}</p>
            </div>
            <div className="clients-slider">
              <div className="clients-track">
                {[...clients, ...clients].map((client, idx) => (
                  <div key={`${client.id || client._id}-${idx}`} className="client-card">
                    <div className="client-logo-img">
                      <LogoImage src={client.logo} alt={client.name} className="client-logo-img" />
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
              <h2 className="section-title">{t.partners.title}</h2>
              <p className="section-subtitle">{t.partners.subtitle}</p>
            </div>
            <div className="partners-slider">
              <div className="partners-track">
                {[...partners, ...partners].map((partner, idx) => (
                  <div key={`${partner.id || partner._id}-${idx}`} className="partner-card">
                    <div className="partner-logo-img">
                      <LogoImage src={partner.logo} alt={partner.name} className="partner-logo-img" />
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
            <h2 className="section-title">{t.portfolio.title}</h2>
            <p className="section-subtitle">{t.portfolio.subtitle}</p>
          </div>
          <div className="portfolio-grid">
            {portfolios.map((item) => (
              <Link to={`/portfolio/${item.id || item._id}`} key={item.id || item._id} className="portfolio-card-link">
                <div className="portfolio-card">
                  <div className="portfolio-img">
                    <PortfolioImage 
                      src={item.coverimage || item.coverImage || item.images?.[0]} 
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

      <section className="featured-video">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t.video.title}</h2>
            <p className="section-subtitle">{t.video.subtitle}</p>
          </div>
          <div className="video-wrapper" style={{ position: 'relative' }}>
            <video ref={videoRef} autoPlay loop muted playsInline style={{ width: '100%' }}>
              <source src="https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-using-a-camera-34398-large.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button onClick={toggleVideo} style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(212, 175, 55, 0.8)', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#1A1A1A' }}>{videoPlaying ? <FaPause /> : <FaPlay />}</button>
          </div>
        </div>
      </section>

      <section className="packages-redirect">
        <div className="container">
          <div className="packages-redirect-content">
            <h2 className="section-title">{t.pricing.title}</h2>
            <p className="packages-redirect-text">Choose the perfect package for your photography needs</p>
            <Link to="/packages">
              <button className="btn-primary">{t.pricing.viewPackages} →</button>
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t.services.title}</h2>
            <p className="section-subtitle">{t.services.subtitle}</p>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id || service._id} className="service-card">
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
            <h2 className="section-title">{t.contact.title}</h2>
            <p className="section-subtitle">{t.contact.subtitle}</p>
          </div>
          <div className="contact-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              {formStatus === 'success' && <div className="form-success">{t.contact.success}</div>}
              {formStatus === 'error' && <div className="form-error">{t.contact.error}</div>}
              {formStatus === 'sending' && <div className="form-sending">{t.contact.sending}</div>}
              <input type="text" name="name" placeholder={t.contact.name} value={formData.name} onChange={handleChange} required className="form-input" />
              <input type="email" name="email" placeholder={t.contact.email} value={formData.email} onChange={handleChange} required className="form-input" />
              <input type="tel" name="phone" placeholder={t.contact.phone} value={formData.phone} onChange={handleChange} className="form-input" />
              <select name="service" value={formData.service} onChange={handleChange} className="form-select">
                {services.map((service) => (
                  <option key={service.id || service._id} value={service.title}>{service.title}</option>
                ))}
              </select>
              <textarea name="message" rows="4" placeholder={t.contact.message} value={formData.message} onChange={handleChange} required className="form-textarea"></textarea>
              <button type="submit" className="btn-submit">{t.contact.send}</button>
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

  const images = item.images || (item.coverimage || item.coverImage ? [item.coverimage || item.coverImage] : []);

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
              <img 
                src={img} 
                alt={`${item.title} ${idx + 1}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
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
function AdminPanel({ packagesData, setPackagesData, t, logoSrc }) {
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

  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({ type: 'social', name: '', price: '', features: '', popular: false, duration: 'month' });

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

  const handlePackageSubmit = (e) => {
    e.preventDefault();
    const featuresList = packageForm.features.split(',').map(f => f.trim());
    const newPackage = {
      id: editingPackage ? editingPackage.id : Date.now().toString(),
      name: packageForm.name,
      price: packageForm.price,
      features: featuresList,
      popular: packageForm.popular,
      duration: packageForm.duration
    };
    
    if (editingPackage) {
      setPackagesData(prev => ({
        ...prev,
        [packageForm.type]: prev[packageForm.type].map(pkg => pkg.id === editingPackage.id ? newPackage : pkg)
      }));
      showModalMessage('Success', 'Package updated successfully!');
    } else {
      setPackagesData(prev => ({
        ...prev,
        [packageForm.type]: [...prev[packageForm.type], newPackage]
      }));
      showModalMessage('Success', 'Package added successfully!');
    }
    resetPackageForm();
  };

  const resetPackageForm = () => {
    setEditingPackage(null);
    setPackageForm({ type: 'social', name: '', price: '', features: '', popular: false, duration: 'month' });
  };

  const editPackage = (type, pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      type: type,
      name: pkg.name,
      price: pkg.price,
      features: pkg.features.join(', '),
      popular: pkg.popular,
      duration: pkg.duration || 'month'
    });
  };

  const deletePackage = (type, id) => {
    showConfirmModalMessage('Delete this package?', () => {
      setPackagesData(prev => ({
        ...prev,
        [type]: prev[type].filter(pkg => pkg.id !== id)
      }));
      showModalMessage('Success', 'Package deleted successfully!');
    }, null);
  };

  const uploadToServer = async (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/upload-image`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              onProgress(percentComplete);
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
        xhr.send(JSON.stringify({ image: base64Image }));
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 50 * 1024 * 1024) {
        showModalMessage('Error', `Image ${file.name} too large! Max 50MB`);
        continue;
      }
      
      setUploading(true);
      setUploadProgress(0);
      
      try {
        const url = await uploadToServer(file, (progress) => {
          setUploadProgress(progress);
        });
        
        if (url) {
          newImages.push(url);
          newPreviews.push(url);
        }
      } catch (err) {
        console.error('Error uploading:', file.name, err);
        showModalMessage('Error', `Failed to upload ${file.name}`);
      }
    }
    
    if (newImages.length) {
      setTempImages([...tempImages, ...newImages]);
      setImagePreviews([...imagePreviews, ...newPreviews]);
      showModalMessage('Success', `${newImages.length} image(s) uploaded!`);
    }
    
    setUploading(false);
    setUploadProgress(0);
  };

  const addImageFromUrl = () => {
    if (imageUrlInput && imageUrlInput.trim() !== '') {
      setTempImages([...tempImages, imageUrlInput]);
      setImagePreviews([...imagePreviews, imageUrlInput]);
      setImageUrlInput('');
      showModalMessage('Success', 'Image URL added!');
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

  const handleAddImagesToPortfolio = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 50 * 1024 * 1024) continue;
      
      setUploading(true);
      setUploadProgress(0);
      
      try {
        const url = await uploadToServer(file, (progress) => {
          setUploadProgress(progress);
        });
        if (url) {
          newImages.push(url);
          newPreviews.push(url);
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    if (newImages.length) {
      setNewImagesForPortfolio([...newImagesForPortfolio, ...newImages]);
      setNewImagePreviews([...newImagePreviews, ...newPreviews]);
      showModalMessage('Success', `${newImages.length} image(s) ready to add!`);
    }
    
    setUploading(false);
    setUploadProgress(0);
  };

  const addImageUrlToManager = () => {
    if (imageUrlInput && imageUrlInput.trim() !== '') {
      setNewImagesForPortfolio([...newImagesForPortfolio, imageUrlInput]);
      setNewImagePreviews([...newImagePreviews, imageUrlInput]);
      setImageUrlInput('');
      showModalMessage('Success', 'Image URL added!');
    }
  };

  const handlePartnerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
      showModalMessage('Error', 'Logo too large! Max 50MB');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const url = await uploadToServer(file, (progress) => {
        setUploadProgress(progress);
      });
      if (url) {
        setPartnerImagePreview(url);
        setPartnerFormData({ ...partnerFormData, logo: url });
        showModalMessage('Success', 'Logo uploaded!');
      }
    } catch (err) {
      showModalMessage('Error', 'Upload failed');
    }
    
    setUploading(false);
    setUploadProgress(0);
  };

  const handleClientImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
      showModalMessage('Error', 'Logo too large! Max 50MB');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const url = await uploadToServer(file, (progress) => {
        setUploadProgress(progress);
      });
      if (url) {
        setClientImagePreview(url);
        setClientFormData({ ...clientFormData, logo: url });
        showModalMessage('Success', 'Logo uploaded!');
      }
    } catch (err) {
      showModalMessage('Error', 'Upload failed');
    }
    
    setUploading(false);
    setUploadProgress(0);
  };

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

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showModalMessage('Error', 'Enter a title!');
      return;
    }
    if (tempImages.length === 0) {
      showModalMessage('Error', 'Add at least one image!');
      return;
    }
    
    setUploading(true);
    const uploadedUrls = [];
    for (const img of tempImages) {
      if (img.startsWith('http')) {
        uploadedUrls.push(img);
      } else {
        const url = await uploadToServer(img);
        if (url) uploadedUrls.push(url);
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
      showModalMessage('Success', 'Portfolio added!');
      setFormData({ title: '', category: 'Wedding', description: '', images: [] });
      setTempImages([]);
      setImagePreviews([]);
      loadPortfolios();
      setFormKey(prev => prev + 1);
    } else {
      showModalMessage('Error', 'Failed to save');
    }
    setUploading(false);
  };

  const handleDeletePortfolio = async (id) => {
    if (!id || id === 'undefined') {
      showModalMessage('Error', 'Invalid ID');
      return;
    }
    
    showConfirmModalMessage('Delete this portfolio?', async () => {
      try {
        const res = await fetch(`${API_URL}/portfolio/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showModalMessage('Success', 'Portfolio deleted!');
          loadPortfolios();
        } else {
          showModalMessage('Error', 'Delete failed');
        }
      } catch (error) {
        showModalMessage('Error', 'Network error');
      }
    }, id);
  };

  const handleDeletePartner = async (id) => {
    if (!id || id === 'undefined') {
      showModalMessage('Error', 'Invalid ID');
      return;
    }
    showConfirmModalMessage('Delete this partner?', async () => {
      try {
        const res = await fetch(`${API_URL}/partners/${id}`, { method: 'DELETE' });
        if (res.ok) { 
          loadPartners(); 
          showModalMessage('Success', 'Partner deleted!'); 
        } else {
          showModalMessage('Error', 'Delete failed');
        }
      } catch (error) {
        showModalMessage('Error', 'Network error');
      }
    }, id);
  };

  const handleDeleteClient = async (id) => {
    if (!id || id === 'undefined') {
      showModalMessage('Error', 'Invalid ID');
      return;
    }
    showConfirmModalMessage('Delete this client?', async () => {
      try {
        const res = await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
        if (res.ok) { 
          loadClients(); 
          showModalMessage('Success', 'Client deleted!'); 
        } else {
          showModalMessage('Error', 'Delete failed');
        }
      } catch (error) {
        showModalMessage('Error', 'Network error');
      }
    }, id);
  };

  const handleDeleteService = async (id) => {
    if (!id || id === 'undefined') return;
    showConfirmModalMessage('Delete this service?', async () => {
      const res = await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
      if (res.ok) { loadServices(); showModalMessage('Success', 'Service deleted!'); }
    }, id);
  };

  const handleDeleteAllPartners = async () => {
    if (partners.length === 0) return;
    showConfirmModalMessage('Are you sure you want to DELETE ALL PARTNERS?', async () => {
      for (const partner of partners) {
        await fetch(`${API_URL}/partners/${partner.id || partner._id}`, { method: 'DELETE' });
      }
      loadPartners();
      showModalMessage('Success', 'All partners deleted!');
    }, null);
  };

  const handleDeleteAllClients = async () => {
    if (clients.length === 0) return;
    showConfirmModalMessage('Are you sure you want to DELETE ALL CLIENTS?', async () => {
      for (const client of clients) {
        await fetch(`${API_URL}/clients/${client.id || client._id}`, { method: 'DELETE' });
      }
      loadClients();
      showModalMessage('Success', 'All clients deleted!');
    }, null);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!clientFormData.name || !clientFormData.logo) {
      showModalMessage('Error', 'Please fill name and logo!');
      return;
    }
    
    let logoUrl = clientFormData.logo;
    
    if (logoUrl && logoUrl.startsWith('data:image')) {
      setUploading(true);
      try {
        const blob = await fetch(logoUrl).then(r => r.blob());
        const file = new File([blob], 'logo.png', { type: 'image/png' });
        const uploadedUrl = await uploadToServer(file);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          showModalMessage('Error', 'Failed to upload logo image');
          setUploading(false);
          return;
        }
      } catch (err) {
        console.error('Upload error:', err);
        showModalMessage('Error', 'Failed to upload logo image');
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clientFormData.name, logo: logoUrl })
      });
      
      const data = await res.json();
      if (res.ok) {
        const newClient = { 
          id: data.client?.id || Date.now().toString(), 
          name: clientFormData.name, 
          logo: logoUrl,
          _id: data.client?._id || Date.now().toString()
        };
        setClients(prev => [newClient, ...prev]);
        
        showModalMessage('Success', 'Client added successfully!');
        setClientFormData({ name: '', logo: '' });
        setClientImagePreview('');
      } else {
        showModalMessage('Error', data.error || 'Failed to add client');
      }
    } catch (error) {
      console.error('Add client error:', error);
      showModalMessage('Error', 'Network error. Please try again.');
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerFormData.name || !partnerFormData.logo) {
      showModalMessage('Error', 'Please fill name and logo!');
      return;
    }
    
    let logoUrl = partnerFormData.logo;
    
    if (logoUrl && logoUrl.startsWith('data:image')) {
      setUploading(true);
      try {
        const blob = await fetch(logoUrl).then(r => r.blob());
        const file = new File([blob], 'logo.png', { type: 'image/png' });
        const uploadedUrl = await uploadToServer(file);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          showModalMessage('Error', 'Failed to upload logo image');
          setUploading(false);
          return;
        }
      } catch (err) {
        console.error('Upload error:', err);
        showModalMessage('Error', 'Failed to upload logo image');
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    try {
      const res = await fetch(`${API_URL}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: partnerFormData.name, logo: logoUrl })
      });
      
      const data = await res.json();
      if (res.ok) {
        const newPartner = { 
          id: data.partner?.id || Date.now().toString(), 
          name: partnerFormData.name, 
          logo: logoUrl,
          _id: data.partner?._id || Date.now().toString()
        };
        setPartners(prev => [newPartner, ...prev]);
        
        showModalMessage('Success', 'Partner added successfully!');
        setPartnerFormData({ name: '', logo: '' });
        setPartnerImagePreview('');
      } else {
        showModalMessage('Error', data.error || 'Failed to add partner');
      }
    } catch (error) {
      console.error('Add partner error:', error);
      showModalMessage('Error', 'Network error. Please try again.');
    }
  };

  const openImageManager = (portfolio) => {
    setCurrentPortfolio(portfolio);
    setNewImagesForPortfolio([]);
    setNewImagePreviews([]);
    setImageUrlInput('');
    setShowImageManager(true);
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
      coverImage: currentPortfolio.coverimage || currentPortfolio.coverImage || uploadedUrls[0]
    };
    
    const res = await fetch(`${API_URL}/portfolio/${currentPortfolio.id || currentPortfolio._id}`, {
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
      const res = await fetch(`${API_URL}/portfolio/${currentPortfolio.id || currentPortfolio._id}`, {
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

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceFormData.title || !serviceFormData.description) {
      showModalMessage('Error', 'Fill title and description!');
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
    const res = await fetch(`${API_URL}/services/${editingService.id || editingService._id}`, {
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
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="login-box">
            <img src={logoSrc} alt="Logo" className="login-logo" />
            <h2>{t.admin.loginTitle}</h2>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder={t.admin.username} value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" required />
              <input type="password" placeholder={t.admin.password} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
              {loginError && <div className="form-error">{loginError}</div>}
              <button type="submit" className="btn-primary">{t.admin.login}</button>
            </form>
            <button className="back-to-home" onClick={() => navigate('/')}>← {t.pricing.backToHome}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="admin-header">
          <h1>{t.admin.panelTitle}</h1>
          <div>
            <button onClick={() => navigate('/')} className="btn-secondary">← {t.pricing.backToHome}</button>
            <button onClick={refreshAllData} className="btn-secondary">{t.admin.refresh}</button>
            <button onClick={handleLogout} className="btn-secondary">{t.admin.logout}</button>
          </div>
        </div>
        
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>{t.admin.portfolio} ({portfolios.length})</button>
          <button className={`tab-btn ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>{t.admin.partners} ({partners.length})</button>
          <button className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>{t.admin.clients} ({clients.length})</button>
          <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>{t.admin.services} ({services.length})</button>
          <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>{t.admin.packages}</button>
          <button className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`} onClick={() => setActiveTab('inquiries')}>{t.admin.inquiries} ({inquiries.length})</button>
        </div>
        
        {activeTab === 'portfolio' && (
          <>
            <div className="admin-form">
              <h2>{t.admin.addPortfolio}</h2>
              <form key={formKey} onSubmit={handleAddPortfolio}>
                <input type="text" name="title" placeholder={t.admin.title} value={formData.title} onChange={handleInputChange} required className="form-input" />
                <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                  <option>Wedding</option><option>Portrait</option><option>Landscape</option><option>Street</option>
                  <option>Wildlife</option><option>Architecture</option><option>Event</option><option>Commercial</option>
                </select>
                <textarea name="description" placeholder={t.admin.description} value={formData.description} onChange={handleInputChange} rows="3" className="form-textarea"></textarea>
                
                <div className="image-upload-area">
                  <h3>{t.admin.images}</h3>
                  <label className="upload-label">{t.admin.uploadImages}
                    <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} style={{ display: 'none' }} />
                  </label>
                  <div className="url-input-group">
                    <input type="text" placeholder="Image URL" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="form-input" />
                    <button type="button" onClick={addImageFromUrl} className="btn-secondary">{t.admin.addUrl}</button>
                  </div>
                  {uploading && <div className="progress-bar" style={{ width: `${uploadProgress}%`, padding: '5px' }}>{uploadProgress}%</div>}
                  
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
                <button type="submit" className="btn-primary" disabled={uploading}>{t.admin.create}</button>
              </form>
            </div>
            
            <div className="admin-list">
              <h2>{t.admin.portfolio} ({portfolios.length})</h2>
              <div className="portfolio-admin-grid">
                {portfolios.map(item => (
                  <div key={item.id || item._id} className="portfolio-admin-card">
                    <img src={item.coverimage || item.coverImage} alt={item.title} />
                    <div className="info">
                      <h3>{item.title}</h3>
                      <p>{item.category}</p>
                      <p>{item.images?.length || 0} {t.admin.images}</p>
                      <button onClick={() => openImageManager(item)} className="edit-btn">{t.admin.manageImages}</button>
                      <button onClick={() => handleDeletePortfolio(item.id || item._id)} className="delete-btn">{t.admin.delete}</button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>{t.admin.addPartner}</h2>
                {partners.length > 0 && <button onClick={handleDeleteAllPartners} className="delete-all-btn">{t.admin.deleteAll}</button>}
              </div>
              <form onSubmit={handleAddPartner}>
                <input type="text" placeholder={t.admin.name} value={partnerFormData.name} onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })} required className="form-input" />
                <label className="upload-label">{t.admin.logo}
                  <input type="file" accept="image/*" onChange={handlePartnerImageUpload} style={{ display: 'none' }} />
                </label>
                {uploading && <div className="progress-bar" style={{ width: `${uploadProgress}%`, padding: '5px' }}>{uploadProgress}%</div>}
                {partnerImagePreview && (
                  <div className="image-preview">
                    <img src={partnerImagePreview} alt="Preview" />
                    <button onClick={() => { setPartnerImagePreview(''); setPartnerFormData({ ...partnerFormData, logo: '' }); }}>{t.admin.delete}</button>
                  </div>
                )}
                <button type="submit" className="btn-primary">{t.admin.addPartner}</button>
              </form>
            </div>
            <div className="partner-admin-grid">
              {partners.map(partner => (
                <div key={partner.id || partner._id} className="partner-admin-card">
                  <img src={partner.logo} alt={partner.name} />
                  <h3>{partner.name}</h3>
                  <button onClick={() => handleDeletePartner(partner.id || partner._id)} className="delete-btn">{t.admin.delete}</button>
                </div>
              ))}
            </div>
          </>
        )}
        
        {activeTab === 'clients' && (
          <>
            <div className="admin-form">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>{t.admin.addClient}</h2>
                {clients.length > 0 && <button onClick={handleDeleteAllClients} className="delete-all-btn">{t.admin.deleteAll}</button>}
              </div>
              <form onSubmit={handleAddClient}>
                <input type="text" placeholder={t.admin.name} value={clientFormData.name} onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })} required className="form-input" />
                <label className="upload-label">{t.admin.logo}
                  <input type="file" accept="image/*" onChange={handleClientImageUpload} style={{ display: 'none' }} />
                </label>
                {uploading && <div className="progress-bar" style={{ width: `${uploadProgress}%`, padding: '5px' }}>{uploadProgress}%</div>}
                {clientImagePreview && (
                  <div className="image-preview">
                    <img src={clientImagePreview} alt="Preview" />
                    <button onClick={() => { setClientImagePreview(''); setClientFormData({ ...clientFormData, logo: '' }); }}>{t.admin.delete}</button>
                  </div>
                )}
                <button type="submit" className="btn-primary">{t.admin.addClient}</button>
              </form>
            </div>
            <div className="client-admin-grid">
              {clients.map(client => (
                <div key={client.id || client._id} className="client-admin-card">
                  <img src={client.logo} alt={client.name} />
                  <h3>{client.name}</h3>
                  <button onClick={() => handleDeleteClient(client.id || client._id)} className="delete-btn">{t.admin.delete}</button>
                </div>
              ))}
            </div>
          </>
        )}
        
        {activeTab === 'services' && (
          <>
            <div className="admin-form">
              <h2>{editingService ? t.admin.editService : t.admin.addService}</h2>
              <form onSubmit={editingService ? handleUpdateService : handleAddService}>
                <input type="text" placeholder={t.admin.title} value={editingService ? editServiceForm.title : serviceFormData.title} onChange={(e) => editingService ? setEditServiceForm({ ...editServiceForm, title: e.target.value }) : setServiceFormData({ ...serviceFormData, title: e.target.value })} required className="form-input" />
                <textarea placeholder={t.admin.description} value={editingService ? editServiceForm.description : serviceFormData.description} onChange={(e) => editingService ? setEditServiceForm({ ...editServiceForm, description: e.target.value }) : setServiceFormData({ ...serviceFormData, description: e.target.value })} rows="3" required className="form-textarea" />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary">{editingService ? t.admin.edit : t.admin.add}</button>
                  {editingService && <button onClick={handleCancelEdit} className="btn-secondary">{t.admin.cancel}</button>}
                </div>
              </form>
            </div>
            <div className="services-admin-grid">
              {services.map(service => (
                <div key={service.id || service._id} className="service-admin-card">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button onClick={() => handleEditService(service)} className="edit-btn">{t.admin.edit}</button>
                  <button onClick={() => handleDeleteService(service.id || service._id)} className="delete-btn">{t.admin.delete}</button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'packages' && (
          <div className="admin-form">
            <h2>{t.admin.managePackages}</h2>
            
            <div className="package-form">
              <h3>{editingPackage ? t.admin.editPackage : t.admin.addPackage}</h3>
              <form onSubmit={handlePackageSubmit}>
                <select 
                  value={packageForm.type} 
                  onChange={(e) => setPackageForm({ ...packageForm, type: e.target.value })}
                  className="form-select"
                >
                  <option value="social">{t.pricing.socialTitle}</option>
                  <option value="photo">{t.pricing.photoTitle}</option>
                </select>
                <input 
                  type="text" 
                  placeholder={t.admin.packageName} 
                  value={packageForm.name} 
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  required 
                  className="form-input" 
                />
                <input 
                  type="text" 
                  placeholder={t.admin.price} 
                  value={packageForm.price} 
                  onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                  required 
                  className="form-input" 
                />
                <textarea 
                  placeholder={t.admin.features} 
                  value={packageForm.features} 
                  onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                  required 
                  rows="3"
                  className="form-textarea" 
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={packageForm.popular} 
                    onChange={(e) => setPackageForm({ ...packageForm, popular: e.target.checked })}
                  />
                  {t.admin.popular}
                </label>
                <select 
                  value={packageForm.duration} 
                  onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                  className="form-select"
                >
                  <option value="month">{t.admin.perMonth}</option>
                  <option value="session">{t.admin.perSession}</option>
                </select>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" className="btn-primary">{editingPackage ? t.admin.edit : t.admin.add}</button>
                  {editingPackage && <button type="button" onClick={resetPackageForm} className="btn-secondary">{t.admin.cancel}</button>}
                </div>
              </form>
            </div>

            <div className="packages-admin-list">
              <h3>{t.pricing.socialTitle}</h3>
              <div className="packages-admin-grid">
                {packagesData.social.map(pkg => (
                  <div key={pkg.id} className="package-admin-card">
                    <div className="package-admin-info">
                      <h4>{pkg.name}</h4>
                      <p className="package-price-admin">{pkg.price}</p>
                      <ul className="package-features-admin">
                        {pkg.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                      </ul>
                      {pkg.popular && <span className="popular-badge">{t.admin.popularBadge}</span>}
                      <span className="duration-badge">{pkg.duration === 'month' ? t.admin.monthly : t.admin.perSessionLabel}</span>
                    </div>
                    <div className="package-admin-actions">
                      <button onClick={() => editPackage('social', pkg)} className="edit-btn">{t.admin.edit}</button>
                      <button onClick={() => deletePackage('social', pkg.id)} className="delete-btn">{t.admin.delete}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="packages-admin-list">
              <h3>{t.pricing.photoTitle}</h3>
              <div className="packages-admin-grid">
                {packagesData.photo.map(pkg => (
                  <div key={pkg.id} className="package-admin-card">
                    <div className="package-admin-info">
                      <h4>{pkg.name}</h4>
                      <p className="package-price-admin">{pkg.price}</p>
                      <ul className="package-features-admin">
                        {pkg.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                      </ul>
                      {pkg.popular && <span className="popular-badge">{t.admin.popularBadge}</span>}
                      <span className="duration-badge">{pkg.duration === 'month' ? t.admin.monthly : t.admin.perSessionLabel}</span>
                    </div>
                    <div className="package-admin-actions">
                      <button onClick={() => editPackage('photo', pkg)} className="edit-btn">{t.admin.edit}</button>
                      <button onClick={() => deletePackage('photo', pkg.id)} className="delete-btn">{t.admin.delete}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'inquiries' && (
          <div className="inquiries-list">
            {inquiries.map(inquiry => (
              <div key={inquiry.id || inquiry._id} className="inquiry-card">
                <p><strong>{inquiry.name}</strong> - {inquiry.email}</p>
                <p>{inquiry.message}</p>
                <small>{new Date(inquiry.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showImageManager && currentPortfolio && (
        <div className="image-manager-modal">
          <div className="image-manager-content">
            <div className="image-manager-header">
              <h2>{t.admin.manageImages} - {currentPortfolio.title}</h2>
              <button className="close-modal" onClick={closeImageManager}>×</button>
            </div>
            <div className="image-manager-body">
              <div className="add-images-section">
                <h3>{t.admin.addImages}</h3>
                <label className="upload-label">{t.admin.upload}
                  <input type="file" accept="image/*" multiple onChange={handleAddImagesToPortfolio} style={{ display: 'none' }} />
                </label>
                <div className="url-input-group">
                  <input type="text" placeholder="Image URL" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="form-input" />
                  <button onClick={addImageUrlToManager} className="btn-secondary">{t.admin.addUrl}</button>
                </div>
                {newImagePreviews.length > 0 && (
                  <>
                    <div className="new-images-grid">
                      {newImagePreviews.map((preview, idx) => (
                        <div key={idx} className="new-image-item">
                          <img src={preview} alt="New" />
                        </div>
                      ))}
                    </div>
                    <button onClick={saveNewImagesToPortfolio} className="btn-primary">{t.admin.saveImages}</button>
                  </>
                )}
              </div>
              <div className="existing-images-section">
                <h3>{t.admin.existingImages} ({currentPortfolio.images?.length})</h3>
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
      
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container">
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
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm</h3>
              <button className="modal-close" onClick={() => setShowConfirmModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{confirmMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="modal-btn-danger" onClick={handleConfirmDelete}>Delete</button>
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
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [packagesData, setPackagesData] = useState({
    social: [],
    photo: []
  });
  const t = translations[lang];
  
  const logoSrc = darkMode ? '/logo-dark.png' : '/logo-light.png';

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showLangMenu && !e.target.closest('.lang-wrapper') && !e.target.closest('.lang-menu')) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLangMenu]);

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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        {loading && <LoadingScreen onComplete={() => setLoading(false)} logoSrc={logoSrc} />}
        
        <button className={`floating-scroll ${showScrollTop ? 'visible' : ''}`} onClick={scrollToTop}>↑</button>
        
        <div className="top-buttons">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          
          <div className="lang-wrapper">
            <button className="lang-toggle" onClick={() => setShowLangMenu(!showLangMenu)}>
              <FaGlobe />
            </button>
            {showLangMenu && (
              <div className="lang-menu">
                <button className="lang-option" onClick={() => { setLang('en'); setShowLangMenu(false); }}>English</button>
                <button className="lang-option" onClick={() => { setLang('ar'); setShowLangMenu(false); }}>العربية</button>
                <button className="lang-option" onClick={() => { setLang('fr'); setShowLangMenu(false); }}>Français</button>
              </div>
            )}
          </div>
          
          <div className="admin-icon-wrapper">
            <Link to="/admin" className="admin-icon-link">
              <FaUserLock className="admin-icon" />
            </Link>
          </div>
        </div>

        {/* Chat Bot Toggle Button */}
        {!showChatBot && (
          <button className="chatbot-toggle" onClick={() => setShowChatBot(true)}>
            <FaRobot />
          </button>
        )}
        {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}
        
        <Routes>
          <Route path="/" element={<HomePage scrollToSection={scrollToSection} portfolios={portfolios} refreshPortfolios={refreshPortfolios} t={t} packagesData={packagesData} logoSrc={logoSrc} />} />
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
          <Route path="/packages" element={<PackagesPage packagesData={packagesData} t={t} />} />
          <Route path="/admin" element={<AdminPanel packagesData={packagesData} setPackagesData={setPackagesData} t={t} logoSrc={logoSrc} />} />
        </Routes>
        
        <footer className="footer">
          <div className="container">
            <div className="footer-logo">
              <span className="footer-logo-text">SPECTRA FRAMES</span>
            </div>
            <div className="footer-social">
              <a href="https://www.facebook.com/share/1Gu7UjDUn2/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="social-link facebook"><FaFacebookF /></a>
              <a href="https://www.instagram.com/spectra.frames?igsh=djZxcW43YnplY3ps" target="_blank" rel="noopener noreferrer" className="social-link instagram"><FaInstagram /></a>
              <a href="https://www.tiktok.com/@spectra.frames?_r=1&_t=ZS-96ZhwOqCXZf" target="_blank" rel="noopener noreferrer" className="social-link tiktok"><FaTiktok /></a>
              <a href="https://wa.me/96178977272" target="_blank" rel="noopener noreferrer" className="social-link whatsapp"><FaWhatsapp /></a>
            </div>
            <div className="footer-contact-info">
              <p className="footer-contact">Ainab, Lebanon | +961 78 977 272 | <a href="mailto:spectraframes.00@gmail.com" className="footer-email-link">spectraframes.00@gmail.com</a></p>
            </div>
            <div className="footer-credit">
              <p className="footer-designed">{t.footer.designed} <span className="footer-brand">Spectra Frames</span></p>
            </div>
            <p className="footer-copyright">2026 Spectra Frames Photography Agency. {t.footer.allRights}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;