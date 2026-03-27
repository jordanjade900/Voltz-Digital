// Particle Background Animation
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles(); // Re-init particles on resize to maintain density
    }

    window.addEventListener('resize', resize);
    
    // Small delay to ensure initial sizing is correct
    setTimeout(resize, 50);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Varying sizes for depth of field effect
            this.z = Math.random() * 3 + 0.5; 
            this.size = this.z;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            // Opacity based on size (closer = brighter)
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
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Adjust particle count based on screen size
        const particleCount = Math.floor((width * height) / 12000); 
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw connections
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // Connect nearby particles to create a mesh/network effect
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance/120)})`;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

// Menu Toggle Logic
const menuToggle = document.querySelector('.menu-toggle');
const navOverlay = document.querySelector('.nav-overlay');

if (menuToggle && navOverlay) {
    menuToggle.addEventListener('click', () => {
        navOverlay.classList.toggle('active');
        // Animate hamburger to X
        const lines = menuToggle.querySelectorAll('.hamburger-line');
        if (navOverlay.classList.contains('active')) {
            lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            lines[1].style.width = '30px'; // reset width
        } else {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
            lines[1].style.width = '20px';
        }
    });
}

// Scroll Animations (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.05 // Trigger when 5% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Optional: Stop observing once it has animated in
            // observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

// Select all elements with the fade-up class
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-up');
    animatedElements.forEach(el => observer.observe(el));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initScrollAnimations, 100);
    });
} else {
    setTimeout(initScrollAnimations, 100);
}

// Scroll to Top Logic
const scrollToTopBtn = document.querySelector('.scroll-to-top');

if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Portfolio Filtering Logic
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

if (filterBtns.length > 0 && portfolioCards.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioCards.forEach(card => {
                // Reset animation classes for smooth re-entry
                card.classList.remove('in-view');
                
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                    // Small timeout to allow display:flex to apply before adding in-view class back
                    setTimeout(() => {
                        card.classList.add('in-view');
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Testimonial Slider Logic
const track = document.querySelector('.testimonials-track');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
const slideCount = document.querySelectorAll('.testimonial-slide').length;
let autoSlideInterval;

function updateSlider(index) {
    if (!track) return;
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    
    // Update dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    let next = (currentSlide + 1) % slideCount;
    updateSlider(next);
}

function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

if (track && dots.length > 0) {
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            updateSlider(index);
            startAutoSlide(); // Reset timer on manual click
        });
    });

    // Pause on hover
    const sliderContainer = document.querySelector('.testimonials-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }

    startAutoSlide();
}

// FAQ Accordion Logic
const faqItems = document.querySelectorAll('.faq-item');

if (faqItems.length > 0) {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherAnswer.style.maxHeight = null;
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
}
