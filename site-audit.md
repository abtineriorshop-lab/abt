# 밝은내일 웹사이트 종합 점검 리포트

## 1. 개요
- **범위**: `index.html`, 제품 시리즈(`products-*.html`), `portfolio.html`, `contact.html`, 관리자 영역(`admin-*`), 공용 스크립트(`script.js`, `product-script.js`), 비디오 가이드(`videos/README.md`).
- **목표**: B2B 인테리어·익스테리어 브랜딩 일관성 확보, 리드 전환율 개선, 운영 효율화, 차별화된 향후 로드맵 수립.

## 2. 핵심 리스크 요약
| 구분 | 내용 | 영향도 |
| --- | --- | --- |
| 네비게이션 | `script.js`가 모든 `.nav-link` 클릭을 가로채고, 여러 페이지에서 존재하지 않는 `about.html` 등으로 링크됨 | **상** – 전역 탐색 불가 |
| 제품 인터랙션 | HTML 구조(`.filter-tab`, `#sort`)와 `product-script.js`( `.filter-btn`, `#sortSelect`) 불일치 | **상** – 필터/정렬/검색 미동작 |
| 데이터 지속성 | 제품/대표 제품/문의 처리 모두 `localStorage` 기반으로 브라우저마다 초기화 | **상** – 운영 불가, 멀티 사용자 미지원 |
| 폼 처리 | 모든 문의가 setTimeout으로 대체, 실제 메일/CRM 연동 전무 | **중** – 리드 손실 |
| 성능/접근성 | 4K Unsplash 이미지 즉시 로드, `<video>` Fallback DOM 구조 오류, Lazy 로딩·ARIA 미구현 | **중** – LCP 저하, 접근성 미충족 |
| 콘텐트/브랜딩 | B2B 톤 불일치, 설치 사례/FAQ/CTA 반복, 실제 프로젝트 정보 부족 | **중** – 신뢰도 저하 |

## 3. 페이지별 상세 진단

### 3.1 메인 페이지 (`index.html`)
- **네비게이션**: 내부 앵커 전용 스크롤 로직이 모든 링크에서 실행되어 서브 페이지 전환이 차단됨. 존재하지 않는 `about.html` 등으로 링크 연결.
- **히어로 섹션**: `<video>` 내에 `<div class="video-fallback">`가 중첩되어 있어 브라우저가 fallback 이미지를 렌더링하지 않음. `videos/README.md` 권장대로 1280x720 버전을 사용하면 대역폭 절감 가능.
- **제품 섹션**: 대표 카드 하나만 고정, 나머지는 `localStorage`에서 로드하지만 기본 데이터가 없어 빈 상태가 될 수 있음.
- **CTA 흐름**: 모든 버튼이 “제품 둘러보기/설치사례” 수준으로 행동 유도 단일화. 펀넬 단계(자료 요청, 미팅 예약 등)별 CTA 필요.

### 3.2 제품 리스트 (`products-*.html`)
- **필터/정렬**: 클래스/ID 불일치로 JS 이벤트 미연결. 정렬 옵션 중 `popular`, `newest`는 구현조차 없음.
- **위시리스트/모달**: `product-script.js` 전역에서 `showNotification`을 재정의하며, 기존 `script.js`와 충돌. 썸네일·옵션 정보는 하드코딩이라 관리자에서 수정해도 반영되지 않음.
- **데이터 소스**: 관리자 페이지가 `localStorage`에 제품 JSON을 저장하고 이를 프론트가 읽지만, 사용자 브라우저에는 해당 데이터가 내려오지 않으므로 새 방문자는 기본 하드코딩 카드만 조회.
- **반응형**: `product-styles.css`에서 데스크톱 레이아웃 전제, 모바일 1열/슬라이더 등 최적화 미흡.

### 3.3 포트폴리오 (`portfolio.html`)
- **컨텐츠 반복**: 메인 Gallery와 동일한 이미지/설명을 재사용. 프로젝트별 핵심 정보(면적, 용도, 공사 기간, 적용 제품 리스트)가 없어 B2B 설득력 부족.
- **필터 버튼**: `data-filter`는 존재하나 실제 필터 JS가 없음. `script.js`의 갤러리 필터는 홈 섹션 전용이라 여기선 작동안함.
- **신뢰 요소**: 고객 후기 3건 모두 Placeholder(김○○ 등)이며 실제 수치나 Before/After 자료 부재.

