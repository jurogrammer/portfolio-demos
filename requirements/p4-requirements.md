# P4. SaaS 웹앱 "TaskFlow"

> 요구사항 명세서 및 인프라 구성 가이드
> 위시켓 웹개발 포트폴리오 프로젝트 시리즈
> 버전 1.0 | 2025년 3월

---

## 목차

1. 프로젝트 개요
2. 사용자 유형 및 권한 모델
3. 페이지 구성 및 기능 요구사항
4. 멀티 테넌트 아키텍처
5. 결제 시스템 (Toss Payments)
6. 비기능 요구사항 (NFR)
7. 기술 스택 선정
8. 인프라 구성 및 배포
9. 폴더 구조 및 파일 컨벤션
10. Supabase 스키마 설계
11. 실시간 기능 설계
12. 개발 일정 (4주)
13. 완료 기준 (Definition of Done)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | TaskFlow — 소규모 팀용 프로젝트 관리 도구 |
| **목적** | 위시켓 SaaS/웹앱 프로젝트(₩2,000만~5,000만+) 수주를 위한 메인 포트폴리오. 멀티 테넌트, 결제 연동, 실시간 협업 등 SaaS 핵심 역량 증명. **포트폴리오 5개 중 가장 중요한 프로젝트** |
| **기간** | Week 7~11 (28일) |
| **타겟 사용자** | (가상) 소규모 팀 (3~15명) — PM, 개발자, 디자이너 |
| **핵심 성공 지표** | 멀티 테넌트 데이터 격리, 칸반보드 드래그 앤 드롭, 실시간 보드 동기화, Toss Payments 결제 플로우, 대시보드 차트 |

### 1.1 배경

SaaS/웹앱은 위시켓에서 단가가 가장 높은 프로젝트 유형(₩2,000만~5,000만+)이며, 경쟁이 상대적으로 적다. 멀티 테넌트 아키텍처, 결제 통합, 실시간 협업은 SaaS 클라이언트가 가장 중시하는 역량이다. 백엔드 6년차의 DB 설계, 접근 제어, 트랜잭션 경험이 직접 전이되는 프로젝트 유형이다.

### 1.2 요금제

| 플랜 | 월 가격 | 멤버 수 | 프로젝트 수 | 저장 용량 | 기능 |
|---|---|---|---|---|---|
| **Free** | ₩0 | 5명 | 3개 | 100MB | 칸반보드, 기본 대시보드 |
| **Pro** | ₩15,000 | 20명 | 무제한 | 5GB | 타임라인 뷰, 고급 대시보드, 파일 첨부 |
| **Business** | ₩45,000 | 무제한 | 무제한 | 50GB | 커스텀 필드, API 접근, 감사 로그 |

데모에서는 Free + Pro 요금제만 구현하고, Business는 "Coming Soon" 표시.

### 1.3 사이트맵

| URL 경로 | 페이지명 | 인증 | 역할 |
|---|---|---|---|
| `/` | 랜딩 페이지 | 불필요 | 제품 소개 + 요금제 + CTA |
| `/pricing` | 요금제 | 불필요 | 플랜 비교 + 결제 CTA |
| `/auth/login` | 로그인 | 불필요 | 이메일 + 소셜 로그인 |
| `/auth/register` | 회원가입 | 불필요 | |
| `/onboarding` | 온보딩 | 필요 | 워크스페이스 생성 가이드 |
| `/w/[workspaceSlug]` | 워크스페이스 홈 | 멤버 | 프로젝트 목록 + 활동 피드 |
| `/w/[workspaceSlug]/p/[projectId]` | 칸반보드 | 멤버 | 칸반보드 메인 뷰 |
| `/w/[workspaceSlug]/p/[projectId]/list` | 리스트 뷰 | 멤버 | 태스크 테이블 뷰 |
| `/w/[workspaceSlug]/dashboard` | 대시보드 | 멤버 | 차트 + 통계 |
| `/w/[workspaceSlug]/members` | 멤버 관리 | Admin+ | 초대, 역할 변경, 제거 |
| `/w/[workspaceSlug]/settings` | 워크스페이스 설정 | Owner | 이름, 슬러그, 요금제, 삭제 |
| `/w/[workspaceSlug]/billing` | 결제 | Owner | 구독 관리 + 결제 내역 |
| `/settings` | 개인 설정 | 필요 | 프로필, 알림 설정 |

---

## 2. 사용자 유형 및 권한 모델

### 2.1 워크스페이스 역할

| 역할 | 프로젝트 보기 | 태스크 CRUD | 멤버 초대 | 멤버 관리 | 설정 변경 | 결제 관리 | 워크스페이스 삭제 |
|---|---|---|---|---|---|---|---|
| **Member** | O | O | X | X | X | X | X |
| **Admin** | O | O | O | O (Member만) | 일부 | X | X |
| **Owner** | O | O | O | O (전체) | O | O | O |

### 2.2 멤버 초대 플로우

1. Admin/Owner가 이메일로 초대
2. 초대 이메일 발송 (Resend API)
3. 수신자가 초대 링크 클릭 → 회원가입 또는 로그인 → 워크스페이스에 자동 추가
4. 초대 만료: 7일

---

## 3. 페이지 구성 및 기능 요구사항

### 3.1 랜딩 페이지 (/)

**Hero**

- 제품 포지셔닝 문구 + 부제
- CTA: "무료로 시작하기" 버튼 → 회원가입
- Hero 이미지 또는 애니메이션 (칸반보드 데모 스크린샷)

**기능 소개 섹션**

- 3~4개 핵심 기능 카드 (칸반보드, 실시간 협업, 대시보드, 결제)
- 각 기능별 스크린샷 + 설명

**요금제 미리보기**

- Free/Pro/Business 3컬럼 비교 테이블
- 인기 플랜 하이라이트

**CTA 배너**

- 하단 가입 유도

### 3.2 요금제 (/pricing)

- 플랜 비교 테이블 (기능별 체크마크)
- 월간/연간 토글 (연간 20% 할인 표시)
- 각 플랜에 "시작하기" CTA
- FAQ 아코디언

### 3.3 온보딩 (/onboarding)

- 스텝 1: 워크스페이스 이름 + 슬러그 입력
- 스텝 2: 첫 프로젝트 생성 (이름 + 설명)
- 스텝 3: 팀원 초대 (이메일 입력, 건너뛰기 가능)
- 스텝 4: 칸반보드로 이동
- 프로그레스 바 표시

### 3.4 워크스페이스 홈 (/w/[workspaceSlug])

- 프로젝트 카드 그리드: 프로젝트명 + 색상 + 태스크 수 + 최근 활동
- 프로젝트 생성 카드 (+ 버튼)
- 최근 활동 피드: 최근 10개 활동 (누가 어떤 태스크를 변경했는지)
- 사이드바: 워크스페이스 이름, 프로젝트 목록, 대시보드, 멤버, 설정 링크

### 3.5 칸반보드 (/w/[workspaceSlug]/p/[projectId])

**보드 레이아웃**

- 가로 스크롤 컬럼 레이아웃
- 기본 컬럼: To Do, In Progress, Review, Done (커스텀 추가/삭제/이름변경 가능)
- 각 컬럼: 컬럼명 + 태스크 수 + 컬럼 메뉴 (이름변경, 삭제)

**태스크 카드**

- 제목
- 우선순위 표시 (🔴 Urgent, 🟠 High, 🟡 Medium, 🟢 Low)
- 담당자 아바타 (미할당 시 빈 아이콘)
- 마감일 (D-day 또는 지남 시 빨간색)
- 라벨 배지 (최대 3개)
- 댓글 수 아이콘
- 첨부파일 수 아이콘 (Pro 이상)

**드래그 앤 드롭**

- 같은 컬럼 내 순서 변경
- 컬럼 간 이동
- 낙관적 업데이트 (UI 즉시 반영 → 비동기 DB 저장)
- 드래그 중 오버레이 카드 표시

**태스크 상세 모달**

- 클릭 시 오른쪽 패널 또는 모달
- 제목 (인라인 편집)
- 설명 (Markdown 에디터)
- 상태 (컬럼 선택)
- 담당자 (멤버 목록에서 선택)
- 마감일 (날짜 피커)
- 우선순위 (드롭다운)
- 라벨 (다중 선택)
- 첨부파일 (Pro 이상, Supabase Storage)
- 댓글 (태스크 내 토론)
- 활동 로그 (변경 이력)
- 생성일, 수정일

**필터 / 정렬**

- 필터: 담당자, 우선순위, 라벨, 마감일 범위
- 정렬: 생성일, 마감일, 우선순위

### 3.6 리스트 뷰 (/w/[workspaceSlug]/p/[projectId]/list)

- 태스크 테이블: 제목, 상태, 담당자, 마감일, 우선순위, 라벨
- 인라인 편집 (상태, 담당자, 마감일)
- 정렬 가능한 컬럼 헤더
- 필터 (칸반보드와 동일)

### 3.7 대시보드 (/w/[workspaceSlug]/dashboard)

- 요약 카드: 총 태스크, 완료율, 진행 중, 지연(마감 지남)
- 상태별 분포 차트 (파이 차트 또는 도넛 차트)
- 멤버별 태스크 부하 (수평 막대 차트)
- 주간 완료 트렌드 (선형 차트, 최근 4주)
- 우선순위별 분포 (막대 차트)

### 3.8 멤버 관리 (/w/[workspaceSlug]/members)

- 멤버 목록: 아바타, 이름, 이메일, 역할, 가입일
- 역할 변경 (Admin: Member↔Admin / Owner: 전체)
- 멤버 제거 (확인 다이얼로그)
- 초대 버튼 → 이메일 입력 다이얼로그
- 초대 대기 목록 (pending invitations)

### 3.9 워크스페이스 설정 (/w/[workspaceSlug]/settings)

- 워크스페이스 이름 변경
- 슬러그 변경 (중복 체크)
- 현재 요금제 표시 + 업그레이드 링크
- 워크스페이스 삭제 (Owner만, 확인 입력 "워크스페이스명 입력" 방식)

### 3.10 결제 (/w/[workspaceSlug]/billing)

- 현재 구독 상태: 플랜명, 다음 결제일, 결제 금액
- 플랜 변경 (업그레이드/다운그레이드)
- 결제 수단 변경 (카드 등록/변경)
- 결제 내역 목록: 날짜, 금액, 상태, 영수증
- 구독 취소 (다음 결제일까지 유지 → 이후 Free로 다운그레이드)

### 3.11 공통 컴포넌트

**앱 사이드바 (워크스페이스 내)**

- 워크스페이스 이름 + 워크스페이스 전환 드롭다운
- 프로젝트 목록 (색상 도트 + 이름)
- 네비게이션: 대시보드, 멤버, 설정
- 하단: 프로필 + 로그아웃

**Header (랜딩 페이지)**

- 로고 + 기능 소개, 요금제 링크
- CTA: 로그인 / 무료로 시작하기

---

## 4. 멀티 테넌트 아키텍처

### 4.1 데이터 격리 전략

Supabase RLS(Row Level Security)를 활용한 행 수준 격리:

- 모든 워크스페이스 데이터 테이블은 `workspace_id` 컬럼 보유
- RLS 정책으로 현재 사용자가 속한 워크스페이스의 데이터만 조회/수정 허용
- 워크스페이스 멤버십은 `workspace_members` 테이블로 관리

### 4.2 URL 기반 워크스페이스 식별

- URL: `/w/[workspaceSlug]/...`
- Middleware에서 slug → workspace_id 변환 + 멤버십 검증
- 비멤버 접근 시 403 또는 리다이렉트

