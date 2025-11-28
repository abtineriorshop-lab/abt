// 제품 페이지 JavaScript - 관리자 데이터와 완전 연동

let productData = {};

async function loadAdminProductData() {
    const fetched = await loadProductDataFromFile();
    if (fetched) return true;

    const fallbackLoaded = loadProductDataFromLocalStorage();
    if (fallbackLoaded) return true;

    // 마지막 수단으로 하드코딩 데이터
    productData = getDefaultProductData();
    return true;
}

async function loadProductDataFromFile() {
    try {
        // CORS 오류 체크
        if (window.location.protocol === 'file:') {
            console.warn('로컬 서버를 실행해주세요. 파일을 직접 열면 데이터를 불러올 수 없습니다.');
            return false;
        }
        
        const response = await fetch('data/products.json', { cache: 'no-store' });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        if (data && data.categories) {
            productData = data.categories;
            localStorage.setItem('brightFutureProducts', JSON.stringify(data.featured || []));
            localStorage.setItem('brightFutureCategorizedProducts', JSON.stringify(productData));
            return true;
        }
    } catch (error) {
        console.error('제품 JSON 로드 실패:', error);
        // CORS 오류인지 확인
        if (error.message.includes('fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
            console.warn('로컬 서버를 실행해주세요. 파일을 직접 열면 데이터를 불러올 수 없습니다.');
        }
    }
    return false;
}

function loadProductDataFromLocalStorage() {
    const categorizedProducts = localStorage.getItem('brightFutureCategorizedProducts');
    if (!categorizedProducts) return false;
    try {
        const categorized = JSON.parse(categorizedProducts);
        productData = categorized;
        return true;
    } catch (error) {
        console.error('로컬스토리지 제품 데이터 파싱 실패:', error);
        return false;
    }
}

function getDefaultProductData() {
    const data = {
        outdoor: [],
        furniture: [],
        lighting: [],
        flooring: [],
        wall: [],
        accessories: []
    };
    // 최소한의 필수 아이템만 제공
    data.outdoor.push({
        id: 'gazebo-1',
        name: '클래식 야외정자',
        category: 'outdoor',
        subcategory: 'gazebo',
        price: 2500000,
        shortDescription: '전통적인 디자인으로 자연과 조화를 이루는 휴식 공간',
        description: '전통적인 디자인의 아름다운 야외정자로 자연과 조화로운 휴식 공간을 제공합니다.',
        size: '3m x 3m',
        material: '목재',
        badge: '인기',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2016&q=80',
        features: ['고급 원목 소재', '방수 처리'],
        specs: { '크기': '3m x 3m x 2.5m' },
        popularity: 90,
        updated: 20240101
    });
    return data;
}

function showLoadingState() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    productsGrid.innerHTML = `
        <div class="loading-skeleton" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #d4af37; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 16px; color: #666;">제품을 불러오는 중...</p>
        </div>
    `;
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
}