### 3.4 문의 (`contact.html`)
- **폼 밸리데이션**: HTML5 필수 속성만 사용, 스팸 방지·파일 첨부(도면) 등 B2B 필수 기능 없음.
- **CTA**: 전화/이메일 정보 반복 제공 외 자동화된 예약/캘린더 연동 부재.
- **FAQ**: 정적 아코디언이지만 JS가 없어 토글되지 않음(순수 CSS?). 모바일에서 답변 텍스트가 항상 펼쳐져 UX 저하.

### 3.5 관리자 (`admin-dashboard.html`, `admin-script.js`)
- **인증**: `localStorage` 토큰만 확인, 패스워드 암호화/만료/다중 계정 없음.
- **데이터 쓰기**: 새 제품 추가 시에도 `localStorage`에만 저장 → 다른 기기나 방문자와 공유 불가.
- **대표 제품**: 체크박스를 껐다 켜도 메인 페이지에는 사용자의 브라우저에 저장된 featured 리스트만 반영되므로 사실상 관리자용 UI일 뿐 실 서비스와 단절.

## 4. 공통 인프라/콘텐츠 이슈
1. **파일 부재**: `about.html`, `pension-interior.html` 등 메뉴에 존재하나 실제 파일 없음 → 즉시 404 해결/메뉴 재구성 필요.
2. **공통 헤더/푸터 중복**: 모든 HTML이 같은 네비·푸터를 개별 복사. 수정 시 파일 다중 편집 필요하므로 파셜(템플릿 엔진 또는 JS include) 구조 필요.
3. **다국어/브랜드 메시지**: 한글, 영문(Playfair) 혼용이나 실제 영문 콘텐츠 없음. `BRIGHT FUTURE` 보조 문구 외 브랜드 스토리 부재.
4. **법적 고지**: Footer 사업자 고지는 있으나 개인정보 처리방침/서비스 약관 문서가 실제로 존재하지 않음(빈 링크). 전자상거래법 리스크.

## 5. 비디오 & 이미지 자산 (`videos/README.md`)
- 4K MP4/H.264 파일을 메인 히어로에서 자동 재생. README 권장대로 1280x720, 5~8초 루프, H.265/WebM 병행 필요.
- 포트폴리오/제품 이미지 모두 Unsplash 원본 URL 사용 → 저작권/상업용 사용 여부 확인 필요. 자체 시공 이미지 확보 권장.
- Lazy loading(`loading="lazy"`), `srcset`, `sizes` 미사용. LCP/CLS 개선 여지 큼.

## 6. 데이터 & 운영 프로세스
| 항목 | 현재 | 제안 |
| --- | --- | --- |
| 제품 데이터 | JS 하드코딩 + `localStorage` | Headless CMS(Storyblok), Airtable, 혹은 Supabase/PostgreSQL API |
| 관리자 인증 | LocalStorage flag | Firebase Auth / Supabase Auth / Cognito 등 이메일 기반 |
| 문의 처리 | setTimeout 성공 토스트 | Formspree/EmailJS → 최종적으로 자체 API + CRM(Airtable, Notion DB) |
| 위시리스트 | LocalStorage 배열 | 사용자 계정 연동, 혹은 최소 쿠키 지속 + 서버 전송 |

## 7. SEO · 접근성 · 성능 진단
- **SEO**: 모든 페이지 `<title>`은 존재하지만 `<meta description>` 부족, 구조화 데이터 미적용. OG/Twitter 메타도 없음.
- **URL 전략**: 정적 HTML 구조로 SPA처럼 동작 → 검색엔진이 제품 상세/필터 데이터를 읽지 못함.
- **접근성**: `nav` 내 햄버거 버튼 `aria-controls`, `aria-expanded` 미지정. 키보드 포커스 스타일 없음. 컬러 대비(연한 골드 텍스트) 확인 필요.
- **성능**: 
  - Hero 비디오 + 고해상도 이미지로 First Contentful Paint 지연.
  - JS 파일(`script.js`)이 모든 페이지에서 실행되어 DOM 요소가 없으면 에러는 없지만 불필요한 오버헤드 발생.
  - CSS 파일 다수(`styles.css`, `page-styles.css`, `product-styles.css`)가 중복 정의. 빌드/번들 없음.

