// 포트폴리오 상세 페이지 JavaScript

let portfolioData = [];

// URL 파라미터에서 프로젝트 ID 가져오기
function getProjectIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('project');
}

// 포트폴리오 데이터 로드
async function loadPortfolioData() {
    try {
        const response = await fetch('data/portfolio.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('포트폴리오 데이터를 불러오지 못했습니다.');
        const data = await response.json();
        portfolioData = data.projects || [];
        return true;
    } catch (error) {
        console.error('포트폴리오 데이터 로드 오류:', error);
        return false;
    }
}

// 프로젝트 찾기
function findProject(projectId) {
    return portfolioData.find(p => p.id === projectId);
}

// 카테고리 한글명 변환
function getCategoryName(category) {
    const categoryMap = {
        'pension': '펜션',
        'cafe': '대형카페',
        'caravan': '카라반',
        'camping': '캠핑장',
        'outdoor': '야외시설'
    };
    return categoryMap[category] || category;
}

// 포트폴리오 상세 정보 표시
function displayPortfolioDetail(project) {
    if (!project) {
        document.getElementById('portfolioDetailContent').innerHTML = `
            <div class="error-state" style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h2>프로젝트를 찾을 수 없습니다</h2>
                <p style="color: #666; margin-top: 16px;">요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.</p>
                <a href="portfolio.html" class="btn btn-primary" style="margin-top: 24px; display: inline-block;">포트폴리오로 돌아가기</a>
            </div>
        `;
        return;
    }

    const images = project.images || [project.cover];
    const mainImage = images[0] || project.cover;
    const thumbnails = images.slice(1);

    let html = `
        <div class="portfolio-header">
            <h1>${project.title}</h1>
            <div class="portfolio-meta">
                <div class="portfolio-meta-item">
                    <i class="fas fa-tag"></i>
                    <span>${getCategoryName(project.category)}</span>
                </div>
                ${project.location ? `
                <div class="portfolio-meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${project.location}</span>
                </div>
                ` : ''}
                ${project.area ? `
                <div class="portfolio-meta-item">
                    <i class="fas fa-ruler-combined"></i>
                    <span>${project.area}</span>
                </div>
                ` : ''}
                ${project.duration ? `
                <div class="portfolio-meta-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${project.duration}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="portfolio-image-gallery">
            <img src="${mainImage}" alt="${project.title}" class="portfolio-main-image" id="mainImage">
            ${thumbnails.length > 0 ? `
            <div class="portfolio-thumbnails">
                ${thumbnails.map((img, index) => `
                    <img src="${img}" alt="${project.title} - 이미지 ${index + 2}" class="portfolio-thumbnail" onclick="changeMainImage('${img}')">
                `).join('')}
            </div>
            ` : ''}
        </div>

        <div class="portfolio-content">
            <div class="portfolio-description">
                <h2>프로젝트 개요</h2>
                <p>${project.description || '프로젝트 설명이 없습니다.'}</p>
                ${project.tags && project.tags.length > 0 ? `
                <div class="portfolio-tags">
                    ${project.tags.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
                </div>
                ` : ''}
            </div>

            <div class="portfolio-sidebar">
                <h3>프로젝트 정보</h3>
                ${project.location ? `
                <div class="portfolio-info-item">
                    <div class="portfolio-info-label">위치</div>
                    <div class="portfolio-info-value">${project.location}</div>
                </div>
                ` : ''}
                ${project.area ? `
                <div class="portfolio-info-item">
                    <div class="portfolio-info-label">면적</div>
                    <div class="portfolio-info-value">${project.area}</div>
                </div>
                ` : ''}
                ${project.duration ? `
                <div class="portfolio-info-item">
                    <div class="portfolio-info-label">시공 기간</div>
                    <div class="portfolio-info-value">${project.duration}</div>
                </div>
                ` : ''}
                <div class="portfolio-info-item">
                    <div class="portfolio-info-label">카테고리</div>
                    <div class="portfolio-info-value">${getCategoryName(project.category)}</div>
                </div>
            </div>
        </div>

        ${project.products && project.products.length > 0 ? `
        <div class="portfolio-products">
            <h3>적용 제품</h3>
            <ul class="product-list">
                ${project.products.map(product => `<li>${product}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${project.metrics ? `
        <div class="portfolio-metrics">
            ${project.metrics.occupancy ? `
            <div class="metric-card">
                <div class="metric-value">${project.metrics.occupancy}</div>
                <div class="metric-label">입실률 증가</div>
            </div>
            ` : ''}
            ${project.metrics.reviewScore ? `
            <div class="metric-card">
                <div class="metric-value">${project.metrics.reviewScore}</div>
                <div class="metric-label">평균 평점</div>
            </div>
            ` : ''}
            ${project.metrics.dailyVisitors ? `
            <div class="metric-card">
                <div class="metric-value">${project.metrics.dailyVisitors}</div>
                <div class="metric-label">일일 방문자 증가</div>
            </div>
            ` : ''}
            ${project.metrics.bookingRate ? `
            <div class="metric-card">
                <div class="metric-value">${project.metrics.bookingRate}</div>
                <div class="metric-label">예약률 증가</div>
            </div>
            ` : ''}
        </div>
        ` : ''}

        <div class="portfolio-cta">
            <h3>이런 프로젝트를 원하시나요?</h3>
            <p style="margin: 16px 0; color: #666;">비슷한 프로젝트를 진행하고 싶으시다면 언제든지 문의해주세요.</p>
            <a href="contact.html?project=${encodeURIComponent(project.title)}&category=${encodeURIComponent(project.category)}" class="btn btn-primary">
                <span>프로젝트 문의하기</span>
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;

    document.getElementById('portfolioDetailContent').innerHTML = html;
    document.getElementById('projectTitle').textContent = project.title;
    
    // 메인 이미지 변경 함수
    window.changeMainImage = function(newImage) {
        document.getElementById('mainImage').src = newImage;
    };
}

// 초기화
async function initPortfolioDetail() {
    const projectId = getProjectIdFromURL();
    
    if (!projectId) {
        document.getElementById('portfolioDetailContent').innerHTML = `
            <div class="error-state" style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h2>프로젝트 ID가 없습니다</h2>
                <p style="color: #666; margin-top: 16px;">포트폴리오 페이지에서 프로젝트를 선택해주세요.</p>
                <a href="portfolio.html" class="btn btn-primary" style="margin-top: 24px; display: inline-block;">포트폴리오로 돌아가기</a>
            </div>
        `;
        return;
    }

    const loaded = await loadPortfolioData();
    if (!loaded) {
        document.getElementById('portfolioDetailContent').innerHTML = `
            <div class="error-state" style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h2>데이터를 불러올 수 없습니다</h2>
                <p style="color: #666; margin-top: 16px;">포트폴리오 데이터를 불러오는 중 오류가 발생했습니다.</p>
                <a href="portfolio.html" class="btn btn-primary" style="margin-top: 24px; display: inline-block;">포트폴리오로 돌아가기</a>
            </div>
        `;
        return;
    }

    const project = findProject(projectId);
    displayPortfolioDetail(project);
}

// DOM 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioDetail);
} else {
    initPortfolioDetail();
}

