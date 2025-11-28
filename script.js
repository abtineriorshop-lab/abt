// Modern Interior Design Website JavaScript

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const collectionCards = document.querySelectorAll('.collection-card');
const contactForm = document.querySelector('.modern-form');

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initHeroVideo();
    initScrollAnimations();
    initGalleryFilter();
    initCollectionCards();
    initContactForm();
    initSmoothScrolling();
    initParallaxEffects();
    initNavbarScroll();
    initMediaOptimization();
});

// Navigation Functions
function initNavigation() {
    // Mobile Navigation Toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
            hamburger.setAttribute('aria-label', isActive ? '메뉴 닫기' : '메뉴 열기');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', '메뉴 열기');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', '메뉴 열기');
        }
    });
}

// Hero Video Functions
function initHeroVideo() {
    const heroVideo = document.getElementById('hero-video');
    
    if (heroVideo) {
        // 영상 로딩 상태 확인
        heroVideo.addEventListener('loadstart', () => {
            console.log('영상 로딩 시작');
        });

        heroVideo.addEventListener('loadeddata', () => {
            console.log('영상 데이터 로딩 완료');
            // 자동 재생 시도
            safePlayHeroVideo(heroVideo);
        });

        heroVideo.addEventListener('error', (e) => {
            console.log('영상 로딩 오류:', e);
            // 영상 로딩 실패 시 대체 이미지 표시
            showVideoFallback();
        });

        // 영상이 로드되지 않은 경우 대체 이미지 표시
        setTimeout(() => {
            if (heroVideo.readyState === 0) {
                console.log('영상 로딩 시간 초과, 대체 이미지 표시');
                showVideoFallback();
            }
        }, 5000);

        // 뷰포트에 있을 때만 재생하여 대역폭 절약
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    safePlayHeroVideo(heroVideo);
                } else {
                    heroVideo.pause();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(heroVideo);
    }
}

function safePlayHeroVideo(videoElement) {
    if (!videoElement) return;
    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(error => {
            if (error.name === 'AbortError') {
                // 교차 관찰에 의해 발생할 수 있는 자연스러운 중단이므로 무시
                return;
            }
            if (error.name === 'NotAllowedError') {
                showVideoPlayButton();
                return;
            }
            console.warn('영상 재생 실패:', error);
            showVideoPlayButton();
        });
    }
}

// 영상 재생 버튼 표시
function showVideoPlayButton() {
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        const playButton = document.createElement('div');
        playButton.className = 'video-play-button';
        playButton.innerHTML = '<i class="fas fa-play"></i>';
        playButton.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: rgba(212, 175, 55, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
        `;
        
        playButton.addEventListener('click', () => {
            heroVideo.play();
            playButton.remove();
        });
        
        playButton.addEventListener('mouseenter', () => {
            playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
        
        playButton.addEventListener('mouseleave', () => {
            playButton.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        heroVideo.parentElement.appendChild(playButton);
    }
}

// 대체 이미지 표시
function showVideoFallback() {
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.style.display = 'none';
        const fallback = heroVideo.parentElement.querySelector('.video-fallback');
        if (fallback) {
            fallback.style.display = 'flex';
        }
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-item, .collection-card, .gallery-item, .contact-card');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Stagger animation for multiple elements
    const staggerElements = document.querySelectorAll('.collection-card, .gallery-item');
    staggerElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
}

// Gallery Filter Functions
function initGalleryFilter() {
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            galleryItems.forEach((item, index) => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'none';
                    // Force reflow
                    item.offsetHeight;
                    item.style.animation = `fadeIn 0.6s ease ${index * 0.1}s both`;
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Collection Cards Functions
function initCollectionCards() {
    collectionCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });

        // Add click handler for collection cards
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            showCollectionModal(category);
        });
    });
}

function showCollectionModal(category) {
    const modal = document.createElement('div');
    modal.className = 'collection-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${category.toUpperCase()} Collection</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-image">
                    <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80" alt="${category} Collection">
                </div>
                <div class="modal-info">
                    <p>Discover our curated collection of premium ${category} solutions. Each piece is carefully selected for its quality, design, and functionality.</p>
                    <div class="modal-actions">
                        <a href="#" class="btn btn-primary">View Products</a>
                        <a href="#contact" class="btn btn-secondary">Get Quote</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 24px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.8);
        transition: transform 0.3s ease;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
    `;
    
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    modalBackdrop.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 100);
    
    // Close modal handlers
    const closeModal = () => {
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Contact Form Functions
function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Reset button
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }, 2000);
    });

    // Add floating label effect
    const formInputs = contactForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
    navLinks.forEach(link => {
        const targetId = link.getAttribute('href');
        const isAnchorLink = targetId && targetId.startsWith('#');

        if (!isAnchorLink) return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax Effects
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-video, .image-grid');
        
        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Navbar Scroll Effects
function initNavbarScroll() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add background on scroll
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(250, 250, 250, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(250, 250, 250, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Lazy-load fallback for legacy markup
function initMediaOptimization() {
    const lazyImages = document.querySelectorAll('img:not([loading])');
    lazyImages.forEach(img => img.setAttribute('loading', 'lazy'));
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Gallery Item Click Handler
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        const overlay = item.querySelector('.gallery-overlay');
        const category = item.querySelector('.gallery-category').textContent;
        const title = item.querySelector('h4').textContent;
        const description = item.querySelector('p').textContent;
        
        showGalleryModal(category, title, description);
    });
});

function showGalleryModal(category, title, description) {
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-category">${category}</div>
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-image">
                    <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80" alt="${title}">
                </div>
                <div class="modal-info">
                    <p>${description}</p>
                    <div class="modal-actions">
                        <a href="#contact" class="btn btn-primary">Start Your Project</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 24px;
        max-width: 900px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.8);
        transition: transform 0.3s ease;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
    `;
    
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    modalBackdrop.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 100);
    
    // Close modal handlers
    const closeModal = () => {
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Add CSS for additional styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 32px 32px 0;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 24px;
    }
    
    .modal-category {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--accent-gold);
        margin-bottom: 8px;
    }
    
    .modal-header h3 {
        font-size: 24px;
        font-weight: 600;
        color: var(--primary-black);
        margin: 0;
        flex: 1;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        transition: color 0.3s ease;
        padding: 8px;
        border-radius: 8px;
    }
    
    .modal-close:hover {
        color: var(--primary-black);
        background: #f5f5f5;
    }
    
    .modal-body {
        padding: 0 32px 32px;
    }
    
    .modal-image {
        margin-bottom: 24px;
        border-radius: 16px;
        overflow: hidden;
    }
    
    .modal-image img {
        width: 100%;
        height: 300px;
        object-fit: cover;
    }
    
    .modal-info p {
        color: var(--text-light);
        line-height: 1.7;
        margin-bottom: 24px;
        font-size: 16px;
    }
    
    .modal-actions {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
    }
    
    .form-group.focused input,
    .form-group.focused textarea,
    .form-group.focused select {
        border-color: var(--accent-gold);
        box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
    }
    
    @keyframes fadeIn {
        from { 
            opacity: 0; 
            transform: translateY(20px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }
    
    .navbar {
        transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
    }
`;
document.head.appendChild(additionalStyles);

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(() => {
    const scrolled = window.pageYOffset;
    const navbar = document.querySelector('.navbar');
    
    if (scrolled > 100) {
        navbar.style.background = 'rgba(250, 250, 250, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(250, 250, 250, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}, 10);

// Performance optimization
window.addEventListener('scroll', optimizedScrollHandler);

// Preload critical images
function preloadImages() {
    const imageUrls = [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Initialize preloading
preloadImages();

// Admin Trigger Function
function initAdminTrigger() {
    const adminTrigger = document.getElementById('adminTrigger');
    if (!adminTrigger) return;
    
    let clickCount = 0;
    let clickTimer = null;
    const requiredClicks = 5; // 5번 연타
    const timeWindow = 2000; // 2초 내에
    
    adminTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        clickCount++;
        
        // 클릭 애니메이션 효과
        this.style.transform = 'scale(0.8)';
        setTimeout(() => {
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        }, 100);
        
        // 기존 타이머 클리어
        if (clickTimer) {
            clearTimeout(clickTimer);
        }
        
        // 클릭 수가 충족되면 관리자 페이지로 이동
        if (clickCount >= requiredClicks) {
            // 성공 애니메이션
            this.style.color = '#d4af37';
            this.style.textShadow = '0 0 20px rgba(212, 175, 55, 0.8)';
            
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 500);
            
            clickCount = 0;
            return;
        }
        
        // 시간 윈도우 설정
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, timeWindow);
    });
    
}

// Initialize admin trigger when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAdminTrigger();
});