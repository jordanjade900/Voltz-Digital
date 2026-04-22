import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  Home, 
  Briefcase, 
  Bolt, 
  Mail, 
  Calendar, 
  Play, 
  Target, 
  ShieldCheck, 
  ShoppingCart, 
  Pen, 
  TrendingUp, 
  Star, 
  Check, 
  X, 
  Loader,
  ChevronDown, 
  MessageSquare, 
  ArrowRight, 
  Instagram, 
  Facebook, 
  Linkedin, 
  ArrowUp,
  CreditCard,
  XCircle
} from 'lucide-react';
import firebaseConfig from '../firebase-config.js';
import Particles from './components/Particles';
import OnboardingForm from './components/OnboardingForm';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [indicatedSection, setIndicatedSection] = useState('home');
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [scrollY, setScrollY] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navIndicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);


  // Scroll Animations & Active Section Tracking
  useEffect(() => {
    // Check for onboarding trigger in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('onboarding') === 'true' || params.get('order') === 'success') {
      setShowOnboarding(true);
      // Clean up URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          if (entry.target.id) {
            setActiveSection(entry.target.id);
          }
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, section');
    animatedElements.forEach(el => observer.observe(el));

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      const activeLink = document.querySelector(`.floating-nav a[href="#${activeSection}"]`) as HTMLElement;
      if (activeLink && navIndicatorRef.current) {
        navIndicatorRef.current.style.width = `${activeLink.offsetWidth}px`;
        navIndicatorRef.current.style.left = `${activeLink.offsetLeft}px`;
      }
    };

    // Handle escape key for modals
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedVideo(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    // Initial nav visibility
    setTimeout(() => {
      setIsNavVisible(true);
      handleResize(); // Sync indicator on show
    }, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection]);

  // Reset loading state when video changes
  useEffect(() => {
    if (selectedVideo) {
      setIsVideoLoading(true);
    }
  }, [selectedVideo]);

  // Nav Indicator Logic - Separated to ensure it runs whenever activeSection changes
  useEffect(() => {
    const updateIndicator = () => {
      const activeLink = document.querySelector(`.floating-nav a[href="#${activeSection}"]`) as HTMLElement;
      if (activeLink && navIndicatorRef.current) {
        navIndicatorRef.current.style.width = `${activeLink.offsetWidth}px`;
        navIndicatorRef.current.style.left = `${activeLink.offsetLeft}px`;
      }
    };
    
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(updateIndicator);
    setIndicatedSection(activeSection);
  }, [activeSection]);

  const handleNavHover = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const link = e.currentTarget;
    if (navIndicatorRef.current) {
      navIndicatorRef.current.style.width = `${link.offsetWidth}px`;
      navIndicatorRef.current.style.left = `${link.offsetLeft}px`;
      navIndicatorRef.current.style.opacity = '1';
    }
    setIndicatedSection(sectionId);
  };

  const handleNavLeave = () => {
    const activeLink = document.querySelector(`.floating-nav a[href="#${activeSection}"]`) as HTMLElement;
    if (activeLink && navIndicatorRef.current) {
      navIndicatorRef.current.style.width = `${activeLink.offsetWidth}px`;
      navIndicatorRef.current.style.left = `${activeLink.offsetLeft}px`;
    }
    setIndicatedSection(activeSection);
  };

  // Testimonials Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckout = (packageType: string) => {
    // Redirect to Whop checkout link in a new tab
    window.open("https://whop.com/voltz-digital/checkout/prod_w4K0Oa0QTDnKx", "_blank");
  };

    const portfolioItems = [
    { id: 1, category: 'ecommerce', tag: 'E-Commerce', title: 'Jamwood Epoxy', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-carpenter-working-on-a-wooden-plank-41589-preview.mp4', img: 'https://i.postimg.cc/15YTDFC8/image-2026-03-01-231618589.png', desc: 'A premium showcase and e-commerce platform for custom wood and epoxy craftsmanship.' },
    { id: 2, category: 'service-provider', tag: 'Event Showcase', title: 'UTech Brand Expo', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://i.postimg.cc/RFDfgvjk/image-2026-03-01-232122830.png', desc: 'A dynamic event platform showcasing international innovation and brand excellence.' },
    { id: 3, category: 'service-provider', tag: 'Event Showcase', title: 'Miss UTech Jamaica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://res.cloudinary.com/dad155oxi/image/upload/v1774560772/WhatsApp_Image_2026-03-26_at_4.32.31_PM_qm0skt.jpg', desc: 'Official platform for a major international pageant, featuring contestant profiles and event highlights.' },
    { id: 4, category: 'local-business', tag: 'Portfolio', title: 'Island Properties', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'A luxury real estate listing platform with advanced search and geolocation.' },
    { id: 5, category: 'service-provider', tag: 'Service Provider', title: 'Apex Consulting', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'A professional corporate site designed to establish authority and trust for global consulting firms.' },
    { id: 6, category: 'ecommerce', tag: 'E-Commerce', title: 'Urban Threads', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'A sleek, fast-loading online store for a modern global clothing brand.' }
  ];

  const filteredPortfolio = portfolioFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === portfolioFilter);

  return (
    <div className="app-container">
      <Helmet>
        <title>Voltz Digital | Global Performance Web Design & Digital Infrastructure</title>
        <meta name="description" content="Voltz Digital delivers high-velocity digital infrastructure and conversion-optimized websites for global brands. Specialists in scalable e-commerce, high-performance landing pages, and rapid web development." />
        <meta name="keywords" content="global web design agency, high performance websites, conversion optimized design, scalable ecommerce, fast web development, premium digital infrastructure" />
        <link rel="canonical" href="https://voltzdigital.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://voltzdigital.com" />
        <meta property="og:title" content="Voltz Digital | Global Performance Web Design" />
        <meta property="og:description" content="High-velocity digital infrastructure for brands that want to scale globally. Custom builds delivered in record time." />
        <meta property="og:image" content="https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://voltzdigital.com" />
        <meta property="twitter:title" content="Voltz Digital | Global Performance Web Design" />
        <meta property="twitter:description" content="High-velocity digital infrastructure for brands that want to scale globally. Custom builds delivered in record time." />
        <meta property="twitter:image" content="https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DigitalDocument",
            "name": "Voltz Digital",
            "description": "High-velocity digital infrastructure and conversion-optimized websites for global brands.",
            "url": "https://voltzdigital.com",
            "logo": "https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png",
            "areaServed": "Worldwide",
            "serviceType": [
              "Web Design",
              "Web Development",
              "E-commerce Solutions",
              "Performance Optimization"
            ]
          })}
        </script>
      </Helmet>

      <div className="particles-container">
        <Particles
          particleColors={["#00D4FF", "#ffffff"]}
          particleCount={isMobile ? 80 : 250}
          particleSpread={12}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <nav className={`floating-nav ${isNavVisible ? 'visible' : ''}`} ref={navRef}>
        <div className="nav-indicator" ref={navIndicatorRef}></div>
        <a href="#home" className={`${activeSection === 'home' ? 'active-link' : ''} ${indicatedSection === 'home' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'home')} onMouseEnter={(e) => handleNavHover(e, 'home')} onMouseLeave={handleNavLeave}>
          <Home size={18} /> <span>Home</span>
        </a>
        <a href="#portfolio" className={`${activeSection === 'portfolio' ? 'active-link' : ''} ${indicatedSection === 'portfolio' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'portfolio')} onMouseEnter={(e) => handleNavHover(e, 'portfolio')} onMouseLeave={handleNavLeave}>
          <Briefcase size={18} /> <span>Portfolio</span>
        </a>
        <a href="#services" className={`${activeSection === 'services' ? 'active-link' : ''} ${indicatedSection === 'services' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'services')} onMouseEnter={(e) => handleNavHover(e, 'services')} onMouseLeave={handleNavLeave}>
          <Bolt size={18} /> <span>Services</span>
        </a>
        <a href="#contact" className={`${activeSection === 'contact' ? 'active-link' : ''} ${indicatedSection === 'contact' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'contact')} onMouseEnter={(e) => handleNavHover(e, 'contact')} onMouseLeave={handleNavLeave}>
          <Mail size={18} /> <span>Contact</span>
        </a>
      </nav>

      <header className="minimal-header">
        <a href="#home" className="logo" onClick={(e) => handleNavClick(e, 'home')}>
          <img 
            src="https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png" 
            alt="Voltz Digital" 
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </a>
      </header>

      <main>
        {/* Home Section */}
        <section id="home" className="hero-new">
          <div className="hero-left">
            <p className="small-motto">You innovate,<br /><strong>we automate.</strong></p>
          </div>
          <div className="hero-center">
            <h1 className="massive-text fade-up">
              <span className="em-dash"></span> The faster way<br />
              to <span className="highlight">design,</span> <span className="highlight">build,</span> and<br />
              <span className="highlight">scale</span> your brand.
            </h1>
            <div className="hero-action-row fade-up delay-1">
              <div className="action-text">
                <h3>See Platform in action</h3>
                <p>Join our guided tour and explore<br />all features live.</p>
              </div>
              <div className="action-line"></div>
              <a href="#contact" className="btn-primary-action" onClick={(e) => handleNavClick(e, 'contact')}>
                <Calendar size={20} /> Book a Demo
              </a>
            </div>
            <div className="hero-stats-row fade-up delay-2">
              <div className="stat-block">
                <div className="stat-val highlight">97.8<span className="stat-unit">%</span></div>
                <div className="stat-desc"><strong>Uptime</strong><br />30-day monitoring</div>
              </div>
              <div className="stat-block">
                <div className="stat-val highlight">+31.2<span className="stat-unit">%</span></div>
                <div className="stat-desc"><strong>Performance</strong><br />AI optimized bundle</div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>Recent Deployments</h2>
              <p>Explore our latest high-performance builds for modern businesses.</p>
            </div>
            <div className="portfolio-filters fade-up delay-2">
              {['all', 'local-business', 'restaurant', 'ecommerce', 'service-provider'].map(filter => (
                <button 
                  key={filter}
                  className={`filter-btn ${portfolioFilter === filter ? 'active' : ''}`} 
                  onClick={() => setPortfolioFilter(filter)}
                >
                  {filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <div className="grid grid-3">
              {filteredPortfolio.map((item, idx) => (
                <div 
                  key={item.id} 
                  className={`portfolio-card fade-up delay-${(idx % 3) + 1} in-view`}
                  onClick={() => setSelectedVideo(item.videoUrl)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="portfolio-img-wrapper">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="portfolio-img" 
                      referrerPolicy="no-referrer" 
                      loading="lazy"
                    />
                    <div className="portfolio-overlay">
                      <Play size={40} />
                      <span>Watch Presentation</span>
                    </div>
                  </div>
                  <div className="portfolio-content">
                    <span className="portfolio-tag">{item.tag}</span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>Core Capabilities</h2>
              <p>Everything you need to dominate your market, delivered at lightning speed.</p>
            </div>
            <div className="grid grid-3">
              <div className="minimal-card fade-up delay-1">
                <Bolt size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h3>Website Design</h3>
                <p>Modern, mobile-responsive websites that get you customers and look great on any device. We focus on conversion-driven design.</p>
              </div>
              <div className="minimal-card fade-up delay-2">
                <Target size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h3>SEO Optimization</h3>
                <p>Get found on Google and dominate your local market with our proven SEO strategies. Built into the code from day one.</p>
              </div>
              <div className="minimal-card fade-up delay-3">
                <ShieldCheck size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h3>Website Maintenance</h3>
                <p>Keep your site fast, secure, and always online with our reliable maintenance plans. We handle the technical details.</p>
              </div>
              <div className="minimal-card fade-up delay-1">
                <ShoppingCart size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h3>E-commerce</h3>
                <p>Start selling online with custom online stores built for high conversion rates and seamless checkout experiences.</p>
              </div>
              <div className="minimal-card fade-up delay-2">
                <Pen size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h3>Copywriting</h3>
                <p>Persuasive, SEO-optimized content that speaks directly to your target audience and drives them to take action.</p>
              </div>
              <div className="minimal-card fade-up delay-3">
                <TrendingUp size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h3>Analytics Setup</h3>
                <p>Track your success with advanced analytics integration, giving you clear insights into your website's performance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>Client Success</h2>
              <p>Don't just take our word for it.</p>
            </div>
            <div className="testimonials-slider fade-up delay-1">
              <div className="testimonials-track" style={{ transform: `translateX(-${currentSlide * 100}%)`, display: 'flex', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {[
                  { name: 'John Smith', company: 'ABC Plumbing', img: '11', text: '"Voltz Digital transformed our online presence. We\'re getting 3x more calls now! The speed of delivery was unbelievable."' },
                  { name: 'Sarah Johnson', company: 'Boutique Owner', img: '5', text: '"Professional, fast, and exactly what we needed. They understood our vision and executed it perfectly in just 4 days."' },
                  { name: 'Michael Brown', company: 'Fitness Coach', img: '33', text: '"The SEO optimization they did is already paying off. We\'re ranking on the first page for our main keywords!"' }
                ].map((t, i) => (
                  <div key={i} className="testimonial-slide" style={{ minWidth: '100%' }}>
                    <div className="minimal-card">
                      <div className="stars" style={{ display: 'flex', gap: '4px', color: 'var(--primary)', marginBottom: '20px' }}>
                        <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                      </div>
                      <p>{t.text}</p>
                      <div className="testimonial-author">
                        <img 
                          src={`https://i.pravatar.cc/150?img=${t.img}`} 
                          alt={t.name} 
                          referrerPolicy="no-referrer" 
                          loading="lazy"
                        />
                        <div>
                          <h4>{t.name}</h4>
                          <p>{t.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="slider-dots">
                {[0, 1, 2].map(i => (
                  <span key={i} className={`dot ${currentSlide === i ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>Transparent Pricing</h2>
              <p>No hidden fees. Just high-quality infrastructure. Pricing in USD.</p>
            </div>
            <div className="grid grid-3">
              {[
                { name: 'Bronze', price: '$600', desc: 'Perfect for small local businesses', features: ['Custom 3-Page Website', 'Mobile Responsive', 'Basic SEO Setup', 'Contact Form'] },
                { name: 'Silver', price: '$1000', desc: 'Great for growing companies', popular: true, features: ['Custom 5-Page Website', 'Advanced SEO Optimization', 'Booking/Lead Integration', '1 Month FREE Maintenance'] },
                { name: 'Gold', price: '$2500', desc: 'Full digital infrastructure', features: ['Custom 10-Page Store', 'Payment Gateway Setup', 'Product Uploads (Up to 50)', '2 Months FREE Maintenance'] }
              ].map((p, i) => (
                <div key={i} className={`minimal-card pricing-card ${p.popular ? 'popular' : ''} fade-up delay-${i + 1}`}>
                  {p.popular && <div className="popular-badge">MOST POPULAR</div>}
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <div className="pricing-price" style={p.popular ? { color: 'var(--primary)' } : {}}>{p.price}</div>
                  <ul className="pricing-features">
                    {p.features.map((f, j) => (
                      <li key={j}><Check size={16} /> {f}</li>
                    ))}
                  </ul>
                  <button onClick={() => handleCheckout(p.name)} className={p.popular ? "btn-primary-action btn-block" : "btn-outline btn-block"}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="comparison-container fade-up delay-4">
              <h3 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.8rem', fontWeight: 500 }}>Compare Packages</h3>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Bronze</th>
                    <th className="highlight-col">Silver</th>
                    <th>Gold</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Pages', b: '3', s: '5', g: '10' },
                    { name: 'Mobile Responsive', b: true, s: true, g: true },
                    { name: 'Free Maintenance', b: false, s: '1 Month', g: '2 Months' },
                    { name: 'SEO Setup', b: 'Basic', s: 'Advanced', g: 'Premium' },
                    { name: 'E-commerce Ready', b: false, s: false, g: true },
                    { name: 'Payment Gateway', b: false, s: 'Booking Only', g: 'Full Checkout' },
                    { name: 'Product Uploads', b: false, s: false, g: 'Up to 50' },
                    { name: 'Priority Support', b: false, s: true, g: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td>{row.name}</td>
                      <td>{typeof row.b === 'boolean' ? (row.b ? <Check size={18} className="check-icon" /> : <X size={16} className="x-icon" />) : row.b}</td>
                      <td className="highlight-col">{typeof row.s === 'boolean' ? (row.s ? <Check size={18} className="check-icon" /> : <X size={16} className="x-icon" />) : row.s}</td>
                      <td>{typeof row.g === 'boolean' ? (row.g ? <Check size={18} className="check-icon" /> : <X size={16} className="x-icon" />) : row.g}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Maintenance Pricing */}
            <div className="maintenance-section fade-up delay-1">
              <div className="section-header" style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '2rem' }}>Maintenance Infrastructure</h2>
                <p>Ensure your digital assets remain high-velocity, secure, and always online.</p>
              </div>
              <div className="grid grid-2" style={{ maxWidth: '900px', margin: '0 auto', gap: '30px' }}>
                {[
                  { name: 'Pulse', price: '$49/mo', desc: 'Essential security & performance', features: ['Monthly Backups', 'Uptime Monitoring', 'Security Patches', 'Standard Support'] },
                  { name: 'Supercharge', price: '$99/mo', desc: 'Aggressive growth & optimization', popular: true, features: ['Weekly Backups', 'Speed Optimization', 'SEO Performance Reports', 'Priority WhatsApp Support'] }
                ].map((p, i) => (
                  <div key={i} className={`minimal-card pricing-card ${p.popular ? 'popular' : ''}`}>
                    {p.popular && <div className="popular-badge">RECOMMENDED</div>}
                    <h3 style={{ fontSize: '1.4rem' }}>{p.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.desc}</p>
                    <div className="pricing-price" style={p.popular ? { color: 'var(--primary)', fontSize: '2.8rem' } : { fontSize: '2.8rem' }}>{p.price}</div>
                    <ul className="pricing-features">
                      {p.features.map((f, j) => (
                        <li key={j}><Check size={16} style={{ color: p.popular ? 'var(--primary)' : 'inherit' }} /> {f}</li>
                      ))}
                    </ul>
                    <button onClick={() => window.open("https://whop.com/voltz-digital/checkout/prod_w4K0Oa0QTDnKx", "_blank")} className={p.popular ? "btn-primary-action btn-block" : "btn-outline btn-block"}>
                      Subscribe Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up delay-4" style={{ textAlign: 'center', marginTop: '60px' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '1px solid var(--border-color)',
                display: 'inline-block',
                maxWidth: '100%'
              }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  💳 Secure Checkout via <strong>WHOP</strong> | Credit Cards & PayPal Accepted | 256-bit SSL Encryption | 100% Money-Back Guarantee
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', opacity: 0.7 }}>
                  <CreditCard size={24} />
                  <Facebook size={24} />
                  <Instagram size={24} />
                  <Linkedin size={24} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know about our services and pricing.</p>
            </div>
            <div className="faq-container fade-up delay-1">
              {[
                { q: 'How do I pay?', a: 'We use WHOP for global secure checkout. You can pay with any major credit card, Apple Pay, or PayPal. Your payment is protected with bank-level encryption. Clients in specific regions can also request alternative payment methods - contact us for details.' },
                { q: 'What is included in the website packages?', a: 'All packages include a custom-designed, mobile-responsive website, basic SEO optimization, and a contact form. Higher-tier packages include additional features like booking systems, e-commerce capabilities, and professional copywriting.' },
                { q: 'Do you provide hosting and domain names?', a: 'Our Silver and Gold packages include 1 year of premium hosting. Domain names are typically purchased separately by the client to ensure full ownership, but we can assist you with the process.' },
                { q: 'How long does it take to build a website?', a: 'Delivery times vary by package. The Bronze package takes about 5 days, Silver takes 7 days, and Gold takes 10 days. This timeline starts once we have received all necessary content and branding materials from you.' },
                { q: 'What happens after the support period ends?', a: 'After your included support period (7, 30, or 90 days), we offer ongoing monthly maintenance plans to keep your site secure, updated, and performing at its best. You can also choose to manage the site yourself.' }
              ].map((faq, i) => (
                <div key={i} className="faq-item">
                  <button className="faq-question" onClick={(e) => {
                    const item = e.currentTarget.parentElement;
                    const answer = item?.querySelector('.faq-answer') as HTMLElement;
                    const isActive = item?.classList.contains('active');
                    
                    document.querySelectorAll('.faq-item').forEach(el => {
                      el.classList.remove('active');
                      (el.querySelector('.faq-answer') as HTMLElement).style.maxHeight = '0';
                    });

                    if (!isActive && item && answer) {
                      item.classList.add('active');
                      answer.style.maxHeight = answer.scrollHeight + 'px';
                    }
                  }}>
                    {faq.q}
                    <ChevronDown size={20} className="faq-icon" />
                  </button>
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>Get in Touch.</h2>
              <p>Ready to upgrade your online presence? Drop us a line or start an order to begin onboarding.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '60px' }}>
              <div className="fade-up delay-1">
                <h3 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '30px', letterSpacing: '-0.02em' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontWeight: 500 }}>Email Us</h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>hello@voltzdigital.com</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}>
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontWeight: 500 }}>WhatsApp</h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>+1 (876) XXX-XXXX</p>
                    </div>
                  </div>
                </div>

                <div className="minimal-card" style={{ padding: '30px', background: 'rgba(0, 212, 255, 0.03)', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
                  <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Already placed an order?</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
                    If you've already completed your payment, you can launch the onboarding form to provide your details.
                  </p>
                  <button 
                    onClick={() => setShowOnboarding(true)}
                    className="btn-outline"
                    style={{ fontSize: '0.9rem', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    Start Onboarding <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="fade-up delay-2">
                <div className="minimal-card" style={{ padding: '40px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: 500 }}>How it Works</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.2rem' }}>01</div>
                      <div>
                        <h4 style={{ marginBottom: '5px' }}>Choose a Package</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select the plan that fits your business needs above.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.2rem' }}>02</div>
                      <div>
                        <h4 style={{ marginBottom: '5px' }}>Secure Checkout</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete your transaction securely via WHOP. You'll receive an instant confirmation email.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.2rem' }}>03</div>
                      <div>
                        <h4 style={{ marginBottom: '5px' }}>Detailed Onboarding</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill out our comprehensive form. We'll contact you within 4 hours to start the project.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.2rem' }}>04</div>
                      <div>
                        <h4 style={{ marginBottom: '5px' }}>Rapid Delivery</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Watch your high-performance site go live in just 7-10 days.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={() => setSelectedVideo(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedVideo(null)}>
              <X size={24} />
            </button>
            <div className="video-container">
              {isVideoLoading && (
                <div className="video-loader">
                  <Loader size={40} className="spin" />
                </div>
              )}
              {selectedVideo.match(/\.(mp4|webm|ogg)$/) ? (
                <video 
                  src={selectedVideo} 
                  controls 
                  autoPlay 
                  onLoadedData={() => setIsVideoLoading(false)}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <iframe 
                  src={`${selectedVideo}${selectedVideo.includes('?') ? '&' : '?'}autoplay=1`}
                  title="Project Presentation"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  onLoad={() => setIsVideoLoading(false)}
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="minimal-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <img 
              src="https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png" 
              alt="Voltz Digital" 
              style={{ height: '180px', marginBottom: '20px', borderRadius: '8px' }} 
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <p>Lightning-Fast Websites for Growing Businesses. You innovate, we automate.</p>
            <div className="social-icons" style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <a href="#"><Instagram size={20} /></a>
              <a href="#"><Facebook size={20} /></a>
              <a href="#"><Linkedin size={20} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              <li><a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a></li>
              <li><a href="#portfolio" onClick={(e) => handleNavClick(e, 'portfolio')}>Portfolio</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, 'services')}>Services</a></li>
              <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Capabilities</h4>
            <ul className="footer-links">
              <li><a href="#services" onClick={(e) => handleNavClick(e, 'services')}>Rapid Deployment</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, 'services')}>Technical SEO</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, 'services')}>Managed Infrastructure</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, 'services')}>E-commerce</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul className="footer-links">
              <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact Us</a></li>
              <li><a href="mailto:hello@voltzdigital.com">hello@voltzdigital.com</a></li>
              <li><a href="tel:+18760000000">+1 (876) XXX-XXXX</a></li>
              <li><a href="#">Kingston, Jamaica</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; 2026 Voltz Digital. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

      <button 
        className={`scroll-to-top ${scrollY > 500 ? 'visible' : ''}`} 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ArrowUp size={20} />
      </button>

      {showOnboarding && <OnboardingForm onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
