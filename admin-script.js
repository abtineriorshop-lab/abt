// 관리자 대시보드 JavaScript - 모든 제품 페이지 완전 연동

// 전역 변수
let products = [];
let featuredProducts = []; // 인덱스 페이지에 표시될 대표 제품들
let currentEditingProduct = null;
let portfolioProjects = [];
let testimonials = [];
let currentEditingPortfolio = null;
let currentEditingTestimonial = null;
let leads = [];
let selectedProductIds = new Set();
let selectedLeadIds = new Set();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    initializeAdmin();
    loadAllProducts();
    await loadPortfolioProjects();
    await loadTestimonials();
    loadLeads();
    setupEventListeners();
    setupTabNavigation();
    displayProducts();
    displayFeaturedProducts();
    displayPortfolioProjects();
    displayTestimonials();
    displayLeads();
});

// 관리자 시스템 초기화
function initializeAdmin() {
    // 로그인 상태 확인
    if (!localStorage.getItem('adminLoggedIn') && !sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // 사용자 정보 표시
    const username = localStorage.getItem('adminUsername') || sessionStorage.getItem('adminUsername');
    if (username) {
        document.querySelectorAll('.admin-name').forEach(el => {
            el.textContent = username;
        });
    }
}

// 모든 제품 데이터 수집 (각 제품 페이지의 실제 데이터)
function loadAllProducts() {
    // 야외시설 제품들 (products-outdoor.html에서 수집)
    const outdoorProducts = [
        {
            id: 'gazebo-1',
            name: '클래식 야외정자',
            category: 'outdoor',
            subcategory: 'gazebo',
            price: 2500000,
            stock: 3,
            status: 'active',
            featured: true,
            badge: '인기',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '전통적인 디자인의 아름다운 야외정자로 자연과 조화로운 휴식 공간을 제공합니다.',
            shortDescription: '전통적인 디자인의 아름다운 야외정자로 자연과 조화로운 휴식 공간을 제공합니다.',
            size: '3m x 3m',
            material: '목재',
            features: ['고급 원목 소재', '방수 처리', '전문 설치', '10년 품질보증'],
            specs: {
                '크기': '3m x 3m x 2.5m',
                '재질': '고급 원목',
                '색상': '자연색, 스테인 처리',
                '설치': '전문 설치 포함',
                '보증': '10년 품질보증',
                'AS': '무상 AS 3년'
            },
            options: {
                '크기': ['3x3m', '4x4m', '5x5m'],
                '색상': ['자연색', '다크 브라운', '화이트'],
                '추가옵션': ['LED 조명', '모기장', '바닥재']
            }
        },
        {
            id: 'gazebo-2',
            name: '모던 야외정자',
            category: 'outdoor',
            subcategory: 'gazebo',
            price: 3200000,
            stock: 2,
            status: 'active',
            featured: true,
            badge: '',
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '현대적이고 세련된 디자인의 야외정자로 미니멀한 아름다움을 선사합니다.',
            shortDescription: '현대적이고 세련된 디자인의 야외정자로 미니멀한 아름다움을 선사합니다.',
            size: '4m x 4m',
            material: '목재+메탈',
            features: ['모던 디자인', '내구성 강화', '맞춤 제작', '5년 품질보증'],
            specs: {
                '크기': '4m x 4m x 3m',
                '재질': '알루미늄 + 목재',
                '색상': '다양한 컬러 옵션',
                '설치': '전문 설치 포함',
                '보증': '5년 품질보증',
                'AS': '무상 AS 2년'
            },
            options: {
                '크기': ['3x3m', '4x4m', '5x5m'],
                '재질': ['알루미늄', '목재', '혼합'],
                '추가옵션': ['지붕 패널', 'LED 조명', '커튼']
            }
        },
        {
            id: 'pergola-1',
            name: '클래식 파고라',
            category: 'outdoor',
            subcategory: 'pergola',
            price: 1800000,
            stock: 5,
            status: 'active',
            featured: true,
            badge: '신제품',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '정원의 아름다움을 더하는 클래식한 파고라로 로맨틱한 분위기를 연출합니다.',
            shortDescription: '정원의 아름다움을 더하는 클래식한 파고라로 로맨틱한 분위기를 연출합니다.',
            size: '2.5m x 3m',
            material: '목재',
            features: ['우아한 디자인', '내구성 강화', '맞춤 제작', '5년 품질보증'],
            specs: {
                '크기': '2.5m x 2.5m x 2.2m',
                '재질': '알루미늄 + 목재',
                '색상': '다양한 컬러 옵션',
                '설치': '전문 설치 포함',
                '보증': '5년 품질보증',
                'AS': '무상 AS 2년'
            },
            options: {
                '크기': ['2.5x2.5m', '3x3m', '4x4m'],
                '재질': ['알루미늄', '목재', '혼합'],
                '추가옵션': ['지붕 패널', 'LED 조명', '커튼']
            }
        },
        {
            id: 'pergola-2',
            name: '모던 파고라',
            category: 'outdoor',
            subcategory: 'pergola',
            price: 2200000,
            stock: 4,
            status: 'active',
            featured: true,
            badge: '',
            image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '현대적이고 기능적인 디자인의 파고라로 실용성과 아름다움을 동시에 제공합니다.',
            shortDescription: '현대적이고 기능적인 디자인의 파고라로 실용성과 아름다움을 동시에 제공합니다.',
            size: '3m x 4m',
            material: '알루미늄',
            features: ['모던 디자인', '내구성 강화', '맞춤 제작', '5년 품질보증'],
            specs: {
                '크기': '3m x 3m x 2.5m',
                '재질': '알루미늄 + 목재',
                '색상': '다양한 컬러 옵션',
                '설치': '전문 설치 포함',
                '보증': '5년 품질보증',
                'AS': '무상 AS 2년'
            },
            options: {
                '크기': ['2.5x2.5m', '3x3m', '4x4m'],
                '재질': ['알루미늄', '목재', '혼합'],
                '추가옵션': ['지붕 패널', 'LED 조명', '커튼']
            }
        },
        {
            id: 'terrace-1',
            name: '우드 테라스',
            category: 'outdoor',
            subcategory: 'terrace',
            price: 1500000,
            stock: 6,
            status: 'active',
            featured: true,
            badge: '',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '자연스러운 목재로 만든 따뜻한 느낌의 테라스로 편안한 야외 공간을 제공합니다.',
            shortDescription: '자연스러운 목재로 만든 따뜻한 느낌의 테라스로 편안한 야외 공간을 제공합니다.',
            size: '맞춤제작',
            material: '방부목',
            features: ['자연스러운 목재', '방수 처리', '전문 설치', '3년 품질보증'],
            specs: {
                '크기': '맞춤 제작',
                '재질': '고급 목재',
                '색상': '자연색, 스테인 처리',
                '설치': '전문 설치 포함',
                '보증': '3년 품질보증',
                'AS': '무상 AS 1년'
            },
            options: {
                '크기': ['맞춤 제작'],
                '색상': ['자연색', '다크 브라운', '화이트'],
                '추가옵션': ['방수 처리', '스테인 처리', 'LED 조명']
            }
        },
        {
            id: 'terrace-2',
            name: '스톤 테라스',
            category: 'outdoor',
            subcategory: 'terrace',
            price: 2000000,
            stock: 3,
            status: 'active',
            featured: true,
            badge: '',
            image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '고급스러운 석재로 만든 테라스로 세련되고 내구성이 뛰어난 야외 공간을 완성합니다.',
            shortDescription: '고급스러운 석재로 만든 테라스로 세련되고 내구성이 뛰어난 야외 공간을 완성합니다.',
            size: '맞춤제작',
            material: '천연석',
            features: ['고급 스톤 소재', '내구성 강화', '전문 설치', '5년 품질보증'],
            specs: {
                '크기': '맞춤 제작',
                '재질': '고급 스톤',
                '색상': '다양한 스톤 컬러',
                '설치': '전문 설치 포함',
                '보증': '5년 품질보증',
                'AS': '무상 AS 2년'
            },
            options: {
                '크기': ['맞춤 제작'],
                '재질': ['화강암', '대리석', '자연석'],
                '추가옵션': ['방수 처리', 'LED 조명', '가드레일']
            }
        },
        {
            id: 'deck-1',
            name: '컴포지트 데크',
            category: 'outdoor',
            subcategory: 'deck',
            price: 1200000,
            stock: 8,
            status: 'active',
            featured: true,
            badge: '',
            image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '내구성과 아름다움을 겸비한 컴포지트 데크로 관리가 쉬운 야외 공간을 만듭니다.',
            shortDescription: '내구성과 아름다움을 겸비한 컴포지트 데크로 관리가 쉬운 야외 공간을 만듭니다.',
            size: '맞춤제작',
            material: '내구성',
            features: ['컴포지트 소재', '내구성 강화', '전문 설치', '10년 품질보증'],
            specs: {
                '크기': '맞춤 제작',
                '재질': '컴포지트 데크',
                '색상': '다양한 컬러 옵션',
                '설치': '전문 설치 포함',
                '보증': '10년 품질보증',
                'AS': '무상 AS 3년'
            },
            options: {
                '크기': ['맞춤 제작'],
                '색상': ['자연색', '다크 브라운', '그레이'],
                '추가옵션': ['방수 처리', 'LED 조명', '가드레일']
            }
        },
        {
            id: 'fence-1',
            name: '우드 울타리',
            category: 'outdoor',
            subcategory: 'fence',
            price: 800000,
            stock: 10,
            status: 'active',
            featured: true,
            badge: '',
            image: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '자연스러운 목재 울타리로 프라이버시를 보호하면서도 아름다운 경계를 만들어줍니다.',
            shortDescription: '자연스러운 목재 울타리로 프라이버시를 보호하면서도 아름다운 경계를 만들어줍니다.',
            size: '맞춤제작',
            material: '방부목',
            features: ['자연스러운 목재', '방수 처리', '전문 설치', '3년 품질보증'],
            specs: {
                '크기': '맞춤 제작',
                '재질': '고급 목재',
                '색상': '자연색, 스테인 처리',
                '설치': '전문 설치 포함',
                '보증': '3년 품질보증',
                'AS': '무상 AS 1년'
            },
            options: {
                '크기': ['맞춤 제작'],
                '색상': ['자연색', '다크 브라운', '화이트'],
                '추가옵션': ['방수 처리', '스테인 처리', '게이트']
            }
        }
    ];

    // 가구 제품들 (products-furniture.html에서 수집)
    const furnitureProducts = [
        {
            id: 'seating-1',
            name: '모던 3인용 소파',
            category: 'furniture',
            subcategory: 'seating',
            price: 450000,
            stock: 15,
            status: 'active',
            featured: false,
            badge: '',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '세련된 디자인의 3인용 소파로 거실의 중심이 되는 편안한 휴식 공간을 제공합니다.',
            shortDescription: '세련된 디자인의 3인용 소파로 거실의 중심이 되는 편안한 휴식 공간을 제공합니다.',
            size: '210cm x 90cm',
            material: '원목+천',
            features: ['고품질 원목 프레임', '프리미엄 천 소재', '편안한 쿠션감', '다양한 컬러 옵션'],
            specs: {
                '크기': '210cm x 90cm x 85cm',
                '재질': '원목 프레임 + 프리미엄 천',
                '색상': '다양한 컬러 옵션',
                '설치': '전문 설치 포함',
                '보증': '3년 품질보증',
                'AS': '무상 AS 1년'
            },
            options: {
                '크기': ['2인용', '3인용', '4인용'],
                '색상': ['베이지', '그레이', '네이비', '브라운'],
                '재질': ['천', '가죽', '벨벳']
            }
        },
        {
            id: 'seating-2',
            name: '아크 체어',
            category: 'furniture',
            subcategory: 'seating',
            price: 280000,
            stock: 8,
            status: 'active',
            featured: false,
            badge: '',
            image: 'https://images.unsplash.com/photo-1503602642458-232111445657?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '우아한 곡선의 아크 체어로 공간에 세련미를 더하는 특별한 좌석을 제공합니다.',
            shortDescription: '우아한 곡선의 아크 체어로 공간에 세련미를 더하는 특별한 좌석을 제공합니다.',
            size: '60cm x 60cm',
            material: '원목',
            features: ['우아한 곡선 디자인', '인체공학적 설계', '고급 원목 소재', '스테인 컬러 옵션'],
            specs: {
                '크기': '60cm x 60cm x 80cm',
                '재질': '고급 원목',
                '색상': '자연색, 스테인 처리',
                '설치': '전문 설치 포함',
                '보증': '5년 품질보증',
                'AS': '무상 AS 2년'
            },
            options: {
                '크기': ['일반', '라운지', '바 스타일'],
                '색상': ['자연색', '다크 브라운', '화이트'],
                '재질': ['원목', '메탈', '혼합']
            }
        }
    ];

    // 조명 제품들 (products-lighting.html에서 수집)
    const lightingProducts = [
        {
            id: 'ambient-1',
            name: 'LED 스트링 라이트',
            category: 'lighting',
            subcategory: 'ambient',
            price: 150000,
            stock: 0,
            status: 'out-of-stock',
            featured: false,
            badge: '',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '분위기 있는 LED 조명으로 로맨틱하고 아름다운 야외 공간을 연출합니다.',
            shortDescription: '분위기 있는 LED 조명으로 로맨틱하고 아름다운 야외 공간을 연출합니다.',
            size: '10m, 20m, 30m',
            material: 'LED',
            features: ['LED 전구', '방수 기능', '원격 제어', '다양한 색상'],
            specs: {
                '길이': '10m, 20m, 30m',
                '전구 수': '50개, 100개, 150개',
                '전력': '12V 저전력',
                '방수등급': 'IP65',
                '보증': '2년 품질보증',
                'AS': '무상 AS 1년'
            },
            options: {
                '길이': ['10m', '20m', '30m'],
                '색상': ['따뜻한 화이트', '차가운 화이트', '멀티 컬러'],
                '제어': ['일반 스위치', '원격 제어', '스마트 앱']
            }
        }
    ];

    // 바닥재 제품들 (products-flooring.html에서 수집)
    const flooringProducts = [
        {
            id: 'wood-1',
            name: '오크 강화마루',
            category: 'flooring',
            subcategory: 'wood',
            price: 85000,
            stock: 50,
            status: 'active',
            featured: false,
            badge: '',
            image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '자연스러운 오크 나무 질감의 강화마루로 따뜻하고 고급스러운 바닥 인테리어를 완성합니다.',
            shortDescription: '자연스러운 오크 나무 질감의 강화마루로 따뜻하고 고급스러운 바닥 인테리어를 완성합니다.',
            size: '15mm',
            material: '오크',
            features: ['자연스러운 오크 질감', '15mm 두꺼운 판재', '스테인 컬러 옵션', '전문 설치 서비스'],
            specs: {
                '두께': '15mm',
                '재질': '오크 원목',
                '색상': '자연색, 스테인 처리',
                '설치': '전문 설치 포함',
                '보증': '10년 품질보증',
                'AS': '무상 AS 3년'
            },
            options: {
                '두께': ['12mm', '15mm', '18mm'],
                '색상': ['자연색', '다크 오크', '화이트 오크'],
                '마감': ['매트', '세미글로스', '글로스']
            }
        }
    ];

    // 벽재 제품들 (products-wall.html에서 수집)
    const wallProducts = [
        {
            id: 'wallpaper-1',
            name: '프리미엄 벽지',
            category: 'wall',
            subcategory: 'wallpaper',
            price: 45000,
            stock: 30,
            status: 'active',
            featured: false,
            badge: '',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '고급스러운 프리미엄 벽지로 세련된 벽면 인테리어를 완성합니다.',
            shortDescription: '고급스러운 프리미엄 벽지로 세련된 벽면 인테리어를 완성합니다.',
            size: '53cm x 10m',
            material: '프리미엄 종이',
            features: ['프리미엄 소재', '다양한 패턴', '쉬운 시공', '내구성 강화'],
            specs: {
                '크기': '53cm x 10m',
                '재질': '프리미엄 종이',
                '색상': '다양한 컬러 옵션',
                '설치': '전문 시공 포함',
                '보증': '5년 품질보증',
                'AS': '무상 AS 2년'
            },
            options: {
                '패턴': ['플라워', '지오메트릭', '텍스처'],
                '색상': ['화이트', '베이지', '그레이', '네이비'],
                '마감': ['매트', '세미글로스', '글로스']
            }
        }
    ];

    // 액세서리 제품들 (products-accessories.html에서 수집)
    const accessoriesProducts = [
        {
            id: 'decoration-1',
            name: '모던 장식품',
            category: 'accessories',
            subcategory: 'decoration',
            price: 120000,
            stock: 20,
            status: 'active',
            featured: false,
            badge: '',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
            description: '세련된 모던 장식품으로 공간에 포인트를 더하는 특별한 아이템입니다.',
            shortDescription: '세련된 모던 장식품으로 공간에 포인트를 더하는 특별한 아이템입니다.',
            size: '다양한 사이즈',
            material: '고급 소재',
            features: ['모던 디자인', '고급 소재', '다양한 컬러', '인테리어 포인트'],
            specs: {
                '크기': '다양한 사이즈',
                '재질': '고급 소재',
                '색상': '다양한 컬러 옵션',
                '설치': '간편 설치',
                '보증': '2년 품질보증',
                'AS': '무상 AS 1년'
            },
            options: {
                '크기': ['소형', '중형', '대형'],
                '색상': ['화이트', '블랙', '골드', '실버'],
                '재질': ['세라믹', '메탈', '유리']
            }
        }
    ];

    // 모든 제품 합치기
    products = [
        ...outdoorProducts,
        ...furnitureProducts,
        ...lightingProducts,
        ...flooringProducts,
        ...wallProducts,
        ...accessoriesProducts
    ];

    // 대표 제품 추출
    featuredProducts = products.filter(p => p.featured);

    // 웹페이지에 데이터 저장
    updateWebPageProducts();
}

// 웹페이지 제품 데이터 업데이트
function updateWebPageProducts() {
    // LocalStorage에 제품 데이터 저장 (웹페이지에서 사용)
    localStorage.setItem('brightFutureProducts', JSON.stringify(products));
    localStorage.setItem('brightFutureFeaturedProducts', JSON.stringify(featuredProducts));
    
    // 제품 데이터를 각 카테고리별로 분류하여 저장
    const categorizedProducts = {
        outdoor: products.filter(p => p.category === 'outdoor'),
        furniture: products.filter(p => p.category === 'furniture'),
        lighting: products.filter(p => p.category === 'lighting'),
        flooring: products.filter(p => p.category === 'flooring'),
        wall: products.filter(p => p.category === 'wall'),
        accessories: products.filter(p => p.category === 'accessories')
    };
    
    localStorage.setItem('brightFutureCategorizedProducts', JSON.stringify(categorizedProducts));
    
    console.log('웹페이지 제품 데이터가 업데이트되었습니다.');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 제품 추가 버튼
    document.getElementById('addProductBtn').addEventListener('click', function() {
        openProductModal();
    });

    // 모달 관련
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);

    // 제품 폼 제출
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });

    // 필터링
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('statusFilter').addEventListener('change', filterProducts);
    document.getElementById('searchInput').addEventListener('input', filterProducts);

    // 포트폴리오 관련
    const addPortfolioBtn = document.getElementById('addPortfolioBtn');
    if (addPortfolioBtn) {
        addPortfolioBtn.addEventListener('click', () => openPortfolioModal());
    }
    const portfolioModalClose = document.getElementById('portfolioModalClose');
    if (portfolioModalClose) {
        portfolioModalClose.addEventListener('click', () => closePortfolioModal());
    }
    const portfolioCancelBtn = document.getElementById('portfolioCancelBtn');
    if (portfolioCancelBtn) {
        portfolioCancelBtn.addEventListener('click', () => closePortfolioModal());
    }
    const portfolioForm = document.getElementById('portfolioForm');
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savePortfolio();
        });
    }
    const portfolioCategoryFilter = document.getElementById('portfolioCategoryFilter');
    if (portfolioCategoryFilter) {
        portfolioCategoryFilter.addEventListener('change', filterPortfolioProjects);
    }
    const portfolioHighlightFilter = document.getElementById('portfolioHighlightFilter');
    if (portfolioHighlightFilter) {
        portfolioHighlightFilter.addEventListener('change', filterPortfolioProjects);
    }
    const portfolioSearchInput = document.getElementById('portfolioSearchInput');
    if (portfolioSearchInput) {
        portfolioSearchInput.addEventListener('input', filterPortfolioProjects);
    }

    // 고객 후기 관련
    const addTestimonialBtn = document.getElementById('addTestimonialBtn');
    if (addTestimonialBtn) {
        addTestimonialBtn.addEventListener('click', () => openTestimonialModal());
    }
    const testimonialModalClose = document.getElementById('testimonialModalClose');
    if (testimonialModalClose) {
        testimonialModalClose.addEventListener('click', () => closeTestimonialModal());
    }
    const testimonialCancelBtn = document.getElementById('testimonialCancelBtn');
    if (testimonialCancelBtn) {
        testimonialCancelBtn.addEventListener('click', () => closeTestimonialModal());
    }
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveTestimonial();
        });
    }
    const testimonialStatusFilter = document.getElementById('testimonialStatusFilter');
    if (testimonialStatusFilter) {
        testimonialStatusFilter.addEventListener('change', filterTestimonials);
    }
    const testimonialProjectFilter = document.getElementById('testimonialProjectFilter');
    if (testimonialProjectFilter) {
        testimonialProjectFilter.addEventListener('change', filterTestimonials);
    }
    const testimonialSearchInput = document.getElementById('testimonialSearchInput');
    if (testimonialSearchInput) {
        testimonialSearchInput.addEventListener('input', filterTestimonials);
    }

    // 제품 모달 탭 전환
    const productModalTabBtns = document.querySelectorAll('.modal-tab-btn');
    productModalTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchProductModalTab(tab);
        });
    });

    // 제품 이미지 미리보기
    const productImageInput = document.getElementById('productImage');
    if (productImageInput) {
        productImageInput.addEventListener('input', () => {
            updateProductImagePreview();
        });
    }
    const productImagesInput = document.getElementById('productImages');
    if (productImagesInput) {
        productImagesInput.addEventListener('input', () => {
            updateProductImagesPreview();
        });
    }

    // 이미지 드래그 앤 드롭
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageFileInput = document.getElementById('imageFileInput');
    if (imageUploadArea && imageFileInput) {
        // 클릭하여 파일 선택
        imageUploadArea.addEventListener('click', () => {
            imageFileInput.click();
        });

        // 파일 선택
        imageFileInput.addEventListener('change', (e) => {
            handleImageFiles(Array.from(e.target.files));
        });

        // 드래그 앤 드롭
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.classList.add('drag-over');
        });

        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.classList.remove('drag-over');
        });

        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            handleImageFiles(files);
        });
    }

    // 포트폴리오 커버 이미지 미리보기
    const portfolioCoverInput = document.getElementById('portfolioCover');
    if (portfolioCoverInput) {
        portfolioCoverInput.addEventListener('input', () => {
            updatePortfolioCoverPreview();
        });
    }

    // 사양/옵션 입력 개선
    const addSpecRowBtn = document.getElementById('addSpecRowBtn');
    if (addSpecRowBtn) {
        addSpecRowBtn.addEventListener('click', addSpecRow);
    }
    const addOptionGroupBtn = document.getElementById('addOptionGroupBtn');
    if (addOptionGroupBtn) {
        addOptionGroupBtn.addEventListener('click', addOptionGroup);
    }

    // 문의/리드 관련
    const refreshLeadsBtn = document.getElementById('refreshLeadsBtn');
    if (refreshLeadsBtn) {
        refreshLeadsBtn.addEventListener('click', () => {
            loadLeads();
            displayLeads();
        });
    }
    const deleteSelectedLeadsBtn = document.getElementById('deleteSelectedLeadsBtn');
    if (deleteSelectedLeadsBtn) {
        deleteSelectedLeadsBtn.addEventListener('click', deleteSelectedLeads);
    }
    const leadStatusFilter = document.getElementById('leadStatusFilter');
    if (leadStatusFilter) {
        leadStatusFilter.addEventListener('change', filterLeads);
    }
    const leadProjectTypeFilter = document.getElementById('leadProjectTypeFilter');
    if (leadProjectTypeFilter) {
        leadProjectTypeFilter.addEventListener('change', filterLeads);
    }
    const leadSearchInput = document.getElementById('leadSearchInput');
    if (leadSearchInput) {
        leadSearchInput.addEventListener('input', filterLeads);
    }
    const leadDetailModalClose = document.getElementById('leadDetailModalClose');
    if (leadDetailModalClose) {
        leadDetailModalClose.addEventListener('click', () => closeLeadDetailModal());
    }
    const leadDetailCloseBtn = document.getElementById('leadDetailCloseBtn');
    if (leadDetailCloseBtn) {
        leadDetailCloseBtn.addEventListener('click', () => closeLeadDetailModal());
    }
    const leadStatusUpdateBtn = document.getElementById('leadStatusUpdateBtn');
    if (leadStatusUpdateBtn) {
        leadStatusUpdateBtn.addEventListener('click', updateLeadStatus);
    }

    // 대량 편집 관련
    const selectAllProducts = document.getElementById('selectAllProducts');
    if (selectAllProducts) {
        selectAllProducts.addEventListener('change', (e) => {
            toggleSelectAllProducts(e.target.checked);
        });
    }
    const bulkEditAction = document.getElementById('bulkEditAction');
    if (bulkEditAction) {
        bulkEditAction.addEventListener('change', (e) => {
            toggleBulkEditValueContainer(e.target.value);
        });
    }
    const applyBulkEditBtn = document.getElementById('applyBulkEditBtn');
    if (applyBulkEditBtn) {
        applyBulkEditBtn.addEventListener('click', applyBulkEdit);
    }
    const cancelBulkEditBtn = document.getElementById('cancelBulkEditBtn');
    if (cancelBulkEditBtn) {
        cancelBulkEditBtn.addEventListener('click', cancelBulkEdit);
    }
    const selectAllLeads = document.getElementById('selectAllLeads');
    if (selectAllLeads) {
        selectAllLeads.addEventListener('change', (e) => {
            toggleSelectAllLeads(e.target.checked);
        });
    }

    // 로그아웃
    document.getElementById('logoutLink').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

