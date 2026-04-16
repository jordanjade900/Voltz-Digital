import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-config.js';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navIndicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Particle Background Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      z: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 3 + 0.5;
        this.size = this.z;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = (this.z / 3) * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
      initParticles();
    }

    function initParticles() {
      particles = [];
      const particleCount = Math.floor((width * height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance / 120)})`;
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  // Scroll Animations & Active Section Tracking
  useEffect(() => {
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
    window.addEventListener('scroll', handleScroll);

    // Initial nav visibility
    setTimeout(() => setIsNavVisible(true), 500);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Nav Indicator Logic
  useEffect(() => {
    const activeLink = document.querySelector(`.floating-nav a[href="#${activeSection}"]`) as HTMLElement;
    if (activeLink && navIndicatorRef.current) {
      navIndicatorRef.current.style.width = `${activeLink.offsetWidth}px`;
      navIndicatorRef.current.style.left = `${activeLink.offsetLeft}px`;
    }
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
    // Redirect to Whop checkout link
    window.location.href = "https://whop.com/voltz-digital/checkout/prod_w4K0Oa0QTDnKx";
  };

  const portfolioItems = [
    { id: 1, category: 'ecommerce', tag: 'E-Commerce', title: 'Jamwood Epoxy', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://i.postimg.cc/15YTDFC8/image-2026-03-01-231618589.png', desc: 'A premium showcase and e-commerce platform for custom wood and epoxy craftsmanship.' },
    { id: 2, category: 'service-provider', tag: 'Event Showcase', title: 'UTech Brand Expo', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://i.postimg.cc/RFDfgvjk/image-2026-03-01-232122830.png', desc: 'A dynamic event platform showcasing student innovation and brand excellence at UTech, Jamaica.' },
    { id: 3, category: 'service-provider', tag: 'Event Showcase', title: 'Miss UTech Jamaica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://res.cloudinary.com/dad155oxi/image/upload/v1774560772/WhatsApp_Image_2026-03-26_at_4.32.31_PM_qm0skt.jpg', desc: 'Official platform for the Miss UTech Jamaica pageant, featuring contestant profiles and event highlights.' },
    { id: 4, category: 'local-business', tag: 'Local Business', title: 'Island Properties', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'A property listing platform with advanced search and filtering.' },
    { id: 5, category: 'service-provider', tag: 'Service Provider', title: 'Apex Consulting', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'A professional corporate site designed to establish authority and trust.' },
    { id: 6, category: 'ecommerce', tag: 'E-Commerce', title: 'Urban Threads', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'A sleek, fast-loading online store for a modern clothing brand.' }
  ];

  const filteredPortfolio = portfolioFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === portfolioFilter);

  return (
    <div className="app-container">
      <canvas ref={canvasRef} id="bg-canvas"></canvas>

      <nav className={`floating-nav ${isNavVisible ? 'visible' : ''}`} ref={navRef}>
        <div className="nav-indicator" ref={navIndicatorRef}></div>
        <a href="#home" className={`${activeSection === 'home' ? 'active-link' : ''} ${indicatedSection === 'home' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'home')} onMouseEnter={(e) => handleNavHover(e, 'home')} onMouseLeave={handleNavLeave}>
          <i className="fa-solid fa-house"></i> <span>Home</span>
        </a>
        <a href="#about" className={`${activeSection === 'about' ? 'active-link' : ''} ${indicatedSection === 'about' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'about')} onMouseEnter={(e) => handleNavHover(e, 'about')} onMouseLeave={handleNavLeave}>
          <i className="fa-solid fa-user"></i> <span>About</span>
        </a>
        <a href="#portfolio" className={`${activeSection === 'portfolio' ? 'active-link' : ''} ${indicatedSection === 'portfolio' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'portfolio')} onMouseEnter={(e) => handleNavHover(e, 'portfolio')} onMouseLeave={handleNavLeave}>
          <i className="fa-solid fa-briefcase"></i> <span>Portfolio</span>
        </a>
        <a href="#services" className={`${activeSection === 'services' ? 'active-link' : ''} ${indicatedSection === 'services' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'services')} onMouseEnter={(e) => handleNavHover(e, 'services')} onMouseLeave={handleNavLeave}>
          <i className="fa-solid fa-bolt"></i> <span>Services</span>
        </a>
        <a href="#contact" className={`${activeSection === 'contact' ? 'active-link' : ''} ${indicatedSection === 'contact' ? 'is-indicated' : ''}`} onClick={(e) => handleNavClick(e, 'contact')} onMouseEnter={(e) => handleNavHover(e, 'contact')} onMouseLeave={handleNavLeave}>
          <i className="fa-solid fa-envelope"></i> <span>Contact</span>
        </a>
      </nav>

      <header className="minimal-header">
        <a href="#home" className="logo" onClick={(e) => handleNavClick(e, 'home')}>
          <img src="https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png" alt="Voltz Digital" />
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
              to <span className="highlight">design, build,</span> and<br />
              <span className="highlight">scale</span> your brand.
            </h1>
            <div className="hero-action-row fade-up delay-1">
              <div className="action-text">
                <h3>See Platform in action</h3>
                <p>Join our guided tour and explore<br />all features live.</p>
              </div>
              <div className="action-line"></div>
              <a href="#contact" className="btn-primary-action" onClick={(e) => handleNavClick(e, 'contact')}>
                <i className="fa-regular fa-calendar"></i> Book a Demo
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

        {/* About Section */}
        <section id="about" className="minimal-section">
          <div className="container">
            <div className="section-header fade-up">
              <h2>About Voltz Digital</h2>
              <p>We build lightning-fast, high-converting websites for businesses that want to scale.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '60px', alignItems: 'center' }}>
              <div className="fade-up delay-1">
                <h3 style={{ fontSize: '2.5rem', fontWeight: 500, marginBottom: '20px', letterSpacing: '-0.04em' }}>Our Mission</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '20px', fontSize: '1.1rem' }}>
                  At Voltz Digital, we believe that every business deserves a world-class online presence without the months of waiting and exorbitant agency fees.
                </p>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '30px', fontSize: '1.1rem' }}>
                  Based in Kingston, Jamaica, we follow a general blueprint of a two-week turnaround for most projects. Depending on the complexity of your requirements, production typically takes between one to two weeks, with simpler websites often delivered in under a week.
                </p>
                <div style={{ display: 'flex', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: 500 }}>50+</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Projects Delivered</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: 500 }}>1-2 Weeks</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Average Turnaround</div>
                  </div>
                </div>
              </div>
              <div className="fade-up delay-2" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Our Team" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} referrerPolicy="no-referrer" />
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
                    <img src={item.img} alt={item.title} className="portfolio-img" referrerPolicy="no-referrer" />
                    <div className="portfolio-overlay">
                      <i className="fa-solid fa-play"></i>
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
                <i className="fa-solid fa-bolt"></i>
                <h3>Website Design</h3>
                <p>Modern, mobile-responsive websites that get you customers and look great on any device. We focus on conversion-driven design.</p>
              </div>
              <div className="minimal-card fade-up delay-2">
                <i className="fa-solid fa-bullseye"></i>
                <h3>SEO Optimization</h3>
                <p>Get found on Google and dominate your local market with our proven SEO strategies. Built into the code from day one.</p>
              </div>
              <div className="minimal-card fade-up delay-3">
                <i className="fa-solid fa-shield-halved"></i>
                <h3>Website Maintenance</h3>
                <p>Keep your site fast, secure, and always online with our reliable maintenance plans. We handle the technical details.</p>
              </div>
              <div className="minimal-card fade-up delay-1">
                <i className="fa-solid fa-cart-shopping"></i>
                <h3>E-commerce</h3>
                <p>Start selling online with custom online stores built for high conversion rates and seamless checkout experiences.</p>
              </div>
              <div className="minimal-card fade-up delay-2">
                <i className="fa-solid fa-pen-nib"></i>
                <h3>Copywriting</h3>
                <p>Persuasive, SEO-optimized content that speaks directly to your target audience and drives them to take action.</p>
              </div>
              <div className="minimal-card fade-up delay-3">
                <i className="fa-solid fa-chart-line"></i>
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
                      <div className="stars">
                        <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                      </div>
                      <p>{t.text}</p>
                      <div className="testimonial-author">
                        <img src={`https://i.pravatar.cc/150?img=${t.img}`} alt={t.name} referrerPolicy="no-referrer" />
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
                { name: 'Bronze', price: '$350', desc: 'Perfect for small local businesses', features: ['Custom 3-Page Website', 'Mobile Responsive', 'Basic SEO Setup', 'Contact Form'] },
                { name: 'Silver', price: '$599', desc: 'Great for growing service companies', popular: true, features: ['Custom 5-Page Website', 'Advanced SEO Optimization', 'Booking/Lead Integration', '1 Month Free Maintenance'] },
                { name: 'Gold', price: '$1,199', desc: 'Full e-commerce & advanced features', features: ['Full E-commerce Store', 'Payment Gateway Setup', 'Product Uploads (Up to 50)', 'Premium Support'] }
              ].map((p, i) => (
                <div key={i} className={`minimal-card pricing-card ${p.popular ? 'popular' : ''} fade-up delay-${i + 1}`}>
                  {p.popular && <div className="popular-badge">MOST POPULAR</div>}
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <div className="pricing-price" style={p.popular ? { color: 'var(--primary)' } : {}}>{p.price}</div>
                  <ul className="pricing-features">
                    {p.features.map((f, j) => (
                      <li key={j}><i className="fa-solid fa-check"></i> {f}</li>
                    ))}
                  </ul>
                  <button onClick={() => handleCheckout(p.name)} className={p.popular ? "btn-primary-action btn-block" : "btn-outline btn-block"}>
                    Get Started
                  </button>
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
                    <i className="fa-solid fa-chevron-down"></i>
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
              <h2>Let's Build Something.</h2>
              <p>Ready to upgrade your online presence? Drop us a line and let's get started.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1.5fr' : '1fr', gap: '60px' }}>
              <div className="fade-up delay-1">
                <h3 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '30px', letterSpacing: '-0.02em' }}>Get in Touch</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}>
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontWeight: 500 }}>Email Us</h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>hello@voltzdigital.com</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}>
                      <i className="fa-brands fa-whatsapp"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontWeight: 500 }}>WhatsApp</h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>+1 (876) XXX-XXXX</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}>
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontWeight: 500 }}>Location</h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Kingston, Jamaica</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="minimal-card fade-up delay-2">
                <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="minimal-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" className="form-control" required placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" className="form-control" required placeholder="john@example.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="service">Service Needed</label>
                    <select id="service" name="service" className="form-control" required defaultValue="" style={{ appearance: 'none', backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=%22white%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>')", backgroundRepeat: 'no-repeat', backgroundPositionX: '95%', backgroundPositionY: '50%' }}>
                      <option value="" disabled style={{ color: '#000' }}>Select a service</option>
                      <option value="website" style={{ color: '#000' }}>Website Design</option>
                      <option value="ecommerce" style={{ color: '#000' }}>E-commerce Store</option>
                      <option value="seo" style={{ color: '#000' }}>SEO Optimization</option>
                      <option value="other" style={{ color: '#000' }}>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Project Details</label>
                    <textarea id="message" name="message" className="form-control" required placeholder="Tell us about your business and what you're looking to build..."></textarea>
                  </div>
                  <button type="submit" className="btn-primary-action btn-block" style={{ justifyContent: 'center', width: '100%', fontSize: '1.1rem' }}>
                    Send Message <i className="fa-solid fa-paper-plane" style={{ marginLeft: '10px' }}></i>
                  </button>
                </form>
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
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="video-container">
              <iframe 
                src={`${selectedVideo}?autoplay=1`}
                title="Project Presentation"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <footer className="minimal-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <img src="https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png" alt="Voltz Digital" style={{ height: '180px', marginBottom: '20px', borderRadius: '8px' }} />
            <p>Lightning-Fast Websites for Growing Businesses. You innovate, we automate.</p>
            <div className="social-icons">
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              <li><a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a></li>
              <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a></li>
              <li><a href="#portfolio" onClick={(e) => handleNavClick(e, 'portfolio')}>Portfolio</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, 'services')}>Services</a></li>
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
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </div>
  );
}
