// Product Detail Page JavaScript

let currentProduct = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Load product data from URL parameters
    await loadProductFromURL();
    
    // Initialize product detail functionality
    initProductDetail();
});

// Load product data from URL parameters
async function loadProductFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const category = urlParams.get('category');
    
    if (!productId || !category) {
        showError('제품 정보가 없습니다.');
        return;
    }
    
    try {
        // CORS 오류 체크
        if (window.location.protocol === 'file:') {
            showError('로컬 서버를 실행해주세요. 파일을 직접 열면 데이터를 불러올 수 없습니다.<br><br>해결 방법:<br>1. 터미널에서 프로젝트 폴더로 이동<br>2. Python 설치 시: <code>python -m http.server 8000</code><br>3. Node.js 설치 시: <code>npx http-server</code><br>4. 브라우저에서 <code>http://localhost:8000</code> 접속');
            return;
        }
        
        const response = await fetch('data/products.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('제품 데이터를 불러오지 못했습니다.');
        
        const data = await response.json();
        const products = data.categories[category] || [];
        currentProduct = products.find(p => p.id === productId);
        
        if (!currentProduct) {
            showError('제품을 찾을 수 없습니다.');
            return;
        }
        
        // Render product details
        renderProductDetails(currentProduct);
    } catch (error) {
        console.error('제품 로드 오류:', error);
        if (error.message.includes('fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
            showError('로컬 서버를 실행해주세요. 파일을 직접 열면 데이터를 불러올 수 없습니다.<br><br>해결 방법:<br>1. 터미널에서 프로젝트 폴더로 이동<br>2. Python 설치 시: <code>python -m http.server 8000</code><br>3. Node.js 설치 시: <code>npx http-server</code><br>4. 브라우저에서 <code>http://localhost:8000</code> 접속');
        } else {
            showError('제품 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }
}

// Render product details
function renderProductDetails(product) {
    // Update page title
    document.title = `${product.name} - 밝은내일 인테리어샵`;
    
    // Update breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb-nav');
    if (breadcrumb) {
        const categoryName = getCategoryDisplayName(product.category);
        breadcrumb.innerHTML = `
            <a href="index.html">홈</a>
            <span class="separator">></span>
            <a href="products-${product.category}.html">${categoryName}</a>
            <span class="separator">></span>
            <span class="current">${product.name}</span>
        `;
    }
    
    // Update product title
    const productTitle = document.querySelector('.product-title');
    if (productTitle) {
        productTitle.textContent = product.name;
    }
    
    // Update product price
    const currentPrice = document.querySelector('.current-price');
    if (currentPrice) {
        currentPrice.textContent = `₩${product.price.toLocaleString()}`;
    }
    
    // Update product description
    const productDescription = document.querySelector('.product-description p');
    if (productDescription) {
        productDescription.textContent = product.description || product.shortDescription || '';
    }
    
    // Update product images
    const mainImage = document.querySelector('.main-image .image-placeholder');
    if (mainImage && product.image) {
        mainImage.innerHTML = `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }
    
    // Update thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail-images .thumbnail');
    const images = product.images || [product.image];
    thumbnails.forEach((thumb, index) => {
        if (images[index]) {
            const placeholder = thumb.querySelector('.image-placeholder');
            if (placeholder) {
                placeholder.innerHTML = `<img src="${images[index]}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
        }
    });
    
    // Update product specs
    const specsTable = document.querySelector('.specs-table');
    if (specsTable && product.specs) {
        specsTable.innerHTML = Object.entries(product.specs).map(([key, value]) => `
            <div class="spec-row">
                <span class="spec-label">${key}</span>
                <span class="spec-value">${value}</span>
            </div>
        `).join('');
    }
    
    // Update product features
    const detailText = document.querySelector('.detail-text');
    if (detailText && product.features) {
        const featuresList = detailText.querySelector('ul');
        if (featuresList) {
            featuresList.innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');
        }
    }
}

// Get category display name
function getCategoryDisplayName(category) {
    const map = {
        'outdoor': '야외시설',
        'furniture': '가구',
        'lighting': '조명시스템',
        'flooring': '바닥재',
        'wall': '벽재',
        'accessories': '액세서리'
    };
    return map[category] || category;
}

// Show error message
function showError(message) {
    const productDetail = document.querySelector('.product-detail');
    if (productDetail) {
        productDetail.innerHTML = `
            <div class="container" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #e74c3c; margin-bottom: 24px;"></i>
                <div style="color: #666; line-height: 1.8; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 30px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                    ${message}
                </div>
                <a href="index.html" class="btn btn-primary" style="margin-top: 24px; display: inline-block;">홈으로 돌아가기</a>
            </div>
        `;
    }
}

function initProductDetail() {
    // Thumbnail image switching
    initThumbnailSwitching();
    
    // Product options handling
    initProductOptions();
    
    // Quantity selector
    initQuantitySelector();
    
    // Tab functionality
    initTabs();
    
    // Product actions
    initProductActions();
    
    // Image zoom functionality
    initImageZoom();
    
    // Q&A accordion
    initQnAAccordion();
}

// Thumbnail Image Switching
function initThumbnailSwitching() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image .image-placeholder');
    
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');
            
            // Update main image (in real implementation, this would change the actual image)
            updateMainImage(index);
        });
    });
}