function showErrorState(message) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // CORS 오류인지 확인
    const isCorsError = message && (message.includes('fetch') || message.includes('CORS') || message.includes('file://'));
    const errorMessage = isCorsError 
        ? '로컬 서버를 실행해주세요. 파일을 직접 열면 데이터를 불러올 수 없습니다.<br><br>해결 방법:<br>1. 터미널에서 프로젝트 폴더로 이동<br>2. Python 설치 시: <code>python -m http.server 8000</code><br>3. Node.js 설치 시: <code>npx http-server</code><br>4. 브라우저에서 <code>http://localhost:8000</code> 접속'
        : (message || '제품을 불러오는 중 오류가 발생했습니다.');
    
    productsGrid.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; max-width: 800px; margin: 0 auto;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 16px;"></i>
            <div style="color: #666; margin-bottom: 16px; line-height: 1.8; text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                ${errorMessage}
            </div>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 16px;">다시 시도</button>
        </div>
    `;
    console.error('제품 로드 오류:', message);
}

document.addEventListener('DOMContentLoaded', async function() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        showLoadingState();
    }
    
    try {
        const hasAdminData = await loadAdminProductData();
        
        if (hasAdminData) {
            createProductCardsFromAdminData();
        } else {
            showErrorState('제품 데이터를 찾을 수 없습니다.');
        }
    } catch (error) {
        showErrorState(error.message);
    }
    
    initializeProductPage();
});

// 관리자 데이터로부터 제품 카드 생성
function createProductCardsFromAdminData() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // 현재 페이지의 카테고리 확인
    const currentPage = window.location.pathname;
    let currentCategory = '';
    
    if (currentPage.includes('outdoor')) currentCategory = 'outdoor';
    else if (currentPage.includes('furniture')) currentCategory = 'furniture';
    else if (currentPage.includes('lighting')) currentCategory = 'lighting';
    else if (currentPage.includes('flooring')) currentCategory = 'flooring';
    else if (currentPage.includes('wall')) currentCategory = 'wall';
    else if (currentPage.includes('accessories')) currentCategory = 'accessories';
    
    if (!currentCategory || !productData[currentCategory]) return;
    
    // 기존 제품 카드 제거
    productsGrid.innerHTML = '';
    
    // 관리자 데이터로부터 제품 카드 생성
    productData[currentCategory].forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// 이미지 srcset 최적화 헬퍼
function createOptimizedImageSrcset(imageUrl) {
    if (!imageUrl || !imageUrl.includes('unsplash.com')) {
        return '';
    }
    const baseUrl = imageUrl.split('&w=')[0] || imageUrl.split('?')[0];
    const params = imageUrl.includes('?') ? imageUrl.split('?')[1].split('&').filter(p => !p.startsWith('w=')).join('&') : '';
    const paramPrefix = params ? `?${params}&` : '?';
    return `srcset="${baseUrl}${paramPrefix}w=400&q=75 400w,
            ${baseUrl}${paramPrefix}w=800&q=75 800w,
            ${baseUrl}${paramPrefix}w=1200&q=75 1200w" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"`;
}

// 제품 카드 생성
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.subcategory || product.category);
    card.setAttribute('data-price', product.price);
    
    const badgeHtml = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
    const optimizedSrcset = createOptimizedImageSrcset(product.image);
    const optimizedSrc = product.image ? product.image.replace(/w=\d+/, 'w=800').replace(/q=\d+/, 'q=75') : product.image;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${optimizedSrc}" ${optimizedSrcset} alt="${product.name}" loading="lazy">
                        <div class="product-overlay">
                            <a href="product-detail.html?id=${product.id}&category=${product.category}" class="quick-view-btn">
                                <i class="fas fa-eye"></i> 빠른보기
                            </a>
                            <button class="wishlist-btn" onclick="toggleWishlist('${product.id}')">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
            ${badgeHtml}
        </div>
        <div class="product-info">
            <div class="product-category">${getCategoryDisplayName(product.subcategory || product.category)}</div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.shortDescription || product.description}</p>
            <div class="product-specs">
                <span><i class="fas fa-ruler"></i> ${product.size || '맞춤제작'}</span>
                <span><i class="fas fa-tree"></i> ${product.material || '고급 소재'}</span>
            </div>
            <div class="product-price">
                <span class="price">${product.price.toLocaleString()}원</span>
                <span class="price-unit">부터</span>
            </div>
                            <div class="product-actions">
                                <a href="product-detail.html?id=${product.id}&category=${product.category}" class="btn btn-primary">상세보기</a>
                                <button class="btn btn-secondary" onclick="requestQuote('${product.id}')">견적문의</button>
                            </div>
        </div>
    `;
    
    return card;
}

// 카테고리 표시 이름 변환
function getCategoryDisplayName(category) {
    const categoryNames = {
        'gazebo': '야외정자',
        'pergola': '파고라',
        'terrace': '테라스',
        'deck': '데크',
        'fence': '울타리',
        'seating': '좌석',
        'table': '테이블',
        'storage': '수납',
        'bedroom': '침실',
        'outdoor': '야외',
        'ambient': '분위기',
        'task': '작업',
        'decorative': '장식',
        'wood': '목재',
        'tile': '타일',
        'vinyl': '비닐',
        'carpet': '카펫',
        'stone': '석재',
        'wallpaper': '벽지',
        'paint': '페인트',
        'decoration': '장식품',
        'mirror': '거울',
        'plant': '식물',
        'textile': '텍스타일'
    };
    return categoryNames[category] || category;
}