### 4.3 플랜 제한 적용

| 제한 항목 | 적용 위치 | 검증 방법 |
|---|---|---|
| 멤버 수 | 초대 시 | workspace.max_members와 현재 멤버 수 비교 |
| 프로젝트 수 | 프로젝트 생성 시 | 플랜별 제한과 현재 프로젝트 수 비교 |
| 파일 첨부 | 태스크 첨부 시 | Free 플랜이면 차단 + 업그레이드 유도 |
| 저장 용량 | 파일 업로드 시 | 워크스페이스 총 사용량 체크 |

---

## 5. 결제 시스템 (Toss Payments)

### 5.1 결제 플로우

1. Owner가 `/billing`에서 "Pro 업그레이드" 클릭
2. Toss Payments 카드 등록 위젯 표시
3. 카드 정보 입력 → Toss에서 `authKey` 발급
4. 서버에서 `authKey` + `customerKey`로 `billingKey` 발급 (POST /v1/billing/authorizations/issue)
5. `billingKey`를 DB에 저장
6. 첫 결제 즉시 실행 (POST /v1/billing/{billingKey})
7. 이후 매월 자동 결제 (Supabase Edge Function 또는 Cron)

### 5.2 테스트 환경

- Toss Payments 테스트 키 사용 (실제 결제 없음)
- 데모 시연 시 "테스트 환경" 표시
- 테스트 카드번호로 플로우 시연

### 5.3 결제 관련 API Routes

| 엔드포인트 | 메서드 | 역할 |
|---|---|---|
| `/api/payments/billing-key` | POST | 빌링키 발급 (카드 등록) |
| `/api/payments/subscribe` | POST | 구독 시작 (첫 결제) |
| `/api/payments/cancel` | POST | 구독 취소 |
| `/api/payments/webhook` | POST | Toss 결제 웹훅 수신 |

### 5.4 구독 상태 관리

| 상태 | 설명 |
|---|---|
| `active` | 정상 구독 중 |
| `canceled` | 취소됨 (current_period_end까지 유지) |
| `past_due` | 결제 실패 (재시도 3회 후 다운그레이드) |
| `free` | 무료 플랜 |

---

## 6. 비기능 요구사항 (NFR)

| 항목 | 목표 | 측정/검증 방법 |
|---|---|---|
| **Lighthouse 성능** | 85점 이상 (랜딩) / 앱은 별도 | Chrome DevTools Lighthouse |
| **반응형** | 768px ~ 1920px (앱은 데스크톱 우선) | 칸반보드 768px 이상에서 정상 작동 |
| **모바일** | 360px ~ 767px (리스트 뷰 대체) | 모바일에서 리스트 뷰 기본 표시 |
| **드래그 앤 드롭** | 60fps 유지 | 드래그 중 프레임 드롭 없음 |
| **실시간 동기화** | 3초 이내 | 다른 탭에서 변경 시 현재 탭에 반영 |
| **결제 플로우** | Toss 테스트 환경 정상 | 카드 등록 → 결제 → 웹훅 수신 |
| **데이터 격리** | RLS로 크로스 테넌트 접근 불가 | 다른 워크스페이스 데이터 조회 시도 시 빈 결과 |
| **다크 모드** | OS 설정 연동 + 수동 토글 | 전 프로젝트 공통 |

---

## 7. 기술 스택 선정

| 영역 | 기술 | 선정 사유 |
|---|---|---|
| **프레임워크** | Next.js 14+ (App Router) | 전 프로젝트 공통 |
| **언어** | TypeScript | 전 프로젝트 공통 |
| **스타일링** | Tailwind CSS | 전 프로젝트 공통 |
| **UI 컴포넌트** | shadcn/ui + Lucide React | Table, Dialog, Dropdown, Form, Calendar 등 |
| **DB / 백엔드** | Supabase (PostgreSQL) | 멀티 테넌트 RLS, Realtime, Auth, Storage |
| **드래그 앤 드롭** | @dnd-kit/core + @dnd-kit/sortable | React 생태계 표준. 접근성 지원 |
| **차트** | Recharts | 대시보드 차트 (파이, 바, 라인) |
| **상태 관리** | Zustand | 칸반 보드 상태, 워크스페이스 컨텍스트 |
| **결제** | Toss Payments (@tosspayments/tosspayments-sdk) | 한국 시장 표준 결제. 테스트 환경 제공 |
| **입력 검증** | Zod | 폼 검증 + API 입력값 검증 |
| **이메일** | Resend | 초대 이메일 발송 |
| **실시간** | Supabase Realtime | 보드 변경 실시간 동기화 |
| **배포** | Vercel | 전 프로젝트 공통 |

### 7.1 P3와 달라진 점

| 항목 | P3 | P4 |
|---|---|---|
| 데이터 모델 | 단일 사용자 기반 | 멀티 테넌트 (workspace 계층) |
| RLS | 사용자 기반 | 워크스페이스 멤버십 기반 |
| 결제 | 없음 | Toss Payments 구독형 |
| 드래그 앤 드롭 | 없음 | @dnd-kit 칸반보드 |
| 차트 | 없음 (관리자 기본 통계만) | Recharts 대시보드 |
| 실시간 | 알림만 | 보드 전체 동기화 |

---

## 8. 인프라 구성 및 배포

### 8.1 인프라 구성도

| 구성 요소 | 설명 |
|---|---|
| **소스 코드 저장소** | GitHub (Public Repository) |
| **빌드 & 배포** | Vercel |
| **CDN** | Vercel Edge Network |
| **DB** | Supabase PostgreSQL |
| **인증** | Supabase Auth (이메일 + 소셜) |
| **실시간** | Supabase Realtime (tasks, board_columns 테이블) |
| **파일 저장** | Supabase Storage (task-attachments 버킷) |
| **결제** | Toss Payments API (테스트 모드) |
| **이메일** | Resend (초대 메일) |
| **도메인** | taskflow-demo.vercel.app (무료) |

### 8.2 환경변수

| 변수명 | 용도 | 설정 위치 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Vercel + .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | Vercel + .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 키 | Vercel |
| `TOSS_CLIENT_KEY` | Toss Payments 클라이언트 키 (테스트) | Vercel + .env.local |
| `TOSS_SECRET_KEY` | Toss Payments 시크릿 키 (테스트) | Vercel |
| `RESEND_API_KEY` | 초대 이메일 발송 | Vercel |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL | Vercel |

### 8.3 비용

| 항목 | 요금제 | 월 비용 | 비고 |
|---|---|---|---|
| Vercel 호스팅 | Hobby (Free) | $0 | |
| Supabase | Free | $0 | P4+P5 프로젝트 공유 |
| Toss Payments | 테스트 모드 | $0 | 실제 결제 없음 |
| Resend | Free | $0 | |
| **총합** | | **$0/월** | |

---

## 9. 폴더 구조 및 파일 컨벤션

| 경로 | 역할 |
|---|---|
| `src/app/(marketing)/` | 랜딩, 요금제 (비인증 페이지) |
| `src/app/(auth)/auth/` | 로그인, 회원가입 |
| `src/app/(app)/w/[workspaceSlug]/` | 워크스페이스 내 앱 페이지 |
| `src/app/(app)/w/[workspaceSlug]/layout.tsx` | 앱 레이아웃 (사이드바 + 워크스페이스 컨텍스트) |
| `src/app/(app)/w/[workspaceSlug]/p/[projectId]/` | 프로젝트 (칸반보드, 리스트 뷰) |
| `src/app/(app)/w/[workspaceSlug]/dashboard/` | 대시보드 |
| `src/app/(app)/w/[workspaceSlug]/members/` | 멤버 관리 |
| `src/app/(app)/w/[workspaceSlug]/settings/` | 설정 |
| `src/app/(app)/w/[workspaceSlug]/billing/` | 결제 |
| `src/app/(app)/onboarding/` | 온보딩 |
| `src/app/(app)/settings/` | 개인 설정 |
| `src/app/api/payments/` | 결제 API Routes |
| `src/app/api/invitations/` | 초대 API Routes |
| `src/components/kanban/` | KanbanBoard, KanbanColumn, TaskCard, TaskModal |
| `src/components/dashboard/` | StatCard, PieChart, BarChart, LineChart |
| `src/components/workspace/` | Sidebar, WorkspaceSwitcher, MemberList |
| `src/components/billing/` | PricingTable, SubscriptionStatus, PaymentHistory |
| `src/components/ui/` | shadcn/ui 컴포넌트 |
| `src/hooks/` | useWorkspace, useRealtimeBoard, useTasks |
| `src/stores/` | board.ts (칸반 상태), workspace.ts (워크스페이스 컨텍스트) |
| `src/lib/supabase/` | client.ts, server.ts, middleware.ts |
| `src/lib/toss/` | Toss Payments 유틸리티 |
| `src/types/` | database.ts, 공통 타입 |

---

## 10. Supabase 스키마 설계

### 10.1 테이블 목록

| 테이블 | 역할 | RLS 핵심 조건 |
|---|---|---|
| `workspaces` | 워크스페이스 (테넌트) | 멤버만 접근 |
| `workspace_members` | 워크스페이스 멤버십 | 본인 또는 같은 워크스페이스 멤버 |
| `workspace_invitations` | 초대 대기 | 초대 대상 또는 Admin+ |
| `projects` | 프로젝트 | 워크스페이스 멤버만 |
| `board_columns` | 칸반 컬럼 | 워크스페이스 멤버만 |
| `tasks` | 태스크 (카드) | 워크스페이스 멤버만 |
| `task_comments` | 태스크 댓글 | 워크스페이스 멤버만 |
| `task_attachments` | 태스크 첨부파일 | 워크스페이스 멤버만 (Pro 이상) |
| `activity_logs` | 활동 로그 | 워크스페이스 멤버만 |
| `subscriptions` | 구독/결제 정보 | Owner만 |
| `labels` | 라벨 정의 | 워크스페이스 멤버만 |

### 10.2 workspaces 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `name` | TEXT | NOT NULL | 워크스페이스 이름 |
| `slug` | TEXT | UNIQUE, NOT NULL | URL 슬러그 |
| `owner_id` | UUID | FK→auth.users, NOT NULL | 소유자 |
| `plan` | TEXT | DEFAULT 'free' | 'free' / 'pro' / 'business' |
| `max_members` | INT | DEFAULT 5 | 플랜별 멤버 제한 |
| `max_projects` | INT | DEFAULT 3 | 플랜별 프로젝트 제한 |
| `logo_url` | TEXT | | 워크스페이스 로고 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 10.3 workspace_members 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `workspace_id` | UUID | FK→workspaces, ON DELETE CASCADE | |
| `user_id` | UUID | FK→auth.users | |
| `role` | TEXT | DEFAULT 'member' | 'owner' / 'admin' / 'member' |
| `joined_at` | TIMESTAMPTZ | DEFAULT now() | |
| — | — | UNIQUE(workspace_id, user_id) | 중복 방지 |

### 10.4 projects 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `workspace_id` | UUID | FK→workspaces, ON DELETE CASCADE | |
| `name` | TEXT | NOT NULL | 프로젝트명 |
| `description` | TEXT | | 설명 |
| `color` | TEXT | DEFAULT '#3B82F6' | 테마 색상 |
| `is_archived` | BOOLEAN | DEFAULT false | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 10.5 board_columns 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `project_id` | UUID | FK→projects, ON DELETE CASCADE | |
| `name` | TEXT | NOT NULL | 컬럼명 ('To Do' 등) |
| `position` | INT | NOT NULL | 좌→우 순서 |
| `color` | TEXT | | 컬럼 색상 |

### 10.6 tasks 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `column_id` | UUID | FK→board_columns, ON DELETE CASCADE | |
| `project_id` | UUID | FK→projects, ON DELETE CASCADE | |
| `title` | TEXT | NOT NULL | |
| `description` | TEXT | | Markdown |
| `assignee_id` | UUID | FK→auth.users, NULL | 담당자 |
| `priority` | TEXT | DEFAULT 'medium' | 'urgent' / 'high' / 'medium' / 'low' |
| `due_date` | DATE | | 마감일 |
| `labels` | TEXT[] | | 라벨 배열 |
| `position` | INT | NOT NULL | 컬럼 내 순서 |
| `is_completed` | BOOLEAN | DEFAULT false | |
| `created_by` | UUID | FK→auth.users | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

### 10.7 subscriptions 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `workspace_id` | UUID | FK→workspaces, UNIQUE | |
| `toss_customer_key` | TEXT | | Toss 고객 키 |
| `toss_billing_key` | TEXT | | Toss 빌링 키 |
| `plan` | TEXT | NOT NULL | 'pro' / 'business' |
| `status` | TEXT | DEFAULT 'active' | 'active' / 'canceled' / 'past_due' |
| `current_period_start` | TIMESTAMPTZ | | 현재 구독 기간 시작 |
| `current_period_end` | TIMESTAMPTZ | | 현재 구독 기간 종료 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 10.8 RLS 정책 핵심

모든 앱 데이터 테이블의 RLS 정책은 동일한 패턴:

```
-- 워크스페이스 멤버만 SELECT/INSERT/UPDATE/DELETE 가능
CREATE POLICY "Members can access" ON [table]
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = [table].workspace_id  -- 직접 또는 JOIN으로
        AND wm.user_id = auth.uid()
    )
  );
```

tasks, board_columns처럼 workspace_id를 직접 갖지 않는 테이블은 projects를 경유하여 JOIN.

### 10.9 Storage 버킷

| 버킷명 | 공개 | 용도 |
|---|---|---|
| `task-attachments` | private (RLS) | 태스크 첨부파일 (Pro 이상) |
| `workspace-logos` | public | 워크스페이스 로고 |
| `avatars` | public | 사용자 아바타 |

---

## 11. 실시간 기능 설계

### 11.1 Supabase Realtime 구독 대상

| 테이블 | 이벤트 | 필터 | 용도 |
|---|---|---|---|
| `tasks` | INSERT, UPDATE, DELETE | `project_id=eq.{currentProjectId}` | 칸반보드 실시간 동기화 |
| `board_columns` | INSERT, UPDATE, DELETE | `project_id=eq.{currentProjectId}` | 컬럼 추가/삭제/이름변경 |
| `task_comments` | INSERT | `task_id=eq.{openTaskId}` | 열린 태스크의 새 댓글 |

### 11.2 동기화 전략

- 낙관적 업데이트: 드래그 앤 드롭 시 UI 즉시 반영 → DB 저장 → 실패 시 롤백
- 다른 사용자의 변경: Realtime 이벤트 수신 → Zustand 스토어 업데이트 → UI 자동 반영
- 충돌 해결: 마지막 쓰기 승리 (Last Write Wins) — 데모 수준에서 충분

---

## 12. 개발 일정 (4주)

### Week 1: 인프라 + 인증 + 멀티 테넌트

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 1** | 프로젝트 초기화, Supabase 스키마 전체 실행, RLS 정책 적용, Vercel 최초 배포 | DB + RLS 완성 |
| **Day 2** | 랜딩 페이지 + 요금제 페이지 | 마케팅 페이지 완성 |
| **Day 3** | 인증 (로그인/회원가입) + 온보딩 (워크스페이스 생성) | 가입 → 워크스페이스 생성 플로우 |
| **Day 4** | 워크스페이스 레이아웃 (사이드바) + 워크스페이스 홈 | 프로젝트 목록 + 사이드바 |
| **Day 5** | 멤버 관리 + 초대 이메일 | 멤버 초대 → 이메일 → 합류 플로우 |

