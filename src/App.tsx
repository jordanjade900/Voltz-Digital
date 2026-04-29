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
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [scrollY, setScrollY] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navIndicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const isAutoScrolling = useRef(false);
  const autoScrollTimeout = useRef<number | null>(null);

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
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          if (entry.target.tagName === 'SECTION' && entry.target.id && !isAutoScrolling.current) {
            setActiveSection(entry.target.id);
          }
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, section');
    animatedElements.forEach(el => observer.observe(el));

    const handleScroll = () => {
      const top = window.scrollY;
      setScrollY(top);
      
      if (isAutoScrolling.current) {
        if (autoScrollTimeout.current) window.clearTimeout(autoScrollTimeout.current);
        autoScrollTimeout.current = window.setTimeout(() => {
          isAutoScrolling.current = false;
        }, 150);
      }
      
      // Force home active when near top
      if (top < 100 && !isAutoScrolling.current) {
        setActiveSection('home');
      }
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
  }, [activeSection]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      isAutoScrolling.current = true;
      setActiveSection(sectionId);
      element.scrollIntoView({ behavior: 'smooth' });
      
      if (autoScrollTimeout.current) window.clearTimeout(autoScrollTimeout.current);
      autoScrollTimeout.current = window.setTimeout(() => {
        isAutoScrolling.current = false;
      }, 2000); // Fallback timeout if scroll events don't fire or stop early
    }
  };

  const handleCheckout = (packageType: string) => {
    // Redirect to Whop checkout link in a new tab
    window.open("https://whop.com/voltz-digital/checkout/prod_w4K0Oa0QTDnKx?direct=true", "_blank");
  };

    const portfolioItems = [
    { id: 1, category: 'ecommerce', tag: 'E-Commerce', title: 'Jamwood Epoxy', videoUrl: 'https://res.cloudinary.com/dad155oxi/video/upload/f_auto,q_auto,vc_auto/v1776844908/Jamwood_auto_olx1nc.mp4', img: 'https://i.postimg.cc/15YTDFC8/image-2026-03-01-231618589.png', desc: 'A premium showcase and e-commerce platform for custom wood and epoxy craftsmanship.' },
    { id: 2, category: 'design-concept', tag: 'Design Concept', title: 'Solas', videoUrl: 'https://res.cloudinary.com/dad155oxi/video/upload/f_auto,q_auto,vc_auto/v1776499122/Solas_FINAL_aidtjp.mov', img: 'https://res.cloudinary.com/dad155oxi/image/upload/v1776847752/WhatsApp_Image_2026-04-22_at_3.48.56_AM_rik6eb.jpg', desc: 'An intelligent AI brand engine designed to automate and elevate visual identity and brand strategy.' },
    { id: 3, category: 'service-provider', tag: 'Event Showcase', title: 'Miss UTech Jamaica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://res.cloudinary.com/dad155oxi/image/upload/v1774560772/WhatsApp_Image_2026-03-26_at_4.32.31_PM_qm0skt.jpg', desc: 'Official platform for a major international pageant, featuring contestant profiles and event highlights.' },
    { id: 4, category: 'service-provider', tag: 'Landing Page', title: 'Ether Reality', videoUrl: 'https://res.cloudinary.com/dad155oxi/video/upload/f_auto,q_auto,vc_auto/v1776499084/Ether_Reality_FINAL_zz7jxf.mov', img: 'https://res.cloudinary.com/dad155oxi/image/upload/v1776846762/WhatsApp_Image_2026-04-22_at_3.24.05_AM_fhqja8.jpg', desc: 'A cutting-edge landing page designed for the futuristic digital and spatial reality ecosystem.' },
    { id: 5, category: 'ecommerce', tag: 'E-Commerce', title: 'Artelier', videoUrl: 'https://res.cloudinary.com/dad155oxi/video/upload/f_auto,q_auto,vc_auto/v1776499132/ARTELIER_FINAL_zoqqfy.mov', img: 'https://res.cloudinary.com/dad155oxi/image/upload/v1776846762/WhatsApp_Image_2026-04-22_at_3.30.51_AM_a4uexu.jpg', desc: 'A bespoke makeup e-commerce experience designed for high-end luxury and artistic expression.' },
    { id: 6, category: 'design-concept', tag: 'Design Concept', title: 'Bushido', videoUrl: 'https://res.cloudinary.com/dad155oxi/video/upload/f_auto,q_auto,vc_auto/v1776847518/BUSHIDO_FINAL_rjxvm4.mov', img: 'https://res.cloudinary.com/dad155oxi/image/upload/v1776846762/WhatsApp_Image_2026-04-22_at_3.31.51_AM_wsjvkk.jpg', desc: 'A dedicated digital space for the ancient art of Japanese swordsmanship and traditional forge craftsmanship.' }
  ];

  const filteredPortfolio = portfolioFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === portfolioFilter);

  return (
    <div className="app-container">
      <Helmet>
        <title>Voltz Digital | Global Performance Web Design & Digital Infrastructure</title>
        <meta name="description" content="Voltz Digital delivers high-velocity digital infrastructure and conversion-optimized websites for global brands. Specialists in high-performance landing pages, advanced animations, and rapid web development." />
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
        <a href="#home" className={`${activeSection === 'home' ? 'active-link' : ''}`} onClick={(e) => handleNavClick(e, 'home')}>
          <Home size={18} /> <span>Home</span>
        </a>
        <a href="#about" className={`${activeSection === 'about' ? 'active-link' : ''}`} onClick={(e) => handleNavClick(e, 'about')}>
          <Star size={18} /> <span>About</span>
        </a>

        <a href="#pricing" className={`${activeSection === 'pricing' ? 'active-link' : ''}`} onClick={(e) => handleNavClick(e, 'pricing')}>
          <Bolt size={18} /> <span>Services</span>
        </a>
        <a href="#portfolio" className={`${activeSection === 'portfolio' ? 'active-link' : ''}`} onClick={(e) => handleNavClick(e, 'portfolio')}>
          <Briefcase size={18} /> <span>Portfolio</span>
        </a>
        <a href="#contact" className={`${activeSection === 'contact' ? 'active-link' : ''}`} onClick={(e) => handleNavClick(e, 'contact')}>
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
                <h3>Premium Deployment</h3>
                <p>Transform<br />your business today.</p>
              </div>
              <div className="action-line"></div>
              <a href="#pricing" className="btn-primary-action" onClick={(e) => handleNavClick(e, 'pricing')}>
                <ArrowRight size={20} /> Start Your Build
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

        {/* About Section (Core Capabilities) */}
        <section id="about" className="minimal-section">
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
                <Pen size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h3>Copywriting</h3>
                <p>Persuasive, SEO-optimized content that speaks directly to your target audience and drives them to take action.</p>
              </div>
              <div className="minimal-card fade-up delay-2">
                <TrendingUp size={32} strokeWidth={1.5} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h3>Analytics Setup</h3>
                <p>Track your success with advanced analytics integration, giving you clear insights into your website's performance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="minimal-section" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
          <div className="container">
            <div className="how-it-works-grid">
              <div className="fade-up how-it-works-header">
                <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>
                  Streamlined<br />
                  <span style={{ color: 'var(--primary)' }}>Delivery</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '400px' }}>
                  We've optimized our development pipeline to get your high-performance infrastructure live in record time with zero technical friction.
                </p>
              </div>
              
              <div className="how-it-works-steps">
                {[
                  { num: '01', title: 'Choose a Package', desc: 'Select the plan that fits your business needs from our transparent pricing tiers. No hidden fees.' },
                  { num: '02', title: 'Secure Checkout', desc: "Complete your transaction via WHOP. You'll receive an instant confirmation and project receipt." },
                  { num: '03', title: 'Detailed Onboarding', desc: 'Fill out our brief technical form. Our lead engineer will contact you within 4 hours to sync.' },
                  { num: '04', title: 'Rapid Delivery', desc: 'Watch your site go live in just 7-14 days. We handle all the deployment and technical setup.' }
                ].map((step, i) => (
                  <div 
                    key={i} 
                    className={`minimal-card how-it-works-step fade-up delay-${i % 4 + 1}`} 
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.borderLeftColor = 'var(--primary)'; 
                      e.currentTarget.style.transform = 'translateX(10px)'; 
                    }} 
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.borderLeftColor = 'rgba(0, 212, 255, 0.2)'; 
                      e.currentTarget.style.transform = 'translateX(0)'; 
                    }}
                  >
                    <div className="how-it-works-step-num">
                      {step.num}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 500 }}>{step.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>Transparent Pricing</h2>
              <p>No hidden fees. Just high-quality infrastructure. Pricing in USD.</p>
            </div>
            <div className="grid grid-3">
              {[
                { name: 'Bronze', price: '$600', desc: 'Perfect for small local businesses', features: ['Static Custom Design', 'Mobile Responsive', 'Basic SEO Setup', 'Contact Form'] },
                { name: 'Silver', price: '$1000', desc: 'Great for growing companies', popular: true, features: ['Animated Custom Design', 'Advanced SEO Optimization', 'Performance Optimization', '1 Month FREE Maintenance'] },
                { name: 'Gold', price: '$2500', desc: 'Full digital infrastructure', features: ['Advanced Motion Suite', 'Premium Infrastructure', 'Priority Technical Support', '2 Months FREE Maintenance'] }
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
                    { name: 'Website Type', b: 'Static', s: 'Animated', g: 'Animated' },
                    { name: 'Mobile Responsive', b: true, s: true, g: true },
                    { name: 'Performance Optimization', b: true, s: true, g: true },
                    { name: 'SEO Setup', b: 'Basic', s: 'Advanced', g: 'Premium' },
                    { name: 'Advanced Motion', b: false, s: false, g: true },
                    { name: 'Free Maintenance', b: false, s: '1 Month', g: '2 Months' },
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
                  { name: 'Pulse', price: '$99/mo', desc: 'Essential security & performance', features: ['Monthly Backups', 'Uptime Monitoring', 'Security Patches', 'Standard Support'] },
                  { name: 'Supercharge', price: '$169/mo', desc: 'Aggressive growth & optimization', popular: true, features: ['Weekly Backups', 'Speed Optimization', 'SEO Performance Reports', 'Priority WhatsApp Support'] }
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
                    <button onClick={() => handleCheckout(p.name)} className={p.popular ? "btn-primary-action btn-block" : "btn-outline btn-block"}>
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

        {/* Portfolio Section */}
        <section id="portfolio" className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>Recent Deployments</h2>
              <p>Explore our latest high-performance builds for modern businesses.</p>
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
                { q: 'What is included in the website packages?', a: 'All packages include a custom-designed, mobile-responsive website, basic SEO optimization, and a contact form. Higher-tier packages include additional features like booking systems, advanced motion suites, and professional copywriting.' },
                { q: 'Do you provide hosting and domain names?', a: 'Our Silver and Gold packages include 1 year of premium hosting. Domain names are typically purchased separately by the client to ensure full ownership, but we can assist you with the process.' },
                { q: 'How long does it take to build a website?', a: 'Delivery times vary by package. The Bronze package takes about 5 days, Silver takes 7 days, and Gold takes 14 days. This timeline starts once we have received all necessary content and branding materials from you.' },
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '60px', maxWidth: '800px', margin: '0 auto' }}>
              <div className="fade-up delay-1">
                <h3 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '30px', letterSpacing: '-0.02em', textAlign: 'center' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', marginBottom: '40px' }}>
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
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        <a href="https://wa.me/18765471161" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                          +1 (876) 547-1161
                        </a>
                      </p>
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
              {selectedVideo.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                <video 
                  src={selectedVideo} 
                  controls 
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  autoPlay 
                  playsInline
                  preload="auto"
                  poster={portfolioItems.find(i => i.videoUrl === selectedVideo)?.img}
                  onCanPlay={() => setIsVideoLoading(false)}
                  onError={() => setIsVideoLoading(false)}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <iframe 
                  src={`${selectedVideo}${selectedVideo.includes('?') ? '&' : '?'}autoplay=1`}
                  title="Project Presentation"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  onLoad={() => setIsVideoLoading(false)}
                  onError={() => setIsVideoLoading(false)}
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
              <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a></li>
              <li><a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')}>Services</a></li>
              <li><a href="#portfolio" onClick={(e) => handleNavClick(e, 'portfolio')}>Portfolio</a></li>
              <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Capabilities</h4>
            <ul className="footer-links">
              <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>Rapid Deployment</a></li>
              <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>Technical SEO</a></li>
              <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>Managed Infrastructure</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul className="footer-links">
              <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact Us</a></li>
              <li><a href="mailto:hello@voltzdigital.com">hello@voltzdigital.com</a></li>
              <li><a href="https://wa.me/18765471161" target="_blank" rel="noopener noreferrer">+1 (876) 547-1161</a></li>
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
