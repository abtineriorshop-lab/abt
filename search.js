// 전역 검색 기능
let allProducts = [];
let allPortfolio = [];

// 검색 모달 생성
function createSearchModal() {
    const modal = document.createElement('div');
    modal.id = 'searchModal';
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-overlay"></div>
        <div class="search-modal-content">
            <div class="search-modal-header">
                <h2>검색</h2>
                <button class="search-modal-close" aria-label="검색 닫기">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-input-wrapper">
                <i class="fas fa-search"></i>
                <input type="text" id="globalSearchInput" placeholder="제품명, 카테고리, 설명을 검색하세요..." autocomplete="off">
                <button class="search-clear" id="searchClear" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-results" id="searchResults">
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>검색어를 입력하세요</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 스타일 추가
    if (!document.getElementById('searchModalStyles')) {
        const style = document.createElement('style');
        style.id = 'searchModalStyles';
        style.textContent = `
            .search-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            .search-modal.active {
                display: block;
            }
            .search-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }
            .search-modal-content {
                position: relative;
                max-width: 800px;
                margin: 100px auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-height: 80vh;
                display: flex;
                flex-direction: column;
            }
            .search-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid #e0e0e0;
            }
            .search-modal-header h2 {
                margin: 0;
                font-size: 24px;
                color: #2c3e50;
            }
            .search-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #666;
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: all 0.3s;
            }
            .search-modal-close:hover {
                background: #f0f0f0;
                color: #333;
            }
            .search-input-wrapper {
                position: relative;
                padding: 20px 24px;
                border-bottom: 1px solid #e0e0e0;
            }
            .search-input-wrapper i {
                position: absolute;
                left: 36px;
                top: 50%;
                transform: translateY(-50%);
                color: #999;
            }
            #globalSearchInput {
                width: 100%;
                padding: 12px 16px 12px 48px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 16px;
                transition: all 0.3s;
            }
            #globalSearchInput:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .search-clear {
                position: absolute;
                right: 36px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: all 0.3s;
            }
            .search-clear:hover {
                background: #f0f0f0;
                color: #333;
            }
            .search-results {
                flex: 1;
                overflow-y: auto;
                padding: 20px 24px;
            }
            .search-placeholder {
                text-align: center;
                padding: 60px 20px;
                color: #999;
            }
            .search-placeholder i {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            .search-result-item {
                padding: 16px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: all 0.3s;
                border-radius: 8px;
                margin-bottom: 8px;
            }
            .search-result-item:hover {
                background: #f8f9fa;
                transform: translateX(4px);
            }
            .search-result-item h3 {
                margin: 0 0 8px 0;
                color: #2c3e50;
                font-size: 18px;
            }
            .search-result-item p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            .search-result-item .result-type {
                display: inline-block;
                padding: 4px 8px;
                background: #667eea;
                color: white;
                border-radius: 4px;
                font-size: 12px;
                margin-bottom: 8px;
            }
            .search-result-item .result-type.portfolio {
                background: #10b981;
            }
            .search-no-results {
                text-align: center;
                padding: 60px 20px;
                color: #999;
            }
            .search-no-results i {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            @media (max-width: 768px) {
                .search-modal-content {
                    margin: 0;
                    max-height: 100vh;
                    border-radius: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    return modal;
}

// 검색 데이터 로드
async function loadSearchData() {
    try {
        // 제품 데이터 로드
        const productsResponse = await fetch('data/products.json', { cache: 'no-store' });
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            allProducts = [];
            Object.keys(productsData.categories || {}).forEach(category => {
                if (Array.isArray(productsData.categories[category])) {
                    allProducts = allProducts.concat(productsData.categories[category]);
                }
            });
            if (productsData.featured) {
                allProducts = allProducts.concat(productsData.featured);
            }
        }
        
        // 포트폴리오 데이터 로드
        const portfolioResponse = await fetch('data/portfolio.json', { cache: 'no-store' });
        if (portfolioResponse.ok) {
            const portfolioData = await portfolioResponse.json();
            allPortfolio = portfolioData.projects || [];
        }
    } catch (error) {
        console.error('검색 데이터 로드 오류:', error);
    }
}

// 검색 실행
function performSearch(query) {
    const results = [];
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        return results;
    }
    
    // 제품 검색
    allProducts.forEach(product => {
        const name = (product.name || '').toLowerCase();
        const description = (product.description || product.shortDescription || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const subcategory = (product.subcategory || '').toLowerCase();
        
        if (name.includes(searchTerm) || 
            description.includes(searchTerm) || 
            category.includes(searchTerm) ||
            subcategory.includes(searchTerm)) {
            results.push({
                type: 'product',
                title: product.name,
                description: product.shortDescription || product.description || '',
                category: product.category,
                url: `products-${product.category}.html#product-${product.id}`,
                image: product.image
            });
        }
    });
    
    // 포트폴리오 검색
    allPortfolio.forEach(project => {
        const title = (project.title || '').toLowerCase();
        const description = (project.description || '').toLowerCase();
        const category = (project.category || '').toLowerCase();
        const location = (project.location || '').toLowerCase();
        
        if (title.includes(searchTerm) || 
            description.includes(searchTerm) || 
            category.includes(searchTerm) ||
            location.includes(searchTerm)) {
            results.push({
                type: 'portfolio',
                title: project.title,
                description: project.description || '',
                category: project.category,
                url: `portfolio.html#project-${project.id}`,
                image: project.cover
            });
        }
    });
    
    return results;
}

// 검색 결과 표시
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>검색 결과가 없습니다.</p>
                <p style="font-size: 14px; margin-top: 8px;">다른 검색어를 시도해보세요.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    results.forEach(result => {
        html += `
            <div class="search-result-item" onclick="window.location.href='${result.url}'">
                <span class="result-type ${result.type}">${result.type === 'product' ? '제품' : '포트폴리오'}</span>
                <h3>${result.title}</h3>
                <p>${result.description.substring(0, 100)}${result.description.length > 100 ? '...' : ''}</p>
                ${result.category ? `<p style="margin-top: 8px; font-size: 12px; color: #999;">카테고리: ${result.category}</p>` : ''}
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
}

// 검색 기능 초기화
function initSearch() {
    // 검색 모달 생성
    const modal = createSearchModal();
    
    // 검색 아이콘 클릭 이벤트
    document.querySelectorAll('.nav-icon .fa-search').forEach(icon => {
        icon.closest('.nav-icon').addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.getElementById('globalSearchInput').focus();
        });
    });
    
    // 모달 닫기
    modal.querySelector('.search-modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.querySelector('.search-modal-overlay').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
    
    // 검색 입력 이벤트
    const searchInput = document.getElementById('globalSearchInput');
    const searchClear = document.getElementById('searchClear');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        
        if (query.trim()) {
            searchClear.style.display = 'block';
            const results = performSearch(query);
            displaySearchResults(results);
        } else {
            searchClear.style.display = 'none';
            document.getElementById('searchResults').innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>검색어를 입력하세요</p>
                </div>
            `;
        }
    });
    
    // 검색 초기화 버튼
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        document.getElementById('searchResults').innerHTML = `
            <div class="search-placeholder">
                <i class="fas fa-search"></i>
                <p>검색어를 입력하세요</p>
            </div>
        `;
        searchInput.focus();
    });
    
    // Enter 키로 첫 번째 결과로 이동
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const firstResult = document.querySelector('.search-result-item');
            if (firstResult) {
                firstResult.click();
            }
        }
    });
    
    // 검색 데이터 로드
    loadSearchData();
}

// DOM 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