function updateMainImage(index) {
    const mainImage = document.querySelector('.main-image .image-placeholder p');
    const imageTexts = ['메인 제품 이미지', '제품 상세 이미지 1', '제품 상세 이미지 2', '제품 상세 이미지 3'];
    
    if (mainImage && imageTexts[index]) {
        mainImage.textContent = imageTexts[index];
    }
}

// Product Options Handling
function initProductOptions() {
    // Color options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            
            const color = option.getAttribute('data-color');
            updateProductVariant('color', color);
        });
    });
    
    // Size options
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            
            const size = option.getAttribute('data-size');
            updateProductVariant('size', size);
        });
    });
}

function updateProductVariant(type, value) {
    // Update price based on variant (example logic)
    const currentPrice = document.querySelector('.current-price');
    const originalPrice = document.querySelector('.original-price');
    
    if (type === 'size' && value === 'large') {
        if (currentPrice) currentPrice.textContent = '₩85,000';
        if (originalPrice) originalPrice.textContent = '₩110,000';
    } else {
        if (currentPrice) currentPrice.textContent = '₩45,000';
        if (originalPrice) originalPrice.textContent = '₩60,000';
    }
    
    // Show notification
    showNotification(`${type === 'color' ? '색상' : '크기'}이 변경되었습니다.`, 'info');
}

// Quantity Selector
function initQuantitySelector() {
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const qtyInput = document.querySelector('.qty-input');
    
    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(qtyInput.value);
            if (currentValue > 1) {
                qtyInput.value = currentValue - 1;
                updateTotalPrice();
            }
        });
    }
    
    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(qtyInput.value);
            const maxValue = parseInt(qtyInput.getAttribute('max'));
            if (currentValue < maxValue) {
                qtyInput.value = currentValue + 1;
                updateTotalPrice();
            }
        });
    }
    
    if (qtyInput) {
        qtyInput.addEventListener('change', () => {
            const value = parseInt(qtyInput.value);
            const min = parseInt(qtyInput.getAttribute('min'));
            const max = parseInt(qtyInput.getAttribute('max'));
            
            if (value < min) qtyInput.value = min;
            if (value > max) qtyInput.value = max;
            
            updateTotalPrice();
        });
    }
}

function updateTotalPrice() {
    const qtyInput = document.querySelector('.qty-input');
    const currentPrice = document.querySelector('.current-price');
    
    if (qtyInput && currentPrice) {
        const quantity = parseInt(qtyInput.value);
        const unitPrice = parseInt(currentPrice.textContent.replace(/[^\d]/g, ''));
        const totalPrice = unitPrice * quantity;
        
        // Update display (you might want to show this somewhere)
        console.log(`Total price: ₩${totalPrice.toLocaleString()}`);
    }
}

// Tab Functionality
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            btn.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            // Smooth scroll to tabs section
            const tabsSection = document.querySelector('.product-tabs');
            if (tabsSection) {
                tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Product Actions
function initProductActions() {
    const addToCartBtn = document.querySelector('.btn-primary');
    const wishlistBtn = document.querySelector('.btn-secondary');
    const consultBtn = document.querySelector('.btn-outline');
    
    // Add to Cart
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart();
        });
    }
    
    // Add to Wishlist
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            addToWishlist();
        });
    }
    
    // Consultation
    if (consultBtn) {
        consultBtn.addEventListener('click', () => {
            openConsultation();
        });
    }
}

function addToCart() {
    const productTitle = document.querySelector('.product-title').textContent;
    const quantity = document.querySelector('.qty-input').value;
    const selectedColor = document.querySelector('.color-option.active').getAttribute('data-color');
    const selectedSize = document.querySelector('.size-option.active').getAttribute('data-size');
    
    // Show loading state
    const btn = document.querySelector('.btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> 추가 중...';
    btn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showNotification(`${productTitle}이(가) 장바구니에 추가되었습니다!`, 'success');
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // Update cart count (if you have a cart counter)
        updateCartCount();
    }, 1500);
}

function addToWishlist() {
    const productTitle = document.querySelector('.product-title').textContent;
    const btn = document.querySelector('.btn-secondary');
    const icon = btn.querySelector('i');
    
    // Toggle wishlist state
    if (icon.classList.contains('fas')) {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('찜 목록에서 제거되었습니다.', 'info');
    } else {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification(`${productTitle}이(가) 찜 목록에 추가되었습니다!`, 'success');
    }
}

function openConsultation() {
    // Scroll to contact section or open consultation modal
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Open consultation modal or redirect to contact page
        showNotification('상담 문의 페이지로 이동합니다.', 'info');
        setTimeout(() => {
            window.location.href = 'index.html#contact';
        }, 1000);
    }
}

function updateCartCount() {
    // Update cart count in navigation (if exists)
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + 1;
        cartCount.style.display = 'block';
    }
}

// Image Zoom Functionality
function initImageZoom() {
    const mainImage = document.querySelector('.main-image');
    const zoomBtn = document.querySelector('.image-zoom');
    
    if (zoomBtn) {
        zoomBtn.addEventListener('click', () => {
            openImageModal();
        });
    }
    
    if (mainImage) {
        mainImage.addEventListener('click', () => {
            openImageModal();
        });
    }
}

function openImageModal() {
    const mainImage = document.querySelector('.main-image .image-placeholder');
    const productTitle = document.querySelector('.product-title').textContent;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${productTitle}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-image">
                    <div class="image-placeholder">
                        <i class="fas fa-image"></i>
                        <p>확대된 제품 이미지</p>
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
        border-radius: 20px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;
    
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    modalBackdrop.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(5px);
    `;
    
    const modalImage = modal.querySelector('.modal-image .image-placeholder');
    modalImage.style.cssText = `
        height: 500px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        margin: 1rem;
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
            document.body.removeChild(modal);
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

// Q&A Accordion
function initQnAAccordion() {
    const qnaItems = document.querySelectorAll('.qna-item');
    
    qnaItems.forEach(item => {
        const question = item.querySelector('.qna-question');
        const answer = item.querySelector('.qna-answer');
        
        if (question && answer) {
            // Initially hide answers
            answer.style.display = 'none';
            
            question.addEventListener('click', () => {
                const isOpen = answer.style.display === 'block';
                
                // Close all other Q&A items
                qnaItems.forEach(otherItem => {
                    const otherAnswer = otherItem.querySelector('.qna-answer');
                    if (otherAnswer && otherItem !== item) {
                        otherAnswer.style.display = 'none';
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                if (isOpen) {
                    answer.style.display = 'none';
                    item.classList.remove('active');
                } else {
                    answer.style.display = 'block';
                    item.classList.add('active');
                }
            });
        }
    });
}

// Notification System (reuse from main script)
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
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
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

// Add CSS for additional styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #eee;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
        transition: color 0.3s ease;
    }
    
    .modal-close:hover {
        color: #333;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .qna-item.active .qna-question {
        background: #667eea;
        color: white;
    }
    
    .qna-item.active .qna-type {
        background: white;
        color: #667eea;
    }
    
    .loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(additionalStyles);