// 기존 제품 페이지 기능 초기화
function initializeProductPage() {
    const filterButtons = document.querySelectorAll('.filter-btn, .filter-tab');
    const productsGrid = document.getElementById('productsGrid');
    const productCards = productsGrid ? Array.from(productsGrid.querySelectorAll('.product-card')) : [];

    productCards.forEach((card, index) => {
        card.dataset.initialIndex = index;
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter') || 'all';
            filterProducts(filter);
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    const sortSelect = document.getElementById('sort') || document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
    
    // 검색 기능
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchProducts(this.value);
        });
    }
    
    // 더보기 버튼
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreProducts();
        });
    }
}

// 제품 필터링
function filterProducts(filter) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 제품 정렬
function sortProducts(sortBy) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const productCards = Array.from(productsGrid.querySelectorAll('.product-card'));
    const getPrice = (card) => parseInt(card.getAttribute('data-price')) || 0;
    const getNumeric = (card, key) => {
        const value = card.dataset[key];
        return value ? Number(value) : Number(card.dataset.initialIndex || 0);
    };
    
    productCards.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return getPrice(a) - getPrice(b);
            case 'price-high':
                return getPrice(b) - getPrice(a);
            case 'popular':
                return getNumeric(b, 'popularity') - getNumeric(a, 'popularity');
            case 'newest':
                return getNumeric(b, 'updated') - getNumeric(a, 'updated');
            case 'name':
                return a.querySelector('.product-title').textContent.localeCompare(
                    b.querySelector('.product-title').textContent
                );
            default:
                return Number(a.dataset.initialIndex || 0) - Number(b.dataset.initialIndex || 0);
        }
    });
    
    productCards.forEach(card => productsGrid.appendChild(card));
}

// 제품 검색
function searchProducts(query) {
    const productCards = document.querySelectorAll('.product-card');
    const searchTerm = query.toLowerCase();
    
    productCards.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 제품 모달 열기
function openProductModal(productId) {
    // 현재 카테고리의 제품 데이터에서 찾기
    const currentPage = window.location.pathname;
    let currentCategory = '';
    
    if (currentPage.includes('outdoor')) currentCategory = 'outdoor';
    else if (currentPage.includes('furniture')) currentCategory = 'furniture';
    else if (currentPage.includes('lighting')) currentCategory = 'lighting';
    else if (currentPage.includes('flooring')) currentCategory = 'flooring';
    else if (currentPage.includes('wall')) currentCategory = 'wall';
    else if (currentPage.includes('accessories')) currentCategory = 'accessories';
    
    if (!currentCategory || !productData[currentCategory]) return;
    
    const product = productData[currentCategory].find(p => p.id === productId);
    if (!product) return;
    
    // 모달 생성 및 표시
    showProductModal(product);
}

// 제품 모달 표시
function showProductModal(product) {
    // 기존 모달 제거
    const existingModal = document.getElementById('productModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 새 모달 생성
    const modal = document.createElement('div');
    modal.id = 'productModal';
    modal.className = 'modal-overlay show';
    
    const specsHtml = Object.entries(product.specs || {}).map(([key, value]) => 
        `<tr><td>${key}</td><td>${value}</td></tr>`
    ).join('');
    
    const featuresHtml = (product.features || []).map(feature => 
        `<li><i class="fas fa-check"></i> ${feature}</li>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${product.name}</h3>
                <button class="modal-close" onclick="closeProductModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="product-detail">
                    <div class="product-detail-gallery">
                        <div class="main-image">
                            <img src="${product.image}" alt="${product.name}" id="mainImage">
                        </div>
                        <div class="thumbnail-images">
                            ${(product.images || [product.image]).map((img, index) => 
                                `<img src="${img}" alt="${product.name}" onclick="changeMainImage('${img}')" class="${index === 0 ? 'active' : ''}">`
                            ).join('')}
                        </div>
                    </div>
                    <div class="product-detail-info">
                        <div class="product-category">${getCategoryDisplayName(product.subcategory || product.category)}</div>
                        <h2 class="product-title">${product.name}</h2>
                        <p class="product-description">${product.description}</p>
                        
                        <div class="product-features">
                            <h4>주요 특징</h4>
                            <ul>${featuresHtml}</ul>
                        </div>
                        
                        <div class="product-specs">
                            <h4>제품 사양</h4>
                            <table>
                                <tbody>${specsHtml}</tbody>
                            </table>
                        </div>
                        
                        <div class="product-price-section">
                            <div class="price">
                                <span class="price-amount">${product.price.toLocaleString()}원</span>
                                <span class="price-unit">부터</span>
                            </div>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn btn-primary" onclick="requestQuote('${product.id}')">견적 문의</button>
                            <button class="btn btn-secondary" onclick="toggleWishlist('${product.id}')">
                                <i class="fas fa-heart"></i> 위시리스트
                            </button>
                            <button class="btn btn-outline" onclick="shareProduct('${product.id}')">
                                <i class="fas fa-share"></i> 공유
                            </button>
                        </div>
                        
                        <div class="product-info-cards">
                            <div class="info-card">
                                <i class="fas fa-truck"></i>
                                <div>
                                    <h5>무료 배송</h5>
                                    <p>전국 무료 배송</p>
                                </div>
                            </div>
                            <div class="info-card">
                                <i class="fas fa-tools"></i>
                                <div>
                                    <h5>전문 설치</h5>
                                    <p>전문 설치 서비스</p>
                                </div>
                            </div>
                            <div class="info-card">
                                <i class="fas fa-shield-alt"></i>
                                <div>
                                    <h5>품질 보증</h5>
                                    <p>제품별 품질 보증</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 메인 이미지 변경
function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // 썸네일 활성화 상태 업데이트
    document.querySelectorAll('.thumbnail-images img').forEach(img => {
        img.classList.remove('active');
        if (img.src === imageSrc) {
            img.classList.add('active');
        }
    });
}

// 제품 모달 닫기
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.remove();
    }
}

// 위시리스트 토글
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        showNotification('위시리스트에서 제거되었습니다.', 'info');
    } else {
        wishlist.push(productId);
        showNotification('위시리스트에 추가되었습니다.', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

// 위시리스트 UI 업데이트
function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.closest('.product-card').querySelector('.quick-view-btn').onclick.toString().match(/'([^']+)'/)[1];
        
        if (wishlist.includes(productId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 견적 문의
function requestQuote(productId) {
    // 현재 카테고리의 제품 데이터에서 찾기
    const currentPage = window.location.pathname;
    let currentCategory = '';
    
    if (currentPage.includes('outdoor')) currentCategory = 'outdoor';
    else if (currentPage.includes('furniture')) currentCategory = 'furniture';
    else if (currentPage.includes('lighting')) currentCategory = 'lighting';
    else if (currentPage.includes('flooring')) currentCategory = 'flooring';
    else if (currentPage.includes('wall')) currentCategory = 'wall';
    else if (currentPage.includes('accessories')) currentCategory = 'accessories';
    
    if (!currentCategory || !productData[currentCategory]) return;
    
    const product = productData[currentCategory].find(p => p.id === productId);
    if (!product) return;
    
    // 견적 문의 폼으로 이동 (제품 정보 포함)
    const queryParams = new URLSearchParams({
        product: product.name,
        price: product.price,
        category: product.category
    });
    
    window.location.href = `contact.html?${queryParams.toString()}`;
}

// 제품 공유
function shareProduct(productId) {
    if (navigator.share) {
        navigator.share({
            title: '밝은내일 제품',
            text: '이 제품을 확인해보세요!',
            url: window.location.href
        });
    } else {
        // 클립보드에 URL 복사
        copyToClipboard(window.location.href);
        showNotification('링크가 클립보드에 복사되었습니다.', 'success');
    }
}

// 클립보드에 복사
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('클립보드에 복사됨:', text);
    }).catch(err => {
        console.error('클립보드 복사 실패:', err);
    });
}

// 더 많은 제품 로드
function loadMoreProducts() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 로딩 중...';
        showNotification('더 많은 제품을 불러오는 중...');
        
        // 실제 애플리케이션에서는 API 호출
        setTimeout(() => {
            showNotification('모든 제품을 불러왔습니다.');
            loadMoreBtn.style.display = 'none';
        }, 1500);
    }
}

// 알림 표시
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// CSS 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        background: #27ae60;
    }
    
    .notification-error {
        background: #e74c3c;
    }
    
    .notification-info {
        background: #3498db;
    }
    
    .wishlist-btn.active {
        color: #e74c3c;
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .modal-overlay.show {
        opacity: 1;
        visibility: visible;
    }
    
    .modal {
        background: white;
        border-radius: 20px;
        max-width: 1000px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .modal-overlay.show .modal {
        transform: scale(1);
    }
    
    .modal-header {
        padding: 20px 30px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        margin: 0;
        font-size: 24px;
        color: #2c3e50;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #999;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: #f5f5f5;
        color: #333;
    }
    
    .modal-body {
        padding: 30px;
    }
    
    .product-detail {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
    }
    
    .product-detail-gallery .main-image {
        margin-bottom: 15px;
    }
    
    .product-detail-gallery .main-image img {
        width: 100%;
        height: 400px;
        object-fit: cover;
        border-radius: 15px;
    }
    
    .thumbnail-images {
        display: flex;
        gap: 10px;
    }
    
    .thumbnail-images img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.3s ease;
    }
    
    .thumbnail-images img.active,
    .thumbnail-images img:hover {
        opacity: 1;
        border: 2px solid #3498db;
    }
    
    .product-detail-info .product-category {
        color: #3498db;
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
    }
    
    .product-detail-info .product-title {
        font-size: 28px;
        color: #2c3e50;
        margin-bottom: 15px;
        font-weight: 600;
    }
    
    .product-detail-info .product-description {
        color: #666;
        line-height: 1.6;
        margin-bottom: 25px;
    }
    
    .product-features {
        margin-bottom: 25px;
    }
    
    .product-features h4 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 18px;
    }
    
    .product-features ul {
        list-style: none;
        padding: 0;
    }
    
    .product-features li {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        color: #666;
    }
    
    .product-features li i {
        color: #27ae60;
        font-size: 14px;
    }
    
    .product-specs {
        margin-bottom: 25px;
    }
    
    .product-specs h4 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 18px;
    }
    
    .product-specs table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .product-specs td {
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    
    .product-specs td:first-child {
        font-weight: 500;
        color: #2c3e50;
        width: 30%;
    }
    
    .product-price-section {
        margin-bottom: 25px;
    }
    
    .product-price-section .price {
        display: flex;
        align-items: baseline;
        gap: 5px;
    }
    
    .product-price-section .price-amount {
        font-size: 32px;
        font-weight: 700;
        color: #2c3e50;
    }
    
    .product-price-section .price-unit {
        color: #666;
        font-size: 16px;
    }
    
    .product-actions {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
    }
    
    .product-actions .btn {
        flex: 1;
        padding: 15px 20px;
        border: none;
        border-radius: 10px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .product-actions .btn-primary {
        background: #3498db;
        color: white;
    }
    
    .product-actions .btn-primary:hover {
        background: #2980b9;
        transform: translateY(-2px);
    }
    
    .product-actions .btn-secondary {
        background: #e74c3c;
        color: white;
    }
    
    .product-actions .btn-secondary:hover {
        background: #c0392b;
        transform: translateY(-2px);
    }
    
    .product-actions .btn-outline {
        background: transparent;
        color: #3498db;
        border: 2px solid #3498db;
    }
    
    .product-actions .btn-outline:hover {
        background: #3498db;
        color: white;
        transform: translateY(-2px);
    }
    
    .product-info-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }
    
    .info-card {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
    }
    
    .info-card i {
        font-size: 24px;
        color: #3498db;
    }
    
    .info-card h5 {
        margin: 0 0 5px 0;
        color: #2c3e50;
        font-size: 14px;
    }
    
    .info-card p {
        margin: 0;
        color: #666;
        font-size: 12px;
    }
    
    @media (max-width: 768px) {
        .product-detail {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .product-actions {
            flex-direction: column;
        }
        
        .product-info-cards {
            grid-template-columns: 1fr;
        }
        
        .modal {
            width: 95%;
            margin: 20px;
        }
        
        .modal-body {
            padding: 20px;
        }
    }
`;
document.head.appendChild(style);