## 8. 향후 방향성 (로드맵)

### Phase 1: 기반 복구 (1~2주)
1. **정보 구조 개편**: 공통 헤더/푸터 컴포넌트화, 존재하지 않는 페이지 링크 제거 또는 페이지 생성.
2. **네비게이션 로직 분리**: 메인 홈에서만 앵커 스크롤 적용, 서브 페이지는 기본 이동 허용.
3. **제품 필터/정렬 리팩터링**: HTML과 JS 일치, 상태를 URL 쿼리로 반영, 정렬 옵션 실제 구현.
4. **폼 연동**: Formspree/AWS SES 등으로 문의 데이터 수집. 필수 항목(예산, 일정, 위치) 기본값 세팅.
5. **자산 최적화**: `videos/README.md` 가이드 반영(720p, 5초 루프). 이미지 WebP 변환 + Lazy load.

### Phase 2: 데이터/운영 고도화 (3~5주)
1. **Headless CMS/DB 도입**: 제품·포트폴리오·FAQ 데이터를 단일 소스로 관리하고, 정적 사이트 생성(Next.js SSG 등) 또는 Client fetch 구조 도입.
2. **관리자 인증 강화**: 이메일/비밀번호 + 2FA, RBAC(운영/편집 권한) 분리. 작업 로그 추적.
3. **리드 파이프라인**: 문의 제출 → Notion/Airtable → Slack/Webhook 알림, 상태 업데이트 UI 구축(멤버 뷰와 연동).
4. **콘텐츠 확장**: 설치 사례 상세 페이지, 블로그/인사이트 섹션, 자주 사용되는 패키지 소개(“카라반 풀세트 패키지” 등).

### Phase 3: 차별화 기능 (6주+)
1. **견적 계산기/패키지 추천**: 면적/용도/예산 입력 시 패키지·제품 리스트 자동 추천.
2. **인터랙티브 미디어**: 360° 투어, AR 모델, 시공 단계 타임라인.
3. **B2B 멤버 포털**: 프로젝트 진행 현황, 문서 다운로드, 커뮤니케이션 로그를 확인하는 회원 전용 섹션. (관리자 뷰와 동일 구조 유지).
4. **글로벌 확장**: 영어/중국어 페이지, 현지 검색 엔진 최적화, 해외 배송/설치 FAQ.

## 9. 실행 우선순위
| 우선순위 | 작업 | 담당 | 비고 |
| --- | --- | --- | --- |
| P0 | 네비게이션/링크 수정, 존재하지 않는 페이지 정리 | FE | 배포 즉시 사용자 영향 |
| P0 | 제품 필터·정렬 JS 리팩터링 | FE | 모든 제품 페이지 공통 |
| P1 | Contact 폼 → Formspree 등 외부 서비스 연동 | FE/BE | 리드 확보 시작 |
| P1 | Hero 비디오/이미지 최적화 & Lazy loading | FE | Core Web Vitals 개선 |
| P2 | Headless CMS or DB PoC (Supabase 추천) | Full-stack | 관리자/사용자 데이터 동기화 |
| P2 | 포트폴리오 상세 템플릿 제작 | 디자인/콘텐츠 | 실사/프로젝트 스토리 큐레이션 |
| P3 | 견적 계산기 MVP, 멤버 포털 설계 | PO/FE/BE | 차별화 기능 |

## 11. Phase 1 진행 현황
- [x] **정보 구조 보강**: `about.html` 신설 및 모든 페이지에서 정상 네비게이션 경로 확보, 앵커 스크롤은 홈 한정.
- [x] **제품 인터랙션 복구**: `.filter-tab`/`#sort`와 `product-script.js` 정렬·필터 로직 동기화, 기본 정렬 지표 추가.
- [x] **문의 플로우 연동**: `contact.js`로 Formspree POST 적용, 제품 상세 → 문의 페이지 자동 프리필.
- [x] **미디어 최적화 착수**: Hero 비디오 `poster`/fallback 구조 수정, 글로벌 `loading="lazy"` 적용 유틸 추가.

## 12. Phase 2 진행 현황
- [x] **제품/포트폴리오 데이터 소스 통합**: `data/products.json`, `data/portfolio.json` 기반 Fetch 구조 도입, `product-script.js`, `index.html`, `portfolio.js`에서 공통 JSON을 소비하도록 변경.
- [x] **포트폴리오 필터/콘텐츠 동적화**: `portfolio.js`로 프로젝트 메타(면적·기간·태그)를 동적 출력하고 필터 버튼과 연동.
- [x] **리드 저장/알림 파이프라인**: `contact.js`에서 Formspree 제출 후 로컬 리드 로그, 선택적 CRM API/웹훅 전송까지 처리하도록 확장.

## 13. Phase 3 진행 현황
- [x] **견적 계산기 MVP**: `contact.html`에 간편 견적 섹션과 `estimate.js`를 추가해 면적·마감 수준·추가 패키지 입력 시 예상 금액과 `data/products.json` 기반 추천 패키지를 즉시 노출.
- [x] **멤버 포털 설계**: `docs/member-portal-plan.md`에 역할/IA/데이터 모델/스택/로드맵을 정의하여 향후 개발 범위 명확화.
- [x] **인터랙티브 미디어/AR 전략**: `docs/interactive-media-plan.md`에 360° 투어, AR 배치, 타임라인 UI, 에셋 관리, 로드맵/KPI를 정리해 차별화 기능 방향성을 확립.
- [x] **B2B 멤버 포털 기획**: `docs/member-portal-plan.md`에 요구사항, IA, 데이터 모델, 기술 스택, 보안, 로드맵을 정리 완료.

## 14. 최적화 작업 완료 내역

### P0 - 이미지/비디오 최적화 ✅
- [x] **히어로 비디오 포스터 최적화**: 1280x720 해상도, q=75 품질로 압축
- [x] **이미지 srcset/sizes 적용**: 
  - 히어로 fallback 이미지: 400w/800w/1280w srcset, 100vw sizes
  - About 섹션 이미지: 반응형 sizes 적용
  - 제품 카드 이미지: `createOptimizedImageSrcset()` 헬퍼 함수로 동적 생성
  - 포트폴리오 이미지: 동일 최적화 적용
- [x] **Lazy loading 전면 적용**: 모든 이미지에 `loading="lazy"` 속성 추가
- [x] **이미지 품질 조정**: Unsplash URL에서 q=75로 통일하여 대역폭 절감

### P1 - 접근성 개선 ✅
- [x] **햄버거 메뉴 ARIA 속성**: 
  - `aria-label`, `aria-expanded`, `aria-controls` 추가
  - 토글 시 상태 업데이트 로직 구현 (`script.js`)
  - 주요 페이지(`index.html`, `contact.html`, `portfolio.html`, `about.html`) 적용
- [x] **드롭다운 메뉴 ARIA**: `aria-haspopup`, `aria-expanded`, `role="menu"` 추가
- [x] **네비게이션 ID 연결**: `nav-menu` id와 `aria-controls` 연결

### P1 - SEO 메타 태그 ✅
- [x] **기본 메타 태그**: description, keywords, canonical 추가
- [x] **Open Graph 태그**: og:type, og:url, og:title, og:description, og:image 추가
- [x] **Twitter Card**: twitter:card, twitter:url, twitter:title, twitter:description, twitter:image 추가
- [x] **JSON-LD 구조화 데이터**: LocalBusiness 스키마 추가 (이름, 설명, 연락처, 주소, 서비스 유형)

### P2 - 데이터 로딩/오류 처리 ✅
- [x] **제품 페이지 로딩 UI**: 스켈레톤 로더 및 오류 상태 메시지 추가 (`product-script.js`)
- [x] **포트폴리오 로딩 UI**: 동일한 로딩/오류 처리 적용 (`portfolio.js`)
- [x] **메인 페이지 제품 로드**: 오류 발생 시 사용자 친화적 메시지 표시 (`index.html`)
- [x] **재시도 기능**: 오류 상태에서 "다시 시도" 버튼 제공

## 16. P2 추가 최적화 작업 완료 내역

