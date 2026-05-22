import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function PackagesPage() {
  const navigate = useNavigate();

  const socialPackages = [
    { name: 'Starter', price: '$299', features: ['5 Photos', '2 Reels', '1 Story', '1 Week Delivery'], popular: false },
    { name: 'Pro', price: '$599', features: ['10 Photos', '5 Reels', '3 Stories', '3 Days Delivery', 'Editing Included'], popular: true },
    { name: 'Business', price: '$999', features: ['20 Photos', '10 Reels', '5 Stories', 'Next Day Delivery', 'Editing Included', 'Strategy Call'], popular: false }
  ];

  const photoPackages = [
    { name: 'Essential', price: '$1,500', features: ['4 Hours Coverage', '200+ Edited Photos', 'Online Gallery', 'Print Rights'], popular: false },
    { name: 'Premium', price: '$2,800', features: ['8 Hours Coverage', '500+ Edited Photos', 'Online Gallery', 'Print Rights', 'Engagement Session', 'Premium Album'], popular: true },
    { name: 'Luxury', price: '$4,500', features: ['Full Day Coverage', '800+ Edited Photos', 'Online Gallery', 'Print Rights', 'Engagement Session', 'Premium Album', 'Second Shooter', 'Same Day Edits'], popular: false }
  ];

  return (
    <div className="packages-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        
        <div className="packages-header">
          <h1 className="packages-main-title">Our Packages</h1>
          <p className="packages-subtitle">Choose the perfect package for your needs</p>
        </div>

        {/* Social Media Packages */}
        <div className="packages-category">
          <h2 className="packages-category-title">📱 Social Media Packages</h2>
          <p className="packages-category-desc">Perfect for influencers, brands, and content creators</p>
          <div className="packages-grid">
            {socialPackages.map((pkg, idx) => (
              <div key={idx} className={`package-card ${pkg.popular ? 'featured' : ''}`}>
                {pkg.popular && <div className="featured-badge">Most Popular</div>}
                <h3 className="package-name">{pkg.name}</h3>
                <div className="package-price">{pkg.price}<span> / package</span></div>
                <ul className="package-features">
                  {pkg.features.map((feature, i) => (<li key={i}>✓ {feature}</li>))}
                </ul>
                <button className="package-btn" onClick={() => window.location.href = 'mailto:spectraframes.00@gmail.com?subject=Booking Inquiry'}>Book Now →</button>
              </div>
            ))}
          </div>
        </div>

        {/* Photography Sessions Packages */}
        <div className="packages-category">
          <h2 className="packages-category-title">📸 Photography Sessions</h2>
          <p className="packages-category-desc">Professional photography for your special moments</p>
          <div className="packages-grid">
            {photoPackages.map((pkg, idx) => (
              <div key={idx} className={`package-card ${pkg.popular ? 'featured' : ''}`}>
                {pkg.popular && <div className="featured-badge">Most Popular</div>}
                <h3 className="package-name">{pkg.name}</h3>
                <div className="package-price">{pkg.price}<span> / session</span></div>
                <ul className="package-features">
                  {pkg.features.map((feature, i) => (<li key={i}>✓ {feature}</li>))}
                </ul>
                <button className="package-btn" onClick={() => window.location.href = 'mailto:spectraframes.00@gmail.com?subject=Booking Inquiry'}>Book Now →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackagesPage;