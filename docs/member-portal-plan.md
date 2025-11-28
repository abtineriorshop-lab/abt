# 멤버 포털 설계 초안

## 1. 목표
- B2B 파트너(펜션·카페 운영자 등)가 프로젝트 진행 상황과 산출물을 실시간으로 확인
- 관리자와의 커뮤니케이션, 문서 공유, AS/견적 요청을 한 곳에서 처리
- 기존 관리자 대시보드(`admin-dashboard.html`)와 동일한 데이터 소스를 사용하여 중복 입력 방지

## 2. 사용자 롤 & 권한
| 롤 | 주요 권한 | 인증 |
| --- | --- | --- |
| Admin | 프로젝트 CRUD, 문서 업로드, 알림 발송, 권한 관리 | 이메일+비밀번호, 2FA |
| Partner | 소속 프로젝트 조회, 문서 다운로드, 피드백/요청 등록 | 초대 기반 계정, 이메일 인증 |
| Observer (선택) | 열람 전용(지자체, 협력사) | 만료 가능한 뷰어 링크 |

## 3. 정보 구조 (IA)
1. **대시보드**: 진행 중/완료 프로젝트 카드, 주요 일정, 처리 대기 요청, 최근 알림.
2. **프로젝트 상세**  
   - 개요(예산, 공정률, 일정)  
   - 마일스톤 타임라인  
   - 작업 내역/체크리스트  
   - 시공 사진/3D 뷰어 임베드  
   - 문서 첨부(도면, 계약서, 세금계산서)
3. **커뮤니케이션**: 댓글/메모, 파일 첨부, 담당자 태깅, 알림 설정.
4. **요청/AS 티켓**: 신규 요청 등록 → 상태 추적(접수/진행/완료).
5. **자료실**: 브랜드 가이드, 유지보수 매뉴얼, 견적 계산 결과 저장.

## 4. 데이터 모델 제안
```text
Projects
 ├─ id, name, type, clientId, budget, startDate, endDate, status, progress
 ├─ relations: milestones[], tasks[], files[], tickets[]
Milestones
 ├─ id, projectId, title, targetDate, status, attachments[]
Tasks / Checklists
 ├─ id, projectId, assignedTo, dueDate, status, category
Files
 ├─ id, projectId, uploaderId, type(drawings, invoices, media), url, version
Tickets (AS/요청)
 ├─ id, projectId, requesterId, priority, status, history[]
Notifications
 ├─ id, userId, type, payload, readAt
```

## 5. 기술 스택 제안
- **프론트엔드**: Next.js 15 (App Router) + React Server Components, Tailwind/Chakra, SWR/TanStack Query.
- **백엔드**: Supabase (Postgres + Auth + Storage) 또는 Hasura + Postgres.  
  - Row Level Security로 프로젝트별 접근 제어.  
  - Storage bucket을 문서/이미지 버전 관리에 활용.
- **실시간 알림**: Supabase Realtime 혹은 Pusher/Ably.
- **파일 프리뷰**: PDF.js, S3 signed URL, 3D/AR는 Sketchfab/embed.

## 6. UX 플로우 요약
1. Admin이 프로젝트 생성 → 파트너 이메일 초대 → 인증 후 대시보드 진입.
2. 마일스톤 업데이트/사진 업로드 시 파트너에게 푸시/메일/카카오 알림.
3. 파트너는 요청/AS 티켓 생성 → Admin이 상태 업데이트 → 협의 내역 자동 기록.
4. 견적 계산기(Phase 3 기능)에서 저장한 결과를 프로젝트로 변환하여 초기 정보 자동 채움.

## 7. 보안 & 운영
- Supabase Auth + Magic Link/OTP, Admin 영역은 추가 2FA.
- 프로젝트별 ACL(Access Control List) → 사용자가 접근 가능한 데이터만 쿼리.
- 감사 로그: 중요한 이벤트(문서 다운로드, 상태 변경)를 `audit_logs` 테이블에 저장.
- 백업/버전 관리: Storage Object에 버전 태깅, DB는 Point-in-time Recovery 구독.

## 8. 단계별 구축 계획
1. **MVP (3주)**: 프로젝트 리스트/상세, 문서 업로드, 요청 티켓, 이메일 초대.
2. **Phase 2**: 실시간 알림, 마일스톤 타임라인, 모바일 최적화.
3. **Phase 3**: 3D/AR 뷰어, 자동 리포트 PDF, 외부 협력사 계정.

## 9. 연계 포인트
- 기존 `admin-script.js` → Supabase CRUD로 대체 후 관리 UI와 멤버 포털이 동일 API 사용.
- `contact.js` 리드 데이터를 CRM 테이블에 적재한 뒤, 프로젝트 생성 시 초기 값으로 매핑.
- 견적 계산기 결과를 `Projects`의 `estimateSnapshot` 필드에 JSON으로 저장.