### P2 - 접근성 개선 ✅
- [x] **키보드 포커스 스타일**: 
  - `styles.css`에 `:focus-visible` 스타일 추가 (3px 골드 아웃라인, 2px 오프셋)
  - 네비게이션, 버튼, 폼 요소에 포커스 링 적용
  - `page-styles.css`에 폼/필터/카드 포커스 스타일 추가
- [x] **Skip to main 링크**: `index.html`에 스크린 리더용 본문 바로가기 링크 추가
- [x] **폼 레이블 보강**: `contact.html`의 이름/연락처 필드에 `aria-describedby` 연결
- [x] **스크린 리더용 텍스트**: `.sr-only` 클래스 추가로 숨김 설명 텍스트 지원

### P2 - SEO 메타 태그 확장 ✅
- [x] **다른 페이지 메타 태그 추가**:
  - `portfolio.html`: description, keywords, OG, Twitter 태그 추가
  - `contact.html`: description, keywords, OG, Twitter 태그 추가
  - `about.html`: description, keywords, OG, Twitter 태그 추가
  - `products-outdoor.html`: description, keywords, OG, Twitter 태그 추가
- [x] **JSON-LD 구조화 데이터**:
  - `portfolio.html`: ItemList/CreativeWork 스키마 추가
  - `products-outdoor.html`: ProductCollection 스키마 추가
- [x] **사이트맵 생성**: `sitemap.xml` 생성 (모든 주요 페이지 포함, 우선순위/변경 빈도 설정)
- [x] **robots.txt 생성**: 검색 엔진 크롤링 규칙 설정 (admin, data, docs 디렉토리 제외)

## 15. 개선 필요 항목 (우선순위별)

### P2 - 남은 접근성 작업
- [x] **키보드 포커스 스타일**: 모든 인터랙티브 요소에 명확한 포커스 링 추가 ✅
- [ ] **컬러 대비 검증**: 연한 골드 텍스트와 배경 간 대비율 WCAG AA 기준 충족 확인 (수동 테스트 필요)
- [x] **폼 레이블 보강**: 주요 필드에 `aria-describedby` 연결 완료 (전체 필드 확장 가능) ✅
- [ ] **스크린 리더 테스트**: 실제 스크린 리더로 네비게이션/폼 흐름 검증 (수동 테스트 필요)

### P2 - 남은 SEO 작업
- [x] **다른 페이지 메타 태그**: 주요 페이지 메타 태그 추가 완료 (나머지 제품 페이지 확장 가능) ✅
- [x] **제품/프로젝트 JSON-LD**: 포트폴리오와 제품 페이지에 JSON-LD 추가 완료 ✅
- [x] **사이트맵 생성**: XML sitemap 및 robots.txt 파일 생성 완료 ✅

### P3 - 법적 문서
- [ ] **개인정보처리방침 페이지**: 실제 내용 작성 및 Footer 링크 연결
- [ ] **이용약관 페이지**: 실제 내용 작성 및 Footer 링크 연결
- [ ] **사업자정보확인 링크**: 실제 사업자등록번호 조회 페이지 연결

### P3 - 추가 최적화
- [ ] **폰트 최적화**: `font-display: swap` 추가, 폰트 서브셋팅 고려
- [ ] **CSS 최적화**: 중복 스타일 통합, Critical CSS 추출
- [ ] **JS 번들링**: ES 모듈 구조로 전환, 페이지별 코드 스플리팅
- [ ] **CDN 도입**: 이미지/비디오 자산을 CDN으로 이전 (Cloudinary, Imgix 등)

## 10. 마무리 제안
- **Single Source of Truth**: 관리자 페이지와 사용자 뷰가 동일 데이터를 바라보도록 CMS/API를 우선 구축하세요.
- **콘텐츠 레이어**: 실제 시공 사진, 공사 프로세스, 고객 인터뷰 등을 확보해 B2B 신뢰도를 높이고, SEO 키워드(“펜션 인테리어 견적”, “야외 파고라 시공”) 중심으로 구조화하세요.
- **품질 관리**: Lighthouse/Pa11y/axe로 접근성 스캔, WebPageTest로 성능 계측을 정기화하고, GitHub Actions 등으로 CI 파이프라인 구성하면 추후 대형 프로젝트 대응력이 높아집니다.

