# 인터랙티브 미디어 / AR 전략 초안

## 1. 전략 목표
- 설치 완료 전 고객이 공간을 선체험하도록 하여 의사결정 속도 및 부가 매출 향상
- 시공 후 유지보수/마케팅 자산으로 재활용 가능한 3D·AR 콘텐츠 확보
- 견적/멤버 포털과 연동해 동일 데이터를 활용 (제품 소재, 사이즈, 패키지)

## 2. 콘텐츠 형식
| 형식 | 목적 | 구현 방법 |
| --- | --- | --- |
| 360° 파노라마 투어 | 완성 공간 소개, 설치사례 페이지 강화 | Matterport, KUULA, 자체 WebGL(Three.js) |
| AR 제품 배치 | 야외정자, 파고라, 조명 등을 실제 현장에 배치 | USDZ(Apple), glTF/Scene Viewer(Android) |
| 단계별 타임라인 | 시공 프로세스 시각화 | Framer Motion/GSAP으로 Horizontal timeline |
| Before/After 슬라이더 | 변화를 강조하는 비교 | React Compare Slider / custom CSS |

## 3. 시스템 구성
1. **Asset 관리**
   - 3D 모델: glTF + 전용 CDN(Supabase Storage, S3)
   - 파노라마: 8K 큐브맵 → 다단계 해상도
2. **UI 컴포넌트**
   - `InteractiveGallery` (360/Video/AR 탭)
   - `ARLaunchButton` (기기 인식 후 적절한 포맷 호출)
   - `Timeline` (Milestone 데이터 바인딩)
3. **데이터**
   - `media_assets` 테이블: `{id, projectId, type, url, thumbnail, meta}`
   - `ar_variants`: 제품별 스케일/재질 옵션

## 4. 구현 로드맵
1. **Sprint 1 (1주)**: 우선순위 3D 모델(파고라 2종) 제작, glTF + USDZ 익스포트, 뷰어 PoC.
2. **Sprint 2 (2주)**: 360 투어 템플릿 + 관리자 업로드 워크플로우, AR 버튼을 제품 상세에 통합.
3. **Sprint 3 (2주)**: 멤버 포털 프로젝트 상세에 타임라인/미디어 탭 추가, 다운로드/공유 제어.
4. **Sprint 4 (이후)**: 고객 맞춤 AR(색상/재질 선택), Analytics(클릭/시청 시간) 수집.

## 5. 기술 스택 추천
- Three.js + react-three-fiber (웹 뷰어)
- WebXR Device API / `<model-viewer>` for AR fallback
- Supabase Storage + Imgix/CMS for asset delivery
- Cloudflare Stream or Vimeo Pro for 360/비디오 호스팅

## 6. 품질 가이드
- glTF 2.0, 100k polygons 이하, 2K PBR 텍스처
- AR 모델은 1:1 실제 크기, 단위(m), 중심점을 바닥 기준으로 정렬
- 360 투어는 모바일 로딩 3초 이내(3~4K equirectangular)

## 7. 보안/저작권
- NDA가 필요한 프로젝트는 링크 보호 + 만료 토큰 적용
- AR 모델 메타데이터에 저작권/버전 명시

## 8. KPI
- 견적 요청 대비 AR 체험 클릭률 35% 이상
- 포트폴리오 페이지 체류 시간 +40%
- AS 요청 감소율 (설치 전후 교육 영상 제공 시)

