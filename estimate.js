const basePricingMatrix = {
    pension: { label: '펜션', setup: 12000000, perSqm: 130000 },
    cafe: { label: '대형카페', setup: 18000000, perSqm: 150000 },
    caravan: { label: '카라반', setup: 6000000, perSqm: 220000 },
    camping: { label: '캠핑장', setup: 20000000, perSqm: 90000 },
    outdoor: { label: '야외시설', setup: 8000000, perSqm: 110000 }
};

const finishMultipliers = {
    standard: { label: '스탠다드', multiplier: 1 },
    premium: { label: '프리미엄', multiplier: 1.2 },
    luxury: { label: '럭셔리', multiplier: 1.4 }
};

const extrasPricing = {
    lighting: { label: '조명 시스템', price: 4500000 },
    outdoor: { label: '야외 시설', price: 6500000 },
    furniture: { label: '맞춤 가구', price: 5200000 }
};

const recommendationMap = {
    pension: ['outdoor', 'lighting'],
    cafe: ['lighting', 'furniture'],
    caravan: ['furniture', 'lighting'],
    camping: ['outdoor', 'lighting'],
    outdoor: ['outdoor', 'accessories']
};

let productsCatalog = null;

document.addEventListener('DOMContentLoaded', () => {
    initEstimateCalculator();
});

async function initEstimateCalculator() {
    await loadProductsCatalog();
    const form = document.getElementById('estimateForm');
    if (form) {
        form.addEventListener('submit', handleEstimateSubmit);
    }
}

async function loadProductsCatalog() {
    try {
        const response = await fetch('data/products.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('제품 데이터를 불러오지 못했습니다.');
        const data = await response.json();
        productsCatalog = data.categories || null;
    } catch (error) {
        console.warn('추천 패키지 로드 실패:', error);
    }
}

function handleEstimateSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const projectType = form.querySelector('#estimateProjectType').value;
    const finishLevel = form.querySelector('#estimateFinish').value;
    const areaValue = Number(form.querySelector('#estimateArea').value);
    const extras = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);

    if (!projectType || !finishLevel || !areaValue || areaValue < 30) {
        showNotification('면적 30㎡ 이상을 입력해주세요.', 'error');
        return;
    }

    const pricingConfig = basePricingMatrix[projectType];
    const finishConfig = finishMultipliers[finishLevel];
    const areaCost = pricingConfig.perSqm * areaValue;
    const baseTotal = (pricingConfig.setup + areaCost) * finishConfig.multiplier;
    const extrasTotal = extras.reduce((sum, key) => sum + (extrasPricing[key]?.price || 0), 0);
    const total = baseTotal + extrasTotal;

    const lowEstimate = Math.round(total * 0.9);
    const highEstimate = Math.round(total * 1.1);

    renderEstimateResult({
        projectType,
        finishLevel,
        areaValue,
        extras,
        lowEstimate,
        highEstimate,
        baseTotal,
        extrasTotal
    });
}

function renderEstimateResult(result) {
    const resultContainer = document.getElementById('estimateResult');
    const valueNode = document.getElementById('estimateValue');
    const breakdownNode = document.getElementById('estimateBreakdown');
    const recommendationNode = document.getElementById('estimateRecommendations');

    if (!resultContainer || !valueNode || !breakdownNode) return;

    valueNode.textContent = `${formatCurrency(result.lowEstimate)} ~ ${formatCurrency(result.highEstimate)}`;
    breakdownNode.innerHTML = `
        <li><span>기본 설계 & 착수비</span><strong>${formatCurrency(basePricingMatrix[result.projectType].setup)}</strong></li>
        <li><span>면적 (${result.areaValue.toLocaleString()}㎡)</span><strong>${formatCurrency(basePricingMatrix[result.projectType].perSqm * result.areaValue)}</strong></li>
        <li><span>마감 수준 (${finishMultipliers[result.finishLevel].label})</span><strong>x${finishMultipliers[result.finishLevel].multiplier}</strong></li>
        <li><span>추가 패키지</span><strong>${result.extras.length ? formatCurrency(result.extras.reduce((sum, key) => sum + (extrasPricing[key]?.price || 0), 0)) : '선택 없음'}</strong></li>
    `;

    renderRecommendations(result.projectType, recommendationNode);

    resultContainer.hidden = false;
}

function renderRecommendations(projectType, container) {
    if (!container) return;

    const categories = recommendationMap[projectType] || [];
    if (!productsCatalog) {
        container.innerHTML = '<p>추천 패키지를 불러오지 못했습니다. 상담을 통해 상세 안내드립니다.</p>';
        return;
    }

    const cards = categories
        .map(category => {
            const products = (productsCatalog[category] || [])
                .slice()
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            if (!products.length) return null;
            const product = products[0];
            return `
                <div class="recommendation-card">
                    <span>${getCategoryDisplayName(category)}</span>
                    <h5>${product.name}</h5>
                    <p>${product.shortDescription || product.description || ''}</p>
                    <small>${formatCurrency(product.price)}부터</small>
                </div>
            `;
        })
        .filter(Boolean);

    container.innerHTML = cards.length ? cards.join('') : '<p>추천 패키지를 준비 중입니다.</p>';
}

function getCategoryDisplayName(category) {
    const map = {
        outdoor: '야외시설',
        lighting: '조명시스템',
        furniture: '가구',
        accessories: '액세서리'
    };
    return map[category] || category;
}

function formatCurrency(value) {
    if (isNaN(value)) return '-';
    return `₩${Math.round(value).toLocaleString('ko-KR')}`;
}