### Week 2: 칸반보드

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 6** | 칸반보드 레이아웃 + 컬럼 CRUD | 컬럼 표시 + 추가/삭제 |
| **Day 7** | 태스크 카드 + 생성/삭제 | 카드 생성 → 컬럼에 표시 |
| **Day 8** | 드래그 앤 드롭 (@dnd-kit) — 같은 컬럼 내 + 컬럼 간 | DnD 정상 작동 + DB 동기화 |
| **Day 9** | 태스크 상세 모달 (제목, 설명, 담당자, 마감일, 우선순위, 라벨) | 모달에서 태스크 편집 가능 |
| **Day 10** | 태스크 댓글 + 활동 로그 | 태스크 내 토론 + 변경 이력 |

### Week 3: 뷰 + 대시보드 + 결제

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 11** | 리스트 뷰 (테이블 + 인라인 편집) + 필터/정렬 | 리스트 뷰 정상 + 필터 |
| **Day 12** | 대시보드 (통계 카드 + 4개 차트) | Recharts 차트 렌더링 |
| **Day 13** | Toss Payments 연동 — 카드 등록 + 빌링키 발급 | 테스트 카드 등록 성공 |
| **Day 14** | 구독 관리 (플랜 변경, 취소) + 결제 내역 | 결제 플로우 완성 |
| **Day 15** | 워크스페이스 설정 + 개인 설정 | 설정 페이지 완성 |

### Week 4: 실시간 + 폴리싱

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 16** | Supabase Realtime — 보드 실시간 동기화 | 2개 탭에서 변경 동기화 확인 |
| **Day 17** | 플랜 제한 적용 (멤버 수, 프로젝트 수, 첨부파일) | Free 플랜 제한 → 업그레이드 유도 |
| **Day 18~19** | 반응형 QA (데스크톱 + 태블릿) + 모바일 리스트 뷰 | 768px 이상 칸반보드 + 모바일 리스트 뷰 |
| **Day 20** | 더미 데이터 시딩 (워크스페이스, 멤버, 프로젝트, 태스크) | 의미 있는 데모 데이터 |
| **Day 21** | Lighthouse 최적화 (랜딩), 스크린샷, README | Lighthouse 85+ (랜딩) |

---

## 13. 완료 기준 (Definition of Done)

### 필수 완료 조건

1. Vercel에 배포되어 공개 URL에서 접근 가능
2. GitHub Public Repository에 소스 코드 공개 + README
3. 멀티 테넌트: 워크스페이스 생성 + 멤버 초대 + 데이터 격리(RLS) 정상
4. 칸반보드: 드래그 앤 드롭 (컬럼 내 + 컬럼 간) 정상 + DB 동기화
5. 태스크 CRUD: 생성, 수정(상세 모달), 삭제, 상태 변경 정상
6. 대시보드: 통계 카드 + 차트 4개 렌더링
7. Toss Payments: 카드 등록 → 빌링키 발급 → 테스트 결제 플로우 정상
8. 실시간: 2개 브라우저 탭에서 보드 변경 동기화 확인
9. 역할 기반 접근 제어: Owner/Admin/Member 권한 분리 작동
10. 랜딩 페이지 Lighthouse 85점 이상

### 권장 완료 조건

- 리스트 뷰 (테이블 + 인라인 편집)
- 플랜 제한 적용 (Free 멤버 5명 제한 등)
- 초대 이메일 발송 + 합류 플로우
- 더미 데이터 시딩 (의미 있는 프로젝트 관리 데이터)
- P1 포트폴리오 사이트에 케이스 스터디 작성
- 디바이스 목업 스크린샷 (데스크톱 + 태블릿 각 3~5장)
- 30~60초 데모 영상 (칸반 DnD + 실시간 동기화 + 결제 시연)
