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
    initAdminTrigger(); // 관리자 트리거 초기화
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
    
    if (!heroVideo) return;
    
    let videoState = {
        hasMetadata: false,
        hasData: false,
        hasError: false,
        loadStartTime: null,
        timeoutId: null,
        allSourcesTried: false
    };
    
    // 타임아웃 클리어 함수
    function clearLoadTimeout() {
        if (videoState.timeoutId) {
            clearTimeout(videoState.timeoutId);
            videoState.timeoutId = null;
        }
    }
    
    // 영상 로딩 시작 (각 소스마다 발생)
    heroVideo.addEventListener('loadstart', () => {
        console.log('영상 로딩 시작, readyState:', heroVideo.readyState);
        videoState.loadStartTime = Date.now();
        videoState.hasMetadata = false;
        videoState.hasData = false;
        videoState.hasError = false;
        
        clearLoadTimeout();
    });

    // 메타데이터 로드 완료
    heroVideo.addEventListener('loadedmetadata', () => {
        console.log('영상 메타데이터 로딩 완료, readyState:', heroVideo.readyState);
        videoState.hasMetadata = true;
        clearLoadTimeout();
    });

    // 영상 데이터 로드 완료
    heroVideo.addEventListener('loadeddata', () => {
        console.log('영상 데이터 로딩 완료, readyState:', heroVideo.readyState);
        videoState.hasData = true;
        clearLoadTimeout();
        // 자동 재생 시도
        safePlayHeroVideo(heroVideo);
    });

    // 영상 재생 가능
    heroVideo.addEventListener('canplay', () => {
        console.log('영상 재생 가능, readyState:', heroVideo.readyState);
        videoState.hasData = true;
        clearLoadTimeout();
    });

    // 영상 버퍼링 완료
    heroVideo.addEventListener('canplaythrough', () => {
        console.log('영상 버퍼링 완료, readyState:', heroVideo.readyState);
        videoState.hasData = true;
        clearLoadTimeout();
    });

    // 영상 로딩 오류
    heroVideo.addEventListener('error', (e) => {
        const error = heroVideo.error;
        const sources = heroVideo.querySelectorAll('source');
        const currentSrc = heroVideo.currentSrc;
        
        if (error) {
            // 에러 코드:
            // 1: MEDIA_ERR_ABORTED - 사용자가 중단
            // 2: MEDIA_ERR_NETWORK - 네트워크 오류 (404 포함)
            // 3: MEDIA_ERR_DECODE - 디코딩 오류
            // 4: MEDIA_ERR_SRC_NOT_SUPPORTED - 소스 미지원
            console.warn('영상 로딩 오류 - 코드:', error.code, '메시지:', error.message, '시도한 경로:', currentSrc);
            
            // 네트워크 오류(404 등)이고 아직 시도하지 않은 소스가 있으면 다음 소스 시도
            if (error.code === 2 && sources.length > 1) {
                // 현재 실패한 소스 찾기
                let currentIndex = -1;
                sources.forEach((source, index) => {
                    const sourceSrc = source.src || source.getAttribute('src');
                    if (currentSrc && (currentSrc === sourceSrc || currentSrc.includes(sourceSrc.split('/').pop()))) {
                        currentIndex = index;
                    }
                });
                
                // 다음 소스가 있으면 브라우저가 자동으로 시도하므로 대기
                if (currentIndex >= 0 && currentIndex < sources.length - 1) {
                    console.log(`소스 ${currentIndex + 1} 실패 (404), 다음 소스 시도 중...`);
                    videoState.hasError = false; // 다음 소스 시도 가능
                    return;
                }
            }
        } else {
            console.warn('영상 로딩 오류:', e);
        }
        
        // 모든 소스가 실패한 경우
        videoState.hasError = true;
        clearLoadTimeout();
        
        // 약간의 지연 후 확인 (브라우저가 다음 소스를 시도할 시간 제공)
        setTimeout(() => {
            if (heroVideo.networkState === 3 || heroVideo.error) {
                console.log('모든 영상 소스 실패, 대체 이미지 표시');
                showVideoFallback();
            }
        }, 2000);
    });

    // 로컬 영상 실패 확인 (로컬 영상만 사용하므로 단순화)
    function checkAllSourcesFailed() {
        // 로컬 영상만 사용하므로 networkState가 NO_SOURCE이면 즉시 실패 처리
        if (heroVideo.networkState === 3) {
            console.log('로컬 영상 소스 실패 (networkState: NO_SOURCE), 대체 이미지 표시');
            videoState.allSourcesTried = true;
            showVideoFallback();
            return;
        }
        
        // currentSrc가 없거나 로컬 영상 경로가 아니면 실패
        const currentSrc = heroVideo.currentSrc;
        if (!currentSrc || !currentSrc.includes('hero-video.mp4')) {
            console.log('로컬 영상 로드 실패, 대체 이미지 표시');
            videoState.allSourcesTried = true;
            showVideoFallback();
        }
    }

    // 타임아웃 체크 함수 (더 정확한 조건)
    function checkLoadTimeout() {
        // 이미 로드되었거나 에러가 발생한 경우 체크 불필요
        if (videoState.hasData || videoState.hasError || videoState.allSourcesTried) {
            return;
        }
        
        // 로딩이 시작되지 않았으면 체크하지 않음
        if (!videoState.loadStartTime) {
            return;
        }
        
        // 로딩 시작 후 경과 시간
        const elapsed = Date.now() - videoState.loadStartTime;
        
        // readyState 체크
        // 0: HAVE_NOTHING - 아직 로드되지 않음
        // 1: HAVE_METADATA - 메타데이터만 로드됨 (preload="metadata"인 경우 정상)
        // 2 이상: 데이터 로드됨
        
        // preload="metadata"인 경우, 메타데이터만 로드되어도 readyState가 1이 됩니다.
        // 따라서 readyState === 0인 경우만 타임아웃으로 간주합니다.
        
        if (heroVideo.readyState === 0 && elapsed > 15000) {
            // 15초 후에도 readyState가 0이면 타임아웃
            console.warn('영상 로딩 시간 초과 (15초), 모든 소스 실패 확인');
            checkAllSourcesFailed();
        } else if (heroVideo.readyState >= 1) {
            // 메타데이터 이상 로드되었으면 정상
            videoState.hasMetadata = true;
        }
    }

    // 페이지 로드 후 초기 상태 확인
    function checkInitialState() {
        // 현재 readyState 확인
        console.log('초기 영상 상태 - readyState:', heroVideo.readyState, 'currentSrc:', heroVideo.currentSrc, 'networkState:', heroVideo.networkState);
        
        // networkState 체크
        // 0: EMPTY - 아직 초기화되지 않음
        // 1: IDLE - 리소스 선택 중
        // 2: LOADING - 데이터 로딩 중
        // 3: NO_SOURCE - 소스를 찾을 수 없음
        
        // networkState가 3이고 readyState가 0이면 모든 소스 실패
        if (heroVideo.networkState === 3 && heroVideo.readyState === 0) {
            // NO_SOURCE - 로컬 영상 실패
            console.warn('로컬 영상 소스를 찾을 수 없음 (404 또는 파일 없음), 대체 이미지 표시');
            console.warn('시도한 경로:', heroVideo.currentSrc || '없음');
            videoState.hasError = true;
            videoState.allSourcesTried = true;
            showVideoFallback();
            return;
        }
        
        if (heroVideo.readyState >= 2) {
            // HAVE_CURRENT_DATA 이상이면 이미 로드됨
            console.log('영상 이미 로드됨, 재생 시도');
            videoState.hasData = true;
            safePlayHeroVideo(heroVideo);
        } else if (heroVideo.readyState === 1) {
            // HAVE_METADATA면 메타데이터만 로드됨 (정상)
            console.log('영상 메타데이터 로드됨, 데이터 로딩 대기');
            videoState.hasMetadata = true;
            // preload="auto"인 경우, 실제 데이터도 로드됨
            // 추가 대기 후 재생 시도
            setTimeout(() => {
                if (heroVideo.readyState >= 2) {
                    videoState.hasData = true;
                    safePlayHeroVideo(heroVideo);
                }
            }, 1000);
        } else if (heroVideo.readyState === 0) {
            // HAVE_NOTHING - 아직 로드되지 않음
            console.log('영상 아직 로드되지 않음, 로딩 대기...');
            
            // 로딩 시작 시간 기록
            if (!videoState.loadStartTime) {
                videoState.loadStartTime = Date.now();
            }
            
            // networkState가 IDLE이면 강제로 로드 시도
            if (heroVideo.networkState === 1) {
                console.log('영상 강제 로드 시도');
                try {
                    heroVideo.load();
                } catch (e) {
                    console.warn('영상 로드 시도 실패:', e);
                }
            }
            
            // 5초 후 재확인
            videoState.timeoutId = setTimeout(() => {
                if (heroVideo.readyState === 0 && !videoState.hasMetadata && !videoState.hasData) {
                    // networkState 재확인
                    if (heroVideo.networkState === 3) {
                        // NO_SOURCE - 로컬 영상 실패
                        console.warn('로컬 영상 로딩 시간 초과 (5초), 대체 이미지 표시');
                        showVideoFallback();
                    } else if (heroVideo.networkState === 1 || heroVideo.networkState === 2) {
                        // IDLE 또는 LOADING - 아직 로딩 중
                        console.log('로컬 영상 아직 로딩 중, 추가 대기...');
                        // 5초 더 대기
                        videoState.timeoutId = setTimeout(() => {
                            if (heroVideo.readyState === 0 && !videoState.hasMetadata && !videoState.hasData) {
                                console.warn('로컬 영상 로딩 시간 초과 (총 10초), 대체 이미지 표시');
                                showVideoFallback();
                            }
                        }, 5000);
                    } else {
                        // 기타 상태
                        console.warn('로컬 영상 로딩 시간 초과 (5초), 대체 이미지 표시');
                        showVideoFallback();
                    }
                }
            }, 5000);
        }
        
        // 에러 상태 확인
        if (heroVideo.error) {
            const error = heroVideo.error;
            console.warn('영상 에러 감지 - 코드:', error.code, '메시지:', error.message);
            videoState.hasError = true;
            checkAllSourcesFailed();
        }
    }

    // DOMContentLoaded 또는 load 이벤트에서 초기 상태 확인
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(checkInitialState, 1000);
        });
    } else {
        // 이미 로드된 경우
        setTimeout(checkInitialState, 1000);
    }

    // 뷰포트에 있을 때만 재생하여 대역폭 절약
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 뷰포트에 들어오면 재생 시도
                if (videoState.hasData || heroVideo.readyState >= 2) {
                    safePlayHeroVideo(heroVideo);
                } else if (heroVideo.readyState === 1) {
                    // 메타데이터만 로드된 경우, 실제 데이터 로드 시작
                    console.log('뷰포트 진입, 영상 데이터 로드 시작');
                    heroVideo.load();
                } else if (heroVideo.readyState === 0) {
                    // 아직 로드되지 않은 경우, 강제 로드
                    console.log('뷰포트 진입, 영상 강제 로드');
                    heroVideo.load();
                }
            } else {
                heroVideo.pause();
            }
        });
    }, { threshold: 0.1 }); // threshold를 낮춰서 더 빨리 감지

    observer.observe(heroVideo);
    
    // 추가: 영상이 로드되면 즉시 재생 시도
    heroVideo.addEventListener('loadeddata', () => {
        if (heroVideo.readyState >= 2) {
            // 뷰포트에 있는지 확인
            const rect = heroVideo.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                safePlayHeroVideo(heroVideo);
            }
        }
    });
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
        // 영상 숨기기
        heroVideo.style.display = 'none';
        heroVideo.pause();
        
        // 대체 이미지 표시
        const fallback = heroVideo.parentElement.querySelector('.video-fallback');
        if (fallback) {
            fallback.style.display = 'flex';
            fallback.setAttribute('aria-hidden', 'false');
        }
        
        console.log('대체 이미지가 표시되었습니다.');
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
// contact.js가 있으면 contact.js를 사용하고, 없으면 기본 동작 수행
function initContactForm() {
    // contact.js가 로드되어 있으면 중복 처리 방지
    if (typeof handleContactForm !== 'undefined') {
        return;
    }
    
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> 전송 중...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            showNotification('문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Reset button
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }, 2000);
    });
}

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
    
    // Add styles - 중앙 정렬
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 20px 32px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 500px;
        min-width: 300px;
        text-align: center;
        font-size: 16px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in - 중앙에서 나타남
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
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
    if (!adminTrigger) {
        console.warn('⚠️ adminTrigger 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('✅ 관리자 트리거 초기화 완료');
    
    // 스타일 추가 (클릭 가능하도록)
    adminTrigger.style.cursor = 'pointer';
    adminTrigger.style.userSelect = 'none';
    adminTrigger.style.transition = 'all 0.3s ease';
    adminTrigger.title = '관리자 모드 진입 (5번 클릭)';
    
    let clickCount = 0;
    let clickTimer = null;
    const requiredClicks = 5; // 5번 연타
    const timeWindow = 2000; // 2초 내에
    
    adminTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        clickCount++;
        
        console.log(`관리자 트리거 클릭: ${clickCount}/${requiredClicks}`);
        
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
            console.log('✅ 관리자 모드 진입 트리거 활성화');
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
            console.log('관리자 트리거 클릭 카운트 리셋');
            clickCount = 0;
        }, timeWindow);
    });
    
    // 마우스 오버 효과
    adminTrigger.addEventListener('mouseenter', function() {
        this.style.opacity = '0.7';
    });
    
    adminTrigger.addEventListener('mouseleave', function() {
        this.style.opacity = '1';
    });
}