function showPortfolioLoading() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = `
        <div class="loading-skeleton" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #d4af37; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 16px; color: #666;">포트폴리오를 불러오는 중...</p>
        </div>
    `;
    const style = document.createElement('style');
    if (!document.querySelector('style[data-portfolio-loading]')) {
        style.setAttribute('data-portfolio-loading', '');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
}

function showPortfolioError(message) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; max-width: 800px; margin: 0 auto;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 16px;"></i>
            <div style="color: #666; margin-bottom: 16px; line-height: 1.8; text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                ${message || '포트폴리오를 불러오는 중 오류가 발생했습니다.'}
            </div>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 16px;">다시 시도</button>
        </div>
    `;
    console.error('포트폴리오 로드 오류:', message);
}

document.addEventListener('DOMContentLoaded', () => {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    showPortfolioLoading();
    loadPortfolioProjects();
});

async function loadPortfolioProjects() {
    try {
        // CORS 오류 체크
        if (window.location.protocol === 'file:') {
            showPortfolioError('로컬 서버를 실행해주세요. 파일을 직접 열면 데이터를 불러올 수 없습니다.<br><br>해결 방법:<br>1. 터미널에서 프로젝트 폴더로 이동<br>2. Python 설치 시: <code>python -m http.server 8000</code><br>3. Node.js 설치 시: <code>npx http-server</code><br>4. 브라우저에서 <code>http://localhost:8000</code> 접속');
            return;
        }
        
        const response = await fetch('data/portfolio.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('포트폴리오 데이터를 불러오지 못했습니다.');
        const data = await response.json();
        const projects = data.projects || [];
        if (projects.length === 0) {
            showPortfolioError('표시할 포트폴리오가 없습니다.');
            return;
        }
        renderPortfolioProjects(projects);
        bindPortfolioFilters(projects);
    } catch (error) {
        // CORS 오류인지 확인
        if (error.message.includes('fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
            showPortfolioError('로컬 서버를 실행해주세요. 파일을 직접 열면 데이터를 불러올 수 없습니다.<br><br>해결 방법:<br>1. 터미널에서 프로젝트 폴더로 이동<br>2. Python 설치 시: <code>python -m http.server 8000</code><br>3. Node.js 설치 시: <code>npx http-server</code><br>4. 브라우저에서 <code>http://localhost:8000</code> 접속');
        } else {
            showPortfolioError(error.message);
        }
    }
}

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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"`;
}

function renderPortfolioProjects(projects) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = '';

    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = `portfolio-item ${project.highlighted ? 'large' : ''}`;
        item.dataset.category = project.category;
        const optimizedSrcset = createOptimizedImageSrcset(project.cover);
        const optimizedSrc = project.cover ? project.cover.replace(/w=\d+/, 'w=800').replace(/q=\d+/, 'q=75') : project.cover;
        item.innerHTML = `
            <img src="${optimizedSrc}" ${optimizedSrcset} alt="${project.title}" loading="lazy">
            <div class="portfolio-overlay">
                <div class="portfolio-info">
                    <span class="portfolio-category">${getPortfolioCategoryName(project.category)}</span>
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    <div class="portfolio-tags">
                        ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                    <div class="portfolio-meta">
                        <span>${project.location}</span>
                        <span>${project.area}</span>
                        <span>${project.duration}</span>
                    </div>
                    <a href="portfolio-detail.html?id=${project.id}" class="portfolio-view-btn" style="margin-top: 16px; display: inline-block; padding: 10px 20px; background: white; color: #667eea; border-radius: 6px; text-decoration: none; font-weight: 600;">
                        상세보기 <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.portfolio-view-btn')) {
                window.location.href = `portfolio-detail.html?id=${project.id}`;
            }
        });
        portfolioGrid.appendChild(item);
    });
}

function bindPortfolioFilters(projects) {
    const filterButtons = document.querySelectorAll('.portfolio-gallery .filter-btn');
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!filterButtons.length || !portfolioGrid) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;
            const filteredProjects = filter === 'all'
                ? projects
                : projects.filter(project => project.category === filter);
            renderPortfolioProjects(filteredProjects);
        });
    });
}

function getPortfolioCategoryName(category) {
    const map = {
        pension: '펜션',
        cafe: '대형카페',
        caravan: '카라반',
        camping: '캠핑장',
        outdoor: '야외시설',
        lighting: '조명시스템'
    };
    return map[category] || category;
}

