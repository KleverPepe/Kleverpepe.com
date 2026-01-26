// KleverPEPE Website - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initHeaderScroll();
    initMobileMenu();
    initSmoothScroll();
    initAnimations();
    initPriceFetcher();
    
    // Initialize tokenomics fetcher
    if (typeof KleverPepeTokenomics !== 'undefined') {
        KleverPepeTokenomics.updateDisplay();
    }
});

// Header scroll effect
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');
    
    if (!menuBtn || !nav) return;
    
    menuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        
        // Animate hamburger
        const spans = menuBtn.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.style.transition = 'all 0.3s ease';
        });
    });
    
    // Close menu when clicking a link
    const links = nav.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
        });
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll animations using Intersection Observer
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.tokenomic-card, .roadmap-item, .game-card, .trading-card, .feature, .social-link'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add animation class
document.addEventListener('scroll', () => {
    const animatedElements = document.querySelectorAll('.animate-in');
    animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
});

// Copy contract address
function copyAddress() {
    const address = document.getElementById('contractAddress');
    if (!address) return;
    
    const text = address.textContent || address.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const btn = document.querySelector('.copy-btn');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E676" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            `;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

// Make copyAddress globally available
window.copyAddress = copyAddress;

// Price fetcher (optional - using LiveCoinWatch widget)
function initPriceFetcher() {
    // The LiveCoinWatch widget handles price display
    // This is for additional price manipulation if needed
    const priceValue = document.getElementById('priceValue');
    const priceChange = document.getElementById('priceChange');
    
    if (priceValue && priceChange) {
        // Add pulse animation to price
        setInterval(() => {
            priceValue.style.transform = 'scale(1.02)';
            setTimeout(() => {
                priceValue.style.transform = 'scale(1)';
            }, 200);
        }, 5000);
    }
}

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Add loading state management
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Trigger chart animations
    const chartBars = document.querySelectorAll('.chart-fill');
    chartBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
});

// Console branding
console.log('%c🦕 KleverPEPE', 'font-size: 32px; font-weight: bold; color: #2ECC71;');
console.log('%cBlockchain Revolution', 'font-size: 16px; color: #9B59B6;');
console.log('%cJoin the community: https://t.me/KleverPEPE', 'font-size: 12px; color: #B0B0C0;');

// FAQ Toggle Function
function toggleFaq(element) {
    const answer = element.querySelector('.faq-answer');
    const icon = element.querySelector('.faq-icon');
    
    if (answer.style.display === 'none') {
        answer.style.display = 'block';
        icon.textContent = '−';
    } else {
        answer.style.display = 'none';
        icon.textContent = '+';
    }
}

// Make it globally available
window.toggleFaq = toggleFaq;