// 탭 네비게이션 설정
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

// 탭 전환
function switchTab(tabName) {
    // 탭 버튼 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // 탭 컨텐츠 표시
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const targetTab = document.getElementById(`${tabName}Tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // 통계 카드 업데이트
    updateStatsForTab(tabName);
}

// 제품 표시
function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.productId = product.id;
        row.innerHTML = `
            <td>
                <input type="checkbox" class="product-checkbox" value="${product.id}" onchange="toggleProductSelection('${product.id}', this.checked)">
            </td>
            <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.subcategory || '-'}</td>
            <td>₩${product.price.toLocaleString()}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.status}">${getStatusText(product.status)}</span></td>
            <td>
                <label class="featured-toggle">
                    <input type="checkbox" ${product.featured ? 'checked' : ''} onchange="toggleFeatured('${product.id}')">
                    <span class="toggle-label">대표</span>
                </label>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')" title="편집">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // 통계 업데이트
    updateStats();
}

// 대표 제품 표시
function displayFeaturedProducts() {
    const tbody = document.getElementById('featuredProductsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    featuredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.badge || '-'}</td>
            <td>₩${product.price.toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="removeFromFeatured('${product.id}')" title="대표 제품에서 제거">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 대표 제품 토글
function toggleFeatured(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.featured = !product.featured;
        
        // 대표 제품 배열 업데이트
        featuredProducts = products.filter(p => p.featured);
        
        // 웹페이지 데이터 업데이트
        updateWebPageProducts();
        
        // 대표 제품 테이블 업데이트
        displayFeaturedProducts();
        
        showNotification(
            product.featured ? '대표 제품으로 설정되었습니다.' : '대표 제품에서 제거되었습니다.', 
            'success'
        );
    }
}

// 대표 제품에서 제거
function removeFromFeatured(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.featured = false;
        featuredProducts = products.filter(p => p.featured);
        updateWebPageProducts();
        displayProducts();
        displayFeaturedProducts();
        showNotification('대표 제품에서 제거되었습니다.', 'success');
    }
}

// 통계 업데이트
function updateStats() {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const outOfStockProducts = products.filter(p => p.status === 'out-of-stock').length;
    const featuredCount = featuredProducts.length;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('activeProducts').textContent = activeProducts;
    document.getElementById('outOfStockProducts').textContent = outOfStockProducts;
    document.getElementById('featuredProducts').textContent = featuredCount;
}

// 카테고리 이름 변환
function getCategoryName(category) {
    const categoryNames = {
        'outdoor': '야외시설',
        'furniture': '가구',
        'lighting': '조명시스템',
        'flooring': '바닥재',
        'wall': '벽재',
        'accessories': '액세서리'
    };
    return categoryNames[category] || category;
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusTexts = {
        'active': '활성',
        'inactive': '비활성',
        'out-of-stock': '품절'
    };
    return statusTexts[status] || status;
}

// 제품 모달 열기
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        // 편집 모드
        const product = products.find(p => p.id === productId);
        if (product) {
            modalTitle.textContent = '제품 편집';
            currentEditingProduct = product;
            
            // 폼 필드 채우기
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productSubcategory').value = product.subcategory || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productStock').value = product.stock || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productShortDescription').value = product.shortDescription || '';
            document.getElementById('productSize').value = product.size || '';
            document.getElementById('productMaterial').value = product.material || '';
            document.getElementById('productBadge').value = product.badge || '';
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productStatus').value = product.status || 'active';
            document.getElementById('productFeatured').checked = product.featured || false;
            
            // 특징 (배열을 텍스트로 변환)
            document.getElementById('productFeatures').value = (product.features || []).join('\n');
            
            // 사양 (객체를 JSON 문자열로 변환)
            document.getElementById('productSpecs').value = JSON.stringify(product.specs || {}, null, 2);
            
            // 옵션 (객체를 JSON 문자열로 변환)
            document.getElementById('productOptions').value = JSON.stringify(product.options || {}, null, 2);
        }
    } else {
        // 추가 모드
        modalTitle.textContent = '새 제품 추가';
        currentEditingProduct = null;
        form.reset();
    }
    
    modal.classList.add('show');
}

// 제품 저장
function saveProduct() {
    const form = document.getElementById('productForm');
    
    // JSON 파싱 함수
    function parseJsonField(value, defaultValue = {}) {
        if (!value.trim()) return defaultValue;
        try {
            return JSON.parse(value);
        } catch (e) {
            showNotification('JSON 형식이 올바르지 않습니다.', 'error');
            return defaultValue;
        }
    }
    
    // 특징 배열 파싱
    function parseFeatures(value) {
        if (!value.trim()) return [];
        return value.split('\n').filter(feature => feature.trim());
    }
    
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        subcategory: document.getElementById('productSubcategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value,
        shortDescription: document.getElementById('productShortDescription').value,
        size: document.getElementById('productSize').value,
        material: document.getElementById('productMaterial').value,
        badge: document.getElementById('productBadge').value,
        image: document.getElementById('productImage').value,
        status: document.getElementById('productStatus').value,
        featured: document.getElementById('productFeatured').checked,
        features: parseFeatures(document.getElementById('productFeatures').value),
        specs: parseJsonField(document.getElementById('productSpecs').value),
        options: parseJsonField(document.getElementById('productOptions').value)
    };

    if (currentEditingProduct) {
        // 편집
        const index = products.findIndex(p => p.id === currentEditingProduct.id);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
            showNotification('제품이 성공적으로 수정되었습니다.', 'success');
        }
    } else {
        // 추가
        productData.id = 'product-' + Date.now();
        products.push(productData);
        showNotification('제품이 성공적으로 추가되었습니다.', 'success');
    }

    // 대표 제품 배열 업데이트
    featuredProducts = products.filter(p => p.featured);

    closeModal();
    displayProducts();
    displayFeaturedProducts();
    updateWebPageProducts();
}

// 제품 편집
function editProduct(productId) {
    openProductModal(productId);
}

// 제품 삭제
function deleteProduct(productId) {
    if (confirm('정말로 이 제품을 삭제하시겠습니까?')) {
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products.splice(index, 1);
            featuredProducts = products.filter(p => p.featured);
            showNotification('제품이 성공적으로 삭제되었습니다.', 'success');
            displayProducts();
            displayFeaturedProducts();
            updateWebPageProducts();
        }
    }
}

// 제품 필터링
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let filteredProducts = products;

    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (status) {
        filteredProducts = filteredProducts.filter(p => p.status === status);
    }

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    // 필터된 제품으로 테이블 업데이트
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.subcategory || '-'}</td>
            <td>₩${product.price.toLocaleString()}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.status}">${getStatusText(product.status)}</span></td>
            <td>
                <label class="featured-toggle">
                    <input type="checkbox" ${product.featured ? 'checked' : ''} onchange="toggleFeatured('${product.id}')">
                    <span class="toggle-label">대표</span>
                </label>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')" title="편집">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
    currentEditingProduct = null;
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 로그아웃
function logout() {
    localStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminUsername');
    window.location.href = 'admin-login.html';
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
    
    .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-badge.active {
        background: rgba(39, 174, 96, 0.1);
        color: #27ae60;
    }
    
    .status-badge.inactive {
        background: rgba(149, 165, 166, 0.1);
        color: #95a5a6;
    }
    
    .status-badge.out-of-stock {
        background: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
    }
    
    .featured-toggle {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
    }
    
    .featured-toggle input[type="checkbox"] {
        margin: 0;
    }
    
    .toggle-label {
        font-size: 12px;
        color: var(--dark-gray);
    }
`;
document.head.appendChild(style);

// ==================== 포트폴리오 관리 ====================

// 포트폴리오 프로젝트 로드
async function loadPortfolioProjects() {
    try {
        if (window.location.protocol === 'file:') {
            console.warn('로컬 서버를 실행해주세요.');
            return;
        }
        const response = await fetch('data/portfolio.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('포트폴리오 데이터를 불러오지 못했습니다.');
        const data = await response.json();
        portfolioProjects = data.projects || [];
    } catch (error) {
        console.error('포트폴리오 로드 오류:', error);
        portfolioProjects = [];
    }
}

// 포트폴리오 프로젝트 표시
function displayPortfolioProjects() {
    const grid = document.getElementById('portfolioGridAdmin');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (portfolioProjects.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--dark-gray);">포트폴리오 프로젝트가 없습니다.</p>';
        return;
    }
    
    portfolioProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'portfolio-card-admin';
        card.innerHTML = `
            <div class="portfolio-card-image">
                <img src="${project.cover || 'https://via.placeholder.com/300x200'}" alt="${project.title}">
                ${project.highlighted ? '<span class="highlight-badge">하이라이트</span>' : ''}
            </div>
            <div class="portfolio-card-content">
                <h4>${project.title}</h4>
                <p class="portfolio-card-meta">
                    <span>${getPortfolioCategoryName(project.category)}</span>
                    <span>${project.location}</span>
                    <span>${project.area}</span>
                </p>
                <p class="portfolio-card-description">${project.description.substring(0, 100)}...</p>
                <div class="portfolio-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="editPortfolio('${project.id}')">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePortfolio('${project.id}')">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 포트폴리오 카테고리 이름 변환
function getPortfolioCategoryName(category) {
    const map = {
        'pension': '펜션',
        'cafe': '대형카페',
        'caravan': '카라반',
        'camping': '캠핑장',
        'outdoor': '야외시설',
        'lighting': '조명시스템'
    };
    return map[category] || category;
}

// 포트폴리오 모달 열기
function openPortfolioModal(projectId = null) {
    const modal = document.getElementById('portfolioModal');
    const modalTitle = document.getElementById('portfolioModalTitle');
    const form = document.getElementById('portfolioForm');
    
    if (projectId) {
        const project = portfolioProjects.find(p => p.id === projectId);
        if (project) {
            modalTitle.textContent = '프로젝트 편집';
            currentEditingPortfolio = project;
            
            document.getElementById('portfolioTitle').value = project.title || '';
            document.getElementById('portfolioCategory').value = project.category || '';
            document.getElementById('portfolioLocation').value = project.location || '';
            document.getElementById('portfolioArea').value = project.area || '';
            document.getElementById('portfolioDuration').value = project.duration || '';
            document.getElementById('portfolioDescription').value = project.description || '';
            document.getElementById('portfolioTags').value = (project.tags || []).join(', ');
            document.getElementById('portfolioCover').value = project.cover || '';
            document.getElementById('portfolioImages').value = (project.images || []).join('\n');
            document.getElementById('portfolioProducts').value = (project.products || []).join(', ');
            document.getElementById('portfolioMetrics').value = JSON.stringify(project.metrics || {}, null, 2);
            document.getElementById('portfolioHighlighted').checked = project.highlighted || false;
            
            updatePortfolioCoverPreview();
        }
    } else {
        modalTitle.textContent = '새 프로젝트 추가';
        currentEditingPortfolio = null;
        form.reset();
        document.getElementById('portfolioCoverPreview').innerHTML = '';
    }
    
    modal.classList.add('show');
}

// 포트폴리오 저장
async function savePortfolio() {
    const form = document.getElementById('portfolioForm');
    
    function parseJsonField(value, defaultValue = {}) {
        if (!value.trim()) return defaultValue;
        try {
            return JSON.parse(value);
        } catch (e) {
            showNotification('JSON 형식이 올바르지 않습니다.', 'error');
            return defaultValue;
        }
    }
    
    const projectData = {
        title: document.getElementById('portfolioTitle').value,
        category: document.getElementById('portfolioCategory').value,
        location: document.getElementById('portfolioLocation').value,
        area: document.getElementById('portfolioArea').value,
        duration: document.getElementById('portfolioDuration').value,
        description: document.getElementById('portfolioDescription').value,
        tags: document.getElementById('portfolioTags').value.split(',').map(t => t.trim()).filter(t => t),
        cover: document.getElementById('portfolioCover').value,
        images: document.getElementById('portfolioImages').value.split('\n').map(url => url.trim()).filter(url => url),
        products: document.getElementById('portfolioProducts').value.split(',').map(p => p.trim()).filter(p => p),
        metrics: parseJsonField(document.getElementById('portfolioMetrics').value),
        highlighted: document.getElementById('portfolioHighlighted').checked
    };
    
    if (currentEditingPortfolio) {
        const index = portfolioProjects.findIndex(p => p.id === currentEditingPortfolio.id);
        if (index !== -1) {
            portfolioProjects[index] = { ...portfolioProjects[index], ...projectData };
            showNotification('프로젝트가 성공적으로 수정되었습니다.', 'success');
        }
    } else {
        projectData.id = 'project-' + Date.now();
        projectData.createdAt = new Date().toISOString().split('T')[0];
        portfolioProjects.push(projectData);
        showNotification('프로젝트가 성공적으로 추가되었습니다.', 'success');
    }
    
    projectData.updatedAt = new Date().toISOString().split('T')[0];
    
    closePortfolioModal();
    displayPortfolioProjects();
    await savePortfolioToFile();
}

// 포트폴리오 파일 저장
async function savePortfolioToFile() {
    try {
        const data = { projects: portfolioProjects };
        // 실제로는 서버 API를 통해 저장해야 하지만, 현재는 LocalStorage에 저장
        localStorage.setItem('brightFuturePortfolio', JSON.stringify(data));
        console.log('포트폴리오 데이터가 업데이트되었습니다.');
    } catch (error) {
        console.error('포트폴리오 저장 오류:', error);
    }
}

// 포트폴리오 편집
function editPortfolio(projectId) {
    openPortfolioModal(projectId);
}

// 포트폴리오 삭제
function deletePortfolio(projectId) {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
        const index = portfolioProjects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            portfolioProjects.splice(index, 1);
            showNotification('프로젝트가 성공적으로 삭제되었습니다.', 'success');
            displayPortfolioProjects();
            savePortfolioToFile();
        }
    }
}

// 포트폴리오 필터링
function filterPortfolioProjects() {
    const category = document.getElementById('portfolioCategoryFilter').value;
    const highlighted = document.getElementById('portfolioHighlightFilter').value;
    const searchTerm = document.getElementById('portfolioSearchInput').value.toLowerCase();
    
    let filtered = portfolioProjects;
    
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (highlighted !== '') {
        const isHighlighted = highlighted === 'true';
        filtered = filtered.filter(p => p.highlighted === isHighlighted);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    const grid = document.getElementById('portfolioGridAdmin');
    if (!grid) return;
    
    grid.innerHTML = '';
    filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'portfolio-card-admin';
        card.innerHTML = `
            <div class="portfolio-card-image">
                <img src="${project.cover || 'https://via.placeholder.com/300x200'}" alt="${project.title}">
                ${project.highlighted ? '<span class="highlight-badge">하이라이트</span>' : ''}
            </div>
            <div class="portfolio-card-content">
                <h4>${project.title}</h4>
                <p class="portfolio-card-meta">
                    <span>${getPortfolioCategoryName(project.category)}</span>
                    <span>${project.location}</span>
                    <span>${project.area}</span>
                </p>
                <p class="portfolio-card-description">${project.description.substring(0, 100)}...</p>
                <div class="portfolio-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="editPortfolio('${project.id}')">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePortfolio('${project.id}')">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 포트폴리오 모달 닫기
function closePortfolioModal() {
    const modal = document.getElementById('portfolioModal');
    modal.classList.remove('show');
    currentEditingPortfolio = null;
}

// 포트폴리오 커버 이미지 미리보기
function updatePortfolioCoverPreview() {
    const url = document.getElementById('portfolioCover').value;
    const preview = document.getElementById('portfolioCoverPreview');
    if (!preview) return;
    
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="커버 이미지 미리보기" style="max-width: 100%; max-height: 200px; margin-top: 10px; border-radius: 4px;">`;
    } else {
        preview.innerHTML = '';
    }
}

// ==================== 고객 후기 관리 ====================

// 고객 후기 로드
async function loadTestimonials() {
    try {
        if (window.location.protocol === 'file:') {
            console.warn('로컬 서버를 실행해주세요.');
            return;
        }
        const response = await fetch('data/testimonials.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('고객 후기 데이터를 불러오지 못했습니다.');
        const data = await response.json();
        testimonials = data.testimonials || [];
        updateTestimonialProjectFilter();
    } catch (error) {
        console.error('고객 후기 로드 오류:', error);
        testimonials = [];
    }
}

// 고객 후기 표시
function displayTestimonials() {
    const list = document.getElementById('testimonialsListAdmin');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (testimonials.length === 0) {
        list.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--dark-gray);">고객 후기가 없습니다.</p>';
        return;
    }
    
    testimonials.forEach(testimonial => {
        const card = document.createElement('div');
        card.className = 'testimonial-card-admin';
        const statusClass = testimonial.status === 'approved' ? 'approved' : testimonial.status === 'rejected' ? 'rejected' : 'pending';
        card.innerHTML = `
            <div class="testimonial-card-header">
                <div class="testimonial-author-info">
                    <h4>${testimonial.authorName}</h4>
                    <span class="testimonial-author-title">${testimonial.authorTitle || ''}</span>
                </div>
                <div class="testimonial-meta">
                    <span class="status-badge ${statusClass}">${getTestimonialStatusText(testimonial.status)}</span>
                    ${testimonial.rating ? `<div class="testimonial-rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>` : ''}
                </div>
            </div>
            <div class="testimonial-card-content">
                <p>${testimonial.content}</p>
            </div>
            <div class="testimonial-card-footer">
                <span class="testimonial-project">프로젝트: ${testimonial.projectId ? testimonial.projectId : '없음'}</span>
                <div class="testimonial-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="editTestimonial('${testimonial.id}')">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    ${testimonial.status !== 'approved' ? `<button class="btn btn-sm btn-success" onclick="approveTestimonial('${testimonial.id}')">
                        <i class="fas fa-check"></i> 승인
                    </button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteTestimonial('${testimonial.id}')">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

// 고객 후기 상태 텍스트
function getTestimonialStatusText(status) {
    const map = {
        'approved': '승인됨',
        'pending': '대기 중',
        'rejected': '거부됨'
    };
    return map[status] || status;
}

// 고객 후기 모달 열기
function openTestimonialModal(testimonialId = null) {
    const modal = document.getElementById('testimonialModal');
    const modalTitle = document.getElementById('testimonialModalTitle');
    const form = document.getElementById('testimonialForm');
    
    // 프로젝트 선택 옵션 업데이트
    updateTestimonialProjectOptions();
    
    if (testimonialId) {
        const testimonial = testimonials.find(t => t.id === testimonialId);
        if (testimonial) {
            modalTitle.textContent = '후기 편집';
            currentEditingTestimonial = testimonial;
            
            document.getElementById('testimonialAuthorName').value = testimonial.authorName || '';
            document.getElementById('testimonialAuthorTitle').value = testimonial.authorTitle || '';
            document.getElementById('testimonialContent').value = testimonial.content || '';
            document.getElementById('testimonialRating').value = testimonial.rating || 5;
            document.getElementById('testimonialProjectId').value = testimonial.projectId || '';
            document.getElementById('testimonialStatus').value = testimonial.status || 'pending';
            document.getElementById('testimonialOrder').value = testimonial.order || 1;
        }
    } else {
        modalTitle.textContent = '새 후기 추가';
        currentEditingTestimonial = null;
        form.reset();
        document.getElementById('testimonialStatus').value = 'pending';
        document.getElementById('testimonialRating').value = 5;
        document.getElementById('testimonialOrder').value = 1;
    }
    
    modal.classList.add('show');
}

// 고객 후기 프로젝트 옵션 업데이트
function updateTestimonialProjectOptions() {
    const select = document.getElementById('testimonialProjectId');
    if (!select) return;
    
    // 기존 옵션 제거 (첫 번째 "선택 안 함" 제외)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    portfolioProjects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.title;
        select.appendChild(option);
    });
}

// 고객 후기 프로젝트 필터 옵션 업데이트
function updateTestimonialProjectFilter() {
    const select = document.getElementById('testimonialProjectFilter');
    if (!select) return;
    
    // 기존 옵션 제거 (첫 번째 "전체" 제외)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    portfolioProjects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.title;
        select.appendChild(option);
    });
}

// 고객 후기 저장
async function saveTestimonial() {
    const form = document.getElementById('testimonialForm');
    
    const testimonialData = {
        authorName: document.getElementById('testimonialAuthorName').value,
        authorTitle: document.getElementById('testimonialAuthorTitle').value,
        content: document.getElementById('testimonialContent').value,
        rating: parseInt(document.getElementById('testimonialRating').value),
        projectId: document.getElementById('testimonialProjectId').value || null,
        status: document.getElementById('testimonialStatus').value,
        order: parseInt(document.getElementById('testimonialOrder').value)
    };
    
    if (currentEditingTestimonial) {
        const index = testimonials.findIndex(t => t.id === currentEditingTestimonial.id);
        if (index !== -1) {
            testimonials[index] = { ...testimonials[index], ...testimonialData };
            testimonials[index].updatedAt = new Date().toISOString().split('T')[0];
            showNotification('후기가 성공적으로 수정되었습니다.', 'success');
        }
    } else {
        testimonialData.id = 'testimonial-' + Date.now();
        testimonialData.createdAt = new Date().toISOString().split('T')[0];
        testimonialData.updatedAt = testimonialData.createdAt;
        testimonials.push(testimonialData);
        showNotification('후기가 성공적으로 추가되었습니다.', 'success');
    }
    
    closeTestimonialModal();
    displayTestimonials();
    await saveTestimonialsToFile();
}

// 고객 후기 파일 저장
async function saveTestimonialsToFile() {
    try {
        const data = { testimonials: testimonials };
        localStorage.setItem('brightFutureTestimonials', JSON.stringify(data));
        console.log('고객 후기 데이터가 업데이트되었습니다.');
    } catch (error) {
        console.error('고객 후기 저장 오류:', error);
    }
}

// 고객 후기 편집
function editTestimonial(testimonialId) {
    openTestimonialModal(testimonialId);
}

// 고객 후기 승인
function approveTestimonial(testimonialId) {
    const testimonial = testimonials.find(t => t.id === testimonialId);
    if (testimonial) {
        testimonial.status = 'approved';
        testimonial.updatedAt = new Date().toISOString().split('T')[0];
        showNotification('후기가 승인되었습니다.', 'success');
        displayTestimonials();
        saveTestimonialsToFile();
    }
}

// 고객 후기 삭제
function deleteTestimonial(testimonialId) {
    if (confirm('정말로 이 후기를 삭제하시겠습니까?')) {
        const index = testimonials.findIndex(t => t.id === testimonialId);
        if (index !== -1) {
            testimonials.splice(index, 1);
            showNotification('후기가 성공적으로 삭제되었습니다.', 'success');
            displayTestimonials();
            saveTestimonialsToFile();
        }
    }
}

// 고객 후기 필터링
function filterTestimonials() {
    const status = document.getElementById('testimonialStatusFilter').value;
    const projectId = document.getElementById('testimonialProjectFilter').value;
    const searchTerm = document.getElementById('testimonialSearchInput').value.toLowerCase();
    
    let filtered = testimonials;
    
    if (status) {
        filtered = filtered.filter(t => t.status === status);
    }
    
    if (projectId) {
        filtered = filtered.filter(t => t.projectId === projectId);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.authorName.toLowerCase().includes(searchTerm) ||
            t.content.toLowerCase().includes(searchTerm)
        );
    }
    
    const list = document.getElementById('testimonialsListAdmin');
    if (!list) return;
    
    list.innerHTML = '';
    filtered.forEach(testimonial => {
        const card = document.createElement('div');
        card.className = 'testimonial-card-admin';
        const statusClass = testimonial.status === 'approved' ? 'approved' : testimonial.status === 'rejected' ? 'rejected' : 'pending';
        card.innerHTML = `
            <div class="testimonial-card-header">
                <div class="testimonial-author-info">
                    <h4>${testimonial.authorName}</h4>
                    <span class="testimonial-author-title">${testimonial.authorTitle || ''}</span>
                </div>
                <div class="testimonial-meta">
                    <span class="status-badge ${statusClass}">${getTestimonialStatusText(testimonial.status)}</span>
                    ${testimonial.rating ? `<div class="testimonial-rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>` : ''}
                </div>
            </div>
            <div class="testimonial-card-content">
                <p>${testimonial.content}</p>
            </div>
            <div class="testimonial-card-footer">
                <span class="testimonial-project">프로젝트: ${testimonial.projectId ? testimonial.projectId : '없음'}</span>
                <div class="testimonial-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="editTestimonial('${testimonial.id}')">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    ${testimonial.status !== 'approved' ? `<button class="btn btn-sm btn-success" onclick="approveTestimonial('${testimonial.id}')">
                        <i class="fas fa-check"></i> 승인
                    </button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteTestimonial('${testimonial.id}')">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

// 고객 후기 모달 닫기
function closeTestimonialModal() {
    const modal = document.getElementById('testimonialModal');
    modal.classList.remove('show');
    currentEditingTestimonial = null;
}

// ==================== 제품 모달 고급화 ====================

// 제품 모달 탭 전환
function switchProductModalTab(tabName) {
    // 탭 버튼 활성화
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // 탭 컨텐츠 표시
    document.querySelectorAll('.modal-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const targetTab = document.getElementById(`productTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// 제품 이미지 미리보기
function updateProductImagePreview() {
    const url = document.getElementById('productImage').value;
    const preview = document.getElementById('productImagePreview');
    if (!preview) return;
    
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="제품 이미지 미리보기" style="max-width: 100%; max-height: 200px; margin-top: 10px; border-radius: 4px;">`;
    } else {
        preview.innerHTML = '';
    }
}

// 제품 이미지들 미리보기
let productImageUrls = [];

function updateProductImagesPreview() {
    const urls = document.getElementById('productImages').value.split('\n').map(url => url.trim()).filter(url => url);
    productImageUrls = urls;
    renderProductImagesPreview();
}

function renderProductImagesPreview() {
    const preview = document.getElementById('productImagesPreview');
    if (!preview) return;
    
    preview.innerHTML = '';
    productImageUrls.forEach((url, index) => {
        const img = document.createElement('div');
        img.className = 'image-preview-item sortable-item';
        img.draggable = true;
        img.dataset.index = index;
        img.innerHTML = `
            <div class="image-preview-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <img src="${url}" alt="이미지 ${index + 1}">
            <button type="button" class="btn btn-sm btn-danger remove-image-btn" onclick="removeProductImage(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 드래그 이벤트
        img.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', index);
            img.classList.add('dragging');
        });
        
        img.addEventListener('dragend', () => {
            img.classList.remove('dragging');
        });
        
        img.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const afterElement = getDragAfterElement(preview, e.clientY);
            if (afterElement == null) {
                preview.appendChild(img);
            } else {
                preview.insertBefore(img, afterElement);
            }
        });
        
        preview.appendChild(img);
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.image-preview-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 이미지 파일 처리
function handleImageFiles(files) {
    if (files.length === 0) return;
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Base64로 변환하여 추가
                const base64Url = e.target.result;
                if (productImageUrls.length < 10) {
                    productImageUrls.push(base64Url);
                    updateProductImagesTextarea();
                    renderProductImagesPreview();
                } else {
                    showNotification('최대 10개의 이미지만 추가할 수 있습니다.', 'warning');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// 이미지 제거
function removeProductImage(index) {
    productImageUrls.splice(index, 1);
    updateProductImagesTextarea();
    renderProductImagesPreview();
}

// 이미지 텍스트 영역 업데이트
function updateProductImagesTextarea() {
    const textarea = document.getElementById('productImages');
    if (textarea) {
        // URL만 필터링 (Base64는 제외)
        const urls = productImageUrls.filter(url => url.startsWith('http'));
        textarea.value = urls.join('\n');
    }
}

// 사양 행 추가
function addSpecRow() {
    const container = document.getElementById('productSpecsContainer');
    if (!container) return;
    
    const row = document.createElement('div');
    row.className = 'key-value-row';
    row.innerHTML = `
        <input type="text" class="key-input" placeholder="키 (예: 크기)">
        <input type="text" class="value-input" placeholder="값 (예: 3m x 3m x 2.5m)">
        <button type="button" class="btn btn-sm btn-danger remove-row-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    row.querySelector('.remove-row-btn').addEventListener('click', () => {
        row.remove();
    });
    
    container.appendChild(row);
}

// 옵션 그룹 추가
function addOptionGroup() {
    const container = document.getElementById('productOptionsContainer');
    if (!container) return;
    
    const group = document.createElement('div');
    group.className = 'option-group';
    group.innerHTML = `
        <div class="option-group-header">
            <input type="text" class="option-category-input" placeholder="옵션 카테고리 (예: 크기)">
            <button type="button" class="btn btn-sm btn-danger remove-option-group-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="option-values">
            <input type="text" class="option-value-input" placeholder="옵션 값 (예: 3x3m)">
            <button type="button" class="btn btn-sm btn-secondary add-option-value-btn">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    group.querySelector('.remove-option-group-btn').addEventListener('click', () => {
        group.remove();
    });
    
    group.querySelector('.add-option-value-btn').addEventListener('click', () => {
        const valuesContainer = group.querySelector('.option-values');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'option-value-input';
        input.placeholder = '옵션 값';
        valuesContainer.insertBefore(input, valuesContainer.lastElementChild);
    });
    
    container.appendChild(group);
}

// 제품 저장 시 사양/옵션 데이터 변환
function getProductSpecsFromForm() {
    const container = document.getElementById('productSpecsContainer');
    if (!container) return {};
    
    const specs = {};
    container.querySelectorAll('.key-value-row').forEach(row => {
        const key = row.querySelector('.key-input').value.trim();
        const value = row.querySelector('.value-input').value.trim();
        if (key && value) {
            specs[key] = value;
        }
    });
    
    // JSON 입력도 확인
    const jsonInput = document.getElementById('productSpecs').value.trim();
    if (jsonInput) {
        try {
            const jsonSpecs = JSON.parse(jsonInput);
            return { ...specs, ...jsonSpecs };
        } catch (e) {
            console.warn('JSON 파싱 실패, 키-값 쌍만 사용');
        }
    }
    
    return specs;
}

function getProductOptionsFromForm() {
    const container = document.getElementById('productOptionsContainer');
    if (!container) return {};
    
    const options = {};
    container.querySelectorAll('.option-group').forEach(group => {
        const category = group.querySelector('.option-category-input').value.trim();
        if (category) {
            const values = [];
            group.querySelectorAll('.option-value-input').forEach(input => {
                const value = input.value.trim();
                if (value) {
                    values.push(value);
                }
            });
            if (values.length > 0) {
                options[category] = values;
            }
        }
    });
    
    // JSON 입력도 확인
    const jsonInput = document.getElementById('productOptions').value.trim();
    if (jsonInput) {
        try {
            const jsonOptions = JSON.parse(jsonInput);
            return { ...options, ...jsonOptions };
        } catch (e) {
            console.warn('JSON 파싱 실패, 그룹 입력만 사용');
        }
    }
    
    return options;
}

// 제품 저장 함수 수정 (기존 saveProduct 함수 업데이트)
const originalSaveProduct = saveProduct;
function saveProduct() {
    // 기존 로직 실행 전에 사양/옵션 데이터 변환
    const specs = getProductSpecsFromForm();
    const options = getProductOptionsFromForm();
    
    // 이미지 배열 처리
    const urlImages = document.getElementById('productImages').value.split('\n').map(url => url.trim()).filter(url => url);
    const allImages = [...productImageUrls, ...urlImages.filter(url => !productImageUrls.includes(url))].slice(0, 10);
    const mainImage = document.getElementById('productImage').value || (allImages.length > 0 ? allImages[0] : '');
    
    // 기존 saveProduct 로직 수정
    const form = document.getElementById('productForm');
    
    function parseJsonField(value, defaultValue = {}) {
        if (!value.trim()) return defaultValue;
        try {
            return JSON.parse(value);
        } catch (e) {
            showNotification('JSON 형식이 올바르지 않습니다.', 'error');
            return defaultValue;
        }
    }
    
    function parseFeatures(value) {
        if (!value.trim()) return [];
        return value.split('\n').filter(feature => feature.trim());
    }
    
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        subcategory: document.getElementById('productSubcategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value,
        shortDescription: document.getElementById('productShortDescription').value,
        size: document.getElementById('productSize').value,
        material: document.getElementById('productMaterial').value,
        badge: document.getElementById('productBadge').value,
        image: mainImage,
        images: allImages,
        status: document.getElementById('productStatus').value,
        featured: document.getElementById('productFeatured').checked,
        features: parseFeatures(document.getElementById('productFeatures').value),
        specs: Object.keys(specs).length > 0 ? specs : parseJsonField(document.getElementById('productSpecs').value),
        options: Object.keys(options).length > 0 ? options : parseJsonField(document.getElementById('productOptions').value)
    };

    if (currentEditingProduct) {
        const index = products.findIndex(p => p.id === currentEditingProduct.id);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
            showNotification('제품이 성공적으로 수정되었습니다.', 'success');
        }
    } else {
        productData.id = 'product-' + Date.now();
        products.push(productData);
        showNotification('제품이 성공적으로 추가되었습니다.', 'success');
    }

    featuredProducts = products.filter(p => p.featured);

    closeModal();
    displayProducts();
    displayFeaturedProducts();
    updateWebPageProducts();
}

// 통계 업데이트 (탭별)
function updateStatsForTab(tabName) {
    if (tabName === 'products') {
        updateStats();
    } else if (tabName === 'portfolio') {
        // 포트폴리오 통계는 필요시 추가
    } else if (tabName === 'testimonials') {
        // 고객 후기 통계는 필요시 추가
    }
}

// 제품 모달 열기 함수 수정 (이미지 배열 처리)
const originalOpenProductModal = openProductModal;
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            modalTitle.textContent = '제품 편집';
            currentEditingProduct = product;
            
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productSubcategory').value = product.subcategory || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productStock').value = product.stock || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productShortDescription').value = product.shortDescription || '';
            document.getElementById('productSize').value = product.size || '';
            document.getElementById('productMaterial').value = product.material || '';
            document.getElementById('productBadge').value = product.badge || '';
            document.getElementById('productImage').value = product.image || '';
            productImageUrls = product.images || [];
            document.getElementById('productImages').value = productImageUrls.filter(url => url.startsWith('http')).join('\n');
            renderProductImagesPreview();
            document.getElementById('productStatus').value = product.status || 'active';
            document.getElementById('productFeatured').checked = product.featured || false;
            
            document.getElementById('productFeatures').value = (product.features || []).join('\n');
            document.getElementById('productSpecs').value = JSON.stringify(product.specs || {}, null, 2);
            document.getElementById('productOptions').value = JSON.stringify(product.options || {}, null, 2);
            
            // 사양/옵션 폼 채우기
            populateSpecsForm(product.specs || {});
            populateOptionsForm(product.options || {});
            
            updateProductImagePreview();
            updateProductImagesPreview();
        }
    } else {
        modalTitle.textContent = '새 제품 추가';
        currentEditingProduct = null;
        form.reset();
        productImageUrls = [];
        document.getElementById('productImagesPreview').innerHTML = '';
        document.getElementById('productSpecsContainer').innerHTML = `
            <div class="key-value-row">
                <input type="text" class="key-input" placeholder="키 (예: 크기)">
                <input type="text" class="value-input" placeholder="값 (예: 3m x 3m x 2.5m)">
                <button type="button" class="btn btn-sm btn-danger remove-row-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.getElementById('productOptionsContainer').innerHTML = `
            <div class="option-group">
                <div class="option-group-header">
                    <input type="text" class="option-category-input" placeholder="옵션 카테고리 (예: 크기)">
                    <button type="button" class="btn btn-sm btn-danger remove-option-group-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="option-values">
                    <input type="text" class="option-value-input" placeholder="옵션 값 (예: 3x3m)">
                    <button type="button" class="btn btn-sm btn-secondary add-option-value-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        switchProductModalTab('basic');
    }
    
    modal.classList.add('show');
}

// 사양 폼 채우기
function populateSpecsForm(specs) {
    const container = document.getElementById('productSpecsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    Object.entries(specs).forEach(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'key-value-row';
        row.innerHTML = `
            <input type="text" class="key-input" value="${key}" placeholder="키">
            <input type="text" class="value-input" value="${value}" placeholder="값">
            <button type="button" class="btn btn-sm btn-danger remove-row-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
        container.appendChild(row);
    });
}

// 옵션 폼 채우기
function populateOptionsForm(options) {
    const container = document.getElementById('productOptionsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    Object.entries(options).forEach(([category, values]) => {
        const group = document.createElement('div');
        group.className = 'option-group';
        const valuesHtml = Array.isArray(values) 
            ? values.map(v => `<input type="text" class="option-value-input" value="${v}" placeholder="옵션 값">`).join('')
            : '';
        group.innerHTML = `
            <div class="option-group-header">
                <input type="text" class="option-category-input" value="${category}" placeholder="옵션 카테고리">
                <button type="button" class="btn btn-sm btn-danger remove-option-group-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="option-values">
                ${valuesHtml}
                <button type="button" class="btn btn-sm btn-secondary add-option-value-btn">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        group.querySelector('.remove-option-group-btn').addEventListener('click', () => group.remove());
        group.querySelector('.add-option-value-btn').addEventListener('click', () => {
            const valuesContainer = group.querySelector('.option-values');
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'option-value-input';
            input.placeholder = '옵션 값';
            valuesContainer.insertBefore(input, valuesContainer.lastElementChild);
        });
        container.appendChild(group);
    });
}

// ==================== 문의/리드 관리 ====================

// 문의/리드 로드 - Firebase만 사용
async function loadLeads() {
    try {
        // Firebase 연결 확인
        if (!window.firebaseInitialized || !window.firebaseDb) {
            console.warn('⚠️ Firebase가 초기화되지 않았습니다. 잠시 후 다시 시도합니다...');
            // 2초 후 재시도
            setTimeout(() => {
                if (window.firebaseInitialized && window.firebaseDb) {
                    loadLeads();
                } else {
                    console.error('❌ Firebase 연결 실패');
                    leads = [];
                    displayLeads();
                }
            }, 2000);
            return;
        }

        try {
            const querySnapshot = await window.firebaseDb.collection('leads')
                .orderBy('createdAt', 'desc')
                .get();
            
            leads = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                leads.push({
                    id: doc.id,
                    ...data
                });
            });
            
            console.log('✅ Firebase에서 문의 로드 완료:', leads.length, '개');
            displayLeads(); // 문의 목록 표시
        } catch (firebaseError) {
            console.error('❌ Firebase 로드 실패:', firebaseError);
            console.error('오류 상세:', firebaseError.code, firebaseError.message);
            if (firebaseError.code === 'permission-denied') {
                console.warn('⚠️ Firestore 보안 규칙을 확인해주세요.');
                showNotification('Firestore 보안 규칙을 확인해주세요.', 'error');
            }
            leads = [];
            displayLeads(); // 빈 목록이라도 표시
        }
        
        // 상태가 없는 경우 'new'로 설정
        leads.forEach(lead => {
            if (!lead.status) {
                lead.status = 'new';
            }
            if (!lead.id) {
                lead.id = lead.createdAt || Date.now().toString();
            }
        });
    } catch (error) {
        console.error('❌ 문의 로드 오류:', error);
        leads = [];
    }
}

// 문의/리드 표시
function displayLeads() {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--dark-gray);">문의가 없습니다.</td></tr>';
        return;
    }
    
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.dataset.leadId = lead.id || lead.createdAt;
        const date = new Date(lead.createdAt);
        const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const statusClass = lead.status === 'completed' ? 'completed' : lead.status === 'in-progress' ? 'in-progress' : lead.status === 'archived' ? 'archived' : 'new';
        row.innerHTML = `
            <td>
                <input type="checkbox" class="lead-checkbox" value="${lead.id || lead.createdAt}" onchange="toggleLeadSelection('${lead.id || lead.createdAt}', this.checked)">
            </td>
            <td>${formattedDate}</td>
            <td><strong>${lead.name || lead.이름 || '-'}</strong></td>
            <td>
                <div>${lead.email || lead.이메일 || '-'}</div>
                <div style="font-size: 12px; color: var(--dark-gray);">${lead.phone || lead.전화번호 || lead.phoneNumber || '-'}</div>
            </td>
            <td>${lead.projectType || lead.프로젝트유형 || '-'}</td>
            <td>${lead.product || lead.제품 || '-'}</td>
            <td><span class="status-badge ${statusClass}">${getLeadStatusText(lead.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewLeadDetail('${lead.id || lead.createdAt}')" title="상세보기">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteLead('${lead.id || lead.createdAt}')" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 문의 상태 텍스트
function getLeadStatusText(status) {
    const map = {
        'new': '신규',
        'in-progress': '진행중',
        'completed': '완료',
        'archived': '보관'
    };
    return map[status] || '신규';
}

// 문의 상세 보기
function viewLeadDetail(leadId) {
    const lead = leads.find(l => (l.id || l.createdAt) === leadId);
    if (!lead) return;
    
    const modal = document.getElementById('leadDetailModal');
    const content = document.getElementById('leadDetailContent');
    const modalTitle = document.getElementById('leadDetailModalTitle');
    
    modalTitle.textContent = `문의 상세 - ${lead.name || lead.이름 || '익명'}`;
    
    const date = new Date(lead.createdAt);
    const formattedDate = date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    content.innerHTML = `
        <div class="lead-detail-section">
            <h4>기본 정보</h4>
            <div class="lead-detail-grid">
                <div class="lead-detail-item">
                    <label>이름</label>
                    <div>${lead.name || lead.이름 || '-'}</div>
                </div>
                <div class="lead-detail-item">
                    <label>이메일</label>
                    <div><a href="mailto:${lead.email || lead.이메일 || ''}">${lead.email || lead.이메일 || '-'}</a></div>
                </div>
                <div class="lead-detail-item">
                    <label>전화번호</label>
                    <div><a href="tel:${lead.phone || lead.전화번호 || lead.phoneNumber || ''}">${lead.phone || lead.전화번호 || lead.phoneNumber || '-'}</a></div>
                </div>
                <div class="lead-detail-item">
                    <label>프로젝트 유형</label>
                    <div>${lead.projectType || lead.프로젝트유형 || '-'}</div>
                </div>
                <div class="lead-detail-item">
                    <label>제품</label>
                    <div>${lead.product || lead.제품 || '-'}</div>
                </div>
                <div class="lead-detail-item">
                    <label>상태</label>
                    <select id="leadDetailStatus" class="form-input">
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>신규</option>
                        <option value="in-progress" ${lead.status === 'in-progress' ? 'selected' : ''}>진행중</option>
                        <option value="completed" ${lead.status === 'completed' ? 'selected' : ''}>완료</option>
                        <option value="archived" ${lead.status === 'archived' ? 'selected' : ''}>보관</option>
                    </select>
                </div>
                <div class="lead-detail-item">
                    <label>접수일시</label>
                    <div>${formattedDate}</div>
                </div>
            </div>
        </div>
        <div class="lead-detail-section">
            <h4>문의 내용</h4>
            <div class="lead-detail-message">
                ${(lead.message || lead.문의내용 || lead.내용 || '-').replace(/\n/g, '<br>')}
            </div>
        </div>
        ${lead.notes ? `
        <div class="lead-detail-section">
            <h4>메모</h4>
            <textarea id="leadDetailNotes" class="form-input" rows="3">${lead.notes}</textarea>
        </div>
        ` : `
        <div class="lead-detail-section">
            <h4>메모</h4>
            <textarea id="leadDetailNotes" class="form-input" rows="3" placeholder="메모를 입력하세요..."></textarea>
        </div>
        `}
    `;
    
    modal.dataset.currentLeadId = leadId;
    modal.classList.add('show');
}

// 문의 상태 업데이트
async function updateLeadStatus() {
    const modal = document.getElementById('leadDetailModal');
    const leadId = modal.dataset.currentLeadId;
    if (!leadId) return;
    
    const lead = leads.find(l => (l.id || l.createdAt) === leadId);
    if (!lead) return;
    
    const status = document.getElementById('leadDetailStatus').value;
    const notes = document.getElementById('leadDetailNotes').value;
    
    lead.status = status;
    if (notes) {
        lead.notes = notes;
    }
    
    // LocalStorage 업데이트
    // Firebase에만 업데이트 (localStorage 제거)
    if (window.firebaseInitialized && window.firebaseDb && lead.id && lead.id.length < 30) {
        // Firebase 문서 ID인 경우 (일반적으로 20자 이하)
        try {
            await window.firebaseDb.collection('leads').doc(lead.id).update({
                status: lead.status,
                notes: lead.notes || '',
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Firebase 문의 상태 업데이트 완료');
        } catch (error) {
            console.error('❌ Firebase 업데이트 실패:', error);
            showNotification('상태 업데이트에 실패했습니다.', 'error');
            return;
        }
    } else {
        console.warn('⚠️ Firebase가 초기화되지 않았거나 유효하지 않은 문서 ID입니다.');
        showNotification('Firebase 연결을 확인해주세요.', 'error');
        return;
    }
    
    showNotification('문의 상태가 업데이트되었습니다.', 'success');
    displayLeads();
    closeLeadDetailModal();
}

// 문의 삭제 - Firebase만 사용
async function deleteLead(leadId) {
    if (confirm('정말로 이 문의를 삭제하시겠습니까?')) {
        const index = leads.findIndex(l => (l.id || l.createdAt) === leadId);
        if (index !== -1) {
            // Firebase에서만 삭제
            if (window.firebaseInitialized && window.firebaseDb && leadId && leadId.length < 30) {
                try {
                    await window.firebaseDb.collection('leads').doc(leadId).delete();
                    console.log('✅ Firebase에서 문의 삭제 완료');
                    leads.splice(index, 1);
                    showNotification('문의가 성공적으로 삭제되었습니다.', 'success');
                    displayLeads();
                } catch (error) {
                    console.error('❌ Firebase 삭제 실패:', error);
                    showNotification('문의 삭제에 실패했습니다.', 'error');
                }
            } else {
                console.warn('⚠️ Firebase가 초기화되지 않았거나 유효하지 않은 문서 ID입니다.');
                showNotification('Firebase 연결을 확인해주세요.', 'error');
            }
        }
    }
}

// 문의 필터링
function filterLeads() {
    const status = document.getElementById('leadStatusFilter').value;
    const projectType = document.getElementById('leadProjectTypeFilter').value;
    const searchTerm = document.getElementById('leadSearchInput').value.toLowerCase();
    
    let filtered = leads;
    
    if (status) {
        filtered = filtered.filter(l => l.status === status);
    }
    
    if (projectType) {
        filtered = filtered.filter(l => (l.projectType || l.프로젝트유형) === projectType);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(l => 
            (l.name || l.이름 || '').toLowerCase().includes(searchTerm) ||
            (l.email || l.이메일 || '').toLowerCase().includes(searchTerm) ||
            (l.phone || l.전화번호 || l.phoneNumber || '').toLowerCase().includes(searchTerm)
        );
    }
    
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--dark-gray);">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    filtered.forEach(lead => {
        const row = document.createElement('tr');
        row.dataset.leadId = lead.id || lead.createdAt;
        const date = new Date(lead.createdAt);
        const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const statusClass = lead.status === 'completed' ? 'completed' : lead.status === 'in-progress' ? 'in-progress' : lead.status === 'archived' ? 'archived' : 'new';
        row.innerHTML = `
            <td>
                <input type="checkbox" class="lead-checkbox" value="${lead.id || lead.createdAt}" onchange="toggleLeadSelection('${lead.id || lead.createdAt}', this.checked)">
            </td>
            <td>${formattedDate}</td>
            <td><strong>${lead.name || lead.이름 || '-'}</strong></td>
            <td>
                <div>${lead.email || lead.이메일 || '-'}</div>
                <div style="font-size: 12px; color: var(--dark-gray);">${lead.phone || lead.전화번호 || lead.phoneNumber || '-'}</div>
            </td>
            <td>${lead.projectType || lead.프로젝트유형 || '-'}</td>
            <td>${lead.product || lead.제품 || '-'}</td>
            <td><span class="status-badge ${statusClass}">${getLeadStatusText(lead.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewLeadDetail('${lead.id || lead.createdAt}')" title="상세보기">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteLead('${lead.id || lead.createdAt}')" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 문의 상세 모달 닫기
function closeLeadDetailModal() {
    const modal = document.getElementById('leadDetailModal');
    modal.classList.remove('show');
    delete modal.dataset.currentLeadId;
}

// 문의 선택 토글
function toggleLeadSelection(leadId, checked) {
    if (checked) {
        selectedLeadIds.add(leadId);
    } else {
        selectedLeadIds.delete(leadId);
    }
    updateLeadSelectionUI();
}

// 문의 전체 선택 토글
function toggleSelectAllLeads(checked) {
    const checkboxes = document.querySelectorAll('.lead-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checked;
        const leadId = cb.value;
        if (checked) {
            selectedLeadIds.add(leadId);
        } else {
            selectedLeadIds.delete(leadId);
        }
    });
    updateLeadSelectionUI();
}

// 문의 선택 UI 업데이트
function updateLeadSelectionUI() {
    const deleteBtn = document.getElementById('deleteSelectedLeadsBtn');
    if (deleteBtn) {
        deleteBtn.style.display = selectedLeadIds.size > 0 ? 'inline-block' : 'none';
    }
}

// 선택된 문의 삭제
async function deleteSelectedLeads() {
    if (selectedLeadIds.size === 0) return;
    if (!confirm(`선택한 ${selectedLeadIds.size}개의 문의를 삭제하시겠습니까?`)) return;
    
    // Firebase에서만 삭제 (localStorage 제거)
    let deletedCount = 0;
    const leadIdsToDelete = Array.from(selectedLeadIds);
    
    for (const leadId of leadIdsToDelete) {
        if (window.firebaseInitialized && window.firebaseDb && leadId && leadId.length < 30) {
            try {
                await window.firebaseDb.collection('leads').doc(leadId).delete();
                const index = leads.findIndex(l => (l.id || l.createdAt) === leadId);
                if (index !== -1) {
                    leads.splice(index, 1);
                    deletedCount++;
                }
            } catch (error) {
                console.error(`❌ 문의 ${leadId} 삭제 실패:`, error);
            }
        }
    }
    
    selectedLeadIds.clear();
    if (deletedCount > 0) {
        showNotification(`${deletedCount}개의 문의가 삭제되었습니다.`, 'success');
        displayLeads();
        updateLeadSelectionUI();
    } else {
        showNotification('삭제할 문의를 선택해주세요.', 'error');
    }
}

// ==================== 대량 편집 기능 ====================

// 제품 선택 토글
function toggleProductSelection(productId, checked) {
    if (checked) {
        selectedProductIds.add(productId);
    } else {
        selectedProductIds.delete(productId);
    }
    updateProductSelectionUI();
}

// 제품 전체 선택 토글
function toggleSelectAllProducts(checked) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checked;
        const productId = cb.value;
        if (checked) {
            selectedProductIds.add(productId);
        } else {
            selectedProductIds.delete(productId);
        }
    });
    updateProductSelectionUI();
}

// 제품 선택 UI 업데이트
function updateProductSelectionUI() {
    const bulkEditBar = document.getElementById('bulkEditBar');
    const bulkEditCount = document.getElementById('bulkEditCount');
    
    if (bulkEditBar && bulkEditCount) {
        if (selectedProductIds.size > 0) {
            bulkEditBar.style.display = 'flex';
            bulkEditCount.textContent = selectedProductIds.size;
        } else {
            bulkEditBar.style.display = 'none';
        }
    }
}

// 대량 편집 값 입력 컨테이너 토글
function toggleBulkEditValueContainer(action) {
    const container = document.getElementById('bulkEditValueContainer');
    if (!container) return;
    
    if (action === 'status') {
        container.style.display = 'block';
        container.innerHTML = `
            <select id="bulkEditValue" class="form-select">
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="out-of-stock">품절</option>
            </select>
        `;
    } else if (action === 'category') {
        container.style.display = 'block';
        container.innerHTML = `
            <select id="bulkEditValue" class="form-select">
                <option value="">선택하세요</option>
                <option value="outdoor">야외시설</option>
                <option value="furniture">가구</option>
                <option value="lighting">조명시스템</option>
                <option value="flooring">바닥재</option>
                <option value="wall">벽재</option>
                <option value="accessories">액세서리</option>
            </select>
        `;
    } else if (action === 'price' || action === 'stock') {
        container.style.display = 'block';
        container.innerHTML = `
            <input type="number" id="bulkEditValue" class="form-input" placeholder="${action === 'price' ? '가격 (원 또는 %)' : '재고 (개 또는 증감)'}">
        `;
    } else if (action === 'featured') {
        container.style.display = 'block';
        container.innerHTML = `
            <select id="bulkEditValue" class="form-select">
                <option value="true">대표 제품으로 설정</option>
                <option value="false">대표 제품 해제</option>
            </select>
        `;
    } else {
        container.style.display = 'none';
    }
}

// 대량 편집 적용
function applyBulkEdit() {
    if (selectedProductIds.size === 0) return;
    
    const action = document.getElementById('bulkEditAction').value;
    const valueInput = document.getElementById('bulkEditValue');
    
    if (!action || !valueInput) {
        showNotification('작업과 값을 선택해주세요.', 'error');
        return;
    }
    
    const value = valueInput.value;
    if (!value && action !== 'featured') {
        showNotification('값을 입력해주세요.', 'error');
        return;
    }
    
    let updatedCount = 0;
    
    selectedProductIds.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        switch (action) {
            case 'status':
                product.status = value;
                break;
            case 'category':
                product.category = value;
                break;
            case 'featured':
                product.featured = value === 'true';
                break;
            case 'price':
                const priceChange = parseInt(value);
                if (!isNaN(priceChange)) {
                    if (priceChange > 0 && priceChange < 100) {
                        // 퍼센트로 인식 (예: 10 = 10% 증가)
                        product.price = Math.round(product.price * (1 + priceChange / 100));
                    } else {
                        // 절대값으로 인식
                        product.price = priceChange;
                    }
                }
                break;
            case 'stock':
                const stockChange = parseInt(value);
                if (!isNaN(stockChange)) {
                    if (stockChange > -100 && stockChange < 100 && stockChange !== 0) {
                        // 증감값으로 인식
                        product.stock = Math.max(0, product.stock + stockChange);
                    } else {
                        // 절대값으로 인식
                        product.stock = Math.max(0, stockChange);
                    }
                }
                break;
        }
        updatedCount++;
    });
    
    featuredProducts = products.filter(p => p.featured);
    updateWebPageProducts();
    displayProducts();
    cancelBulkEdit();
    showNotification(`${updatedCount}개의 제품이 업데이트되었습니다.`, 'success');
}

// 대량 편집 취소
function cancelBulkEdit() {
    selectedProductIds.clear();
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    const selectAll = document.getElementById('selectAllProducts');
    if (selectAll) selectAll.checked = false;
    updateProductSelectionUI();
    const actionSelect = document.getElementById('bulkEditAction');
    if (actionSelect) actionSelect.value = '';
    const container = document.getElementById('bulkEditValueContainer');
    if (container) container.style.display = 'none';
}