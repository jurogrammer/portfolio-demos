# P6. Google Sheets 재고관리 대시보드

> 요구사항 명세서 및 인프라 구성 가이드
> 위시켓 웹개발 포트폴리오 프로젝트 시리즈
> 버전 1.0 | 2026년 3월

---

## 목차

1. 프로젝트 개요
2. 페이지 구성 및 기능 요구사항
3. 비기능 요구사항 (NFR)
4. 기술 스택 선정
5. 인프라 구성 및 배포
6. 폴더 구조 및 파일 컨벤션
7. Google Sheets 데이터 스키마
8. SEO 및 성능 최적화 체크리스트
9. 개발 일정 (2.5일)
10. 완료 기준 (Definition of Done)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | Google Sheets 재고관리 대시보드 (위시켓 포트폴리오용) |
| **목적** | Google Spreadsheet를 유일한 데이터 저장소로 사용하는 소규모 재고관리 대시보드. DB 없이 Google Sheets API v4로 CRUD를 수행하여, 한국 소규모 사업자가 이미 사용 중인 스프레드시트 위에 커스텀 관리 UI를 얹는 실용적 시나리오를 시연한다. |
| **기간** | 2.5일 (~19시간) |
| **타겟 사용자** | 위시켓 클라이언트 (소규모 사업자, 스타트업), Google Sheets로 데이터를 관리하는 비기술 직원 |
| **핵심 성공 지표** | Google Sheets ↔ 대시보드 실시간 CRUD 동기화, 반응형 UI, `pnpm build` 성공 |

### 1.1 배경

많은 한국 소규모 사업체가 Google Sheets를 재고, 주문, 고객 관리 도구로 사용한다. 별도 DB를 구축하지 않고 기존 스프레드시트를 그대로 활용하면서 전용 대시보드 UI를 제공하는 것은 실무에서 자주 요청되는 프리랜서 개발 사례다. 이 프로젝트는 Google Sheets API 연동 역량을 포트폴리오로 증명한다.

### 1.2 사이트맵

| URL 경로 | 페이지명 | 역할 |
|---|---|---|
| `/` | 루트 | → `/dashboard` 리다이렉트 |
| `/dashboard` | 대시보드 개요 | 통계 카드 + 최근 변경 항목 |
| `/dashboard/inventory` | 재고관리 | 전체 재고 테이블, 검색/필터, CRUD |
| `/dashboard/categories` | 카테고리 관리 | 카테고리 목록, 추가/수정/삭제 |
| `/dashboard/settings` | 설정 | 스프레드시트 연결 정보, 동기화 |

---

## 2. 페이지 구성 및 기능 요구사항

### 2.1 대시보드 개요 (/dashboard)

**통계 카드 섹션**

- 4개 카드: 전체 품목 수, 재고부족 경고 수, 총 재고 가치 (₩), 카테고리 수
- 각 카드: 아이콘 + 수치 + 변화 표시 (선택)
- Server Component로 서버 측 데이터 로딩

**최근 변경 항목**

- 최근 수정된 재고 5개 항목 테이블
- 컬럼: SKU, 상품명, 수량, 최종수정일
- 항목 클릭 시 재고관리 페이지로 이동

### 2.2 재고관리 (/dashboard/inventory)

**필터 영역**

- 검색바: SKU 또는 상품명으로 검색 (클라이언트 측 필터)
- 카테고리 드롭다운: 전체 / 각 카테고리별 필터
- 재고부족 토글: ON 시 카테고리별 기준 미달 항목만 표시

**재고 테이블**

- shadcn/ui Table 컴포넌트
- 컬럼: SKU, 상품명, 카테고리, 수량, 단가(₩), 공급업체, 최종수정일, 비고, 작업
- 컬럼 헤더 클릭 시 정렬 (클라이언트 측)
- 페이지네이션: 20행 단위 (클라이언트 측, 시트 데이터 < 1000행 가정)
- 재고부족 항목은 행 배경색 강조 (Badge 또는 배경색)

**항목 추가**

- "항목 추가" 버튼 → Dialog 열림
- 폼 필드: SKU, 상품명, 카테고리(Select), 수량, 단가, 공급업체, 비고
- SKU 자동 생성 규칙: `INV-{3자리 넘버링}` (다음 번호 자동 계산)
- 폼 검증: 필수 필드 (상품명, 카테고리, 수량, 단가), 수량/단가 숫자 검증
- Server Action으로 Google Sheets에 행 추가 (append)
- React 19 `useOptimistic`으로 낙관적 업데이트
- Sonner 토스트로 성공/실패 피드백

**항목 수정**

- 각 행의 "수정" 버튼 → Dialog에 기존 데이터 프리필
- Server Action으로 해당 행 업데이트
- 최종수정일 자동 갱신

**항목 삭제**

- 각 행의 "삭제" 버튼 → AlertDialog 확인
- Server Action으로 해당 행 삭제

### 2.3 카테고리 관리 (/dashboard/categories)

- 카테고리 목록: 이름, 설명, 재고부족 기준수량
- 추가/수정: Dialog 폼
- 삭제: AlertDialog 확인 (해당 카테고리 소속 재고 있을 경우 경고)
- "Categories" 시트 탭에서 관리

### 2.4 설정 (/dashboard/settings)

- 연결된 스프레드시트 ID 표시
- 스프레드시트 이름 표시
- "Google Sheets에서 열기" 외부 링크 버튼
- 마지막 동기화 시간 표시
- 수동 새로고침 버튼 (revalidatePath)

### 2.5 공통 컴포넌트

**DashboardSidebar**

- 좌측 사이드바: 로고 + 네비게이션 링크 (개요, 재고관리, 카테고리, 설정)
- 현재 페이지 활성 상태 표시
- 하단: Google Sheets 아이콘 + "Powered by Google Sheets" 텍스트
- 모바일: Sheet 컴포넌트로 햄버거 토글

**DashboardHeader**

- 상단 바: 현재 페이지 제목 + 새로고침 버튼
- 모바일: 사이드바 토글 버튼

---

## 3. 비기능 요구사항 (NFR)

| 항목 | 목표 | 측정/검증 방법 |
|---|---|---|
| **빌드 성공** | `pnpm build` 에러 없이 완료 | CI/Vercel 빌드 로그 확인 |
| **반응형** | 360px ~ 1920px 대응 | Chrome DevTools 디바이스 모드 |
| **다크 모드** | OS 설정 연동 + 수동 토글 | prefers-color-scheme + CSS 변수 |
| **API 응답 속도** | Google Sheets 읽기 < 2초 | Server Action 응답 시간 측정 |
| **에러 처리** | 모든 API 호출에 에러 핸들링 | Google Sheets API 오류 시 사용자 친화적 메시지 |
| **접근성** | 시맨틱 HTML, 키보드 네비게이션 | shadcn/ui 기본 접근성 활용 |
| **번들 사이즈** | First Load JS < 150KB | next build 출력 확인 |

---

## 4. 기술 스택 선정

| 영역 | 기술 | 선정 사유 |
|---|---|---|
| **프레임워크** | Next.js 16 (App Router) | Server Actions로 Google Sheets API 서버 측 호출. P1~P5와 동일 스택 |
| **언어** | TypeScript | 시트 데이터 ↔ 타입 매핑으로 안전한 CRUD 보장 |
| **스타일링** | Tailwind CSS v4 | 대시보드 레이아웃에 유틸리티 퍼스트 적합 |
| **UI 컴포넌트** | shadcn/ui v4 + Lucide React | Table, Dialog, Card 등 대시보드 필수 컴포넌트 제공 |
| **Google Sheets** | `googleapis` npm 패키지 | Google 공식 Node.js 클라이언트. Sheets API v4 완전 지원 |
| **인증** | Service Account | 서버 전용, OAuth 동의 화면 불필요, 데모에 적합 |
| **상태 관리** | React 19 내장 (useOptimistic, useTransition) | 별도 상태 라이브러리 불필요 |
| **토스트** | Sonner | shadcn/ui 호환, 경량 토스트 알림 |
| **배포** | Vercel | 모노레포 Root Directory 설정으로 독립 배포 |
| **패키지 매니저** | pnpm | P1~P5와 동일 |

### 4.1 선택하지 않은 기술과 사유

| 후보 기술 | 선택 기술 | 제외 사유 |
|---|---|---|
| Supabase / PostgreSQL | Google Sheets | 프로젝트 핵심이 "기존 시트를 DB로 활용"하는 시나리오 시연 |
| Google Sheets REST (직접 호출) | `googleapis` 패키지 | 공식 패키지가 인증, 페이지네이션, 타입 지원을 대신 처리 |
| OAuth 2.0 (사용자 인증) | Service Account | 데모용이므로 사용자 로그인 없이 서버 측에서 직접 접근 |
| Prisma / Drizzle | 없음 (ORM 불필요) | DB가 아닌 Google Sheets를 사용하므로 ORM 불필요 |
| React Query / SWR | useOptimistic + revalidatePath | Server Actions + Next.js 캐시 재검증으로 충분 |
| Zustand / Jotai | React 19 내장 | 전역 상태 필요 없음, 페이지별 서버 데이터 로딩 |

---

## 5. 인프라 구성 및 배포

### 5.1 인프라 구성도

| 구성 요소 | 설명 |
|---|---|
| **소스 코드 저장소** | GitHub (기존 portfolio-demos 모노레포) |
| **빌드 & 배포** | Vercel (Root Directory: `p6-sheets-dashboard`) |
| **데이터 저장소** | Google Spreadsheet (Sheets API v4) |
| **인증** | Google Cloud Service Account |
| **CDN** | Vercel Edge Network (자동) |
| **SSL** | Vercel 자동 발급 |

### 5.2 배포 파이프라인

1. GitHub main 브랜치에 Push
2. Vercel이 `p6-sheets-dashboard/` 디렉토리 감지 → `pnpm build` 실행
3. 서버 사이드에서 Google Sheets API 호출 (Server Actions)
4. Vercel Edge Network에 배포

### 5.3 환경변수

| 변수명 | 용도 | 설정 위치 |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account 이메일 주소 | Vercel Environment Variables |
| `GOOGLE_PRIVATE_KEY_BASE64` | Service Account 프라이빗 키 (base64 인코딩) | Vercel Environment Variables |
| `GOOGLE_SPREADSHEET_ID` | 대상 스프레드시트 ID | Vercel Environment Variables |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL | Vercel Environment Variables |

**Private Key base64 인코딩 이유**: Google Service Account의 프라이빗 키에 포함된 개행 문자(`\n`)가 Vercel 환경변수에서 깨지는 문제를 방지. `sheets.ts`에서 `Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64!, 'base64').toString('utf-8')`로 디코딩.

### 5.4 Google Cloud 셋업 절차

1. Google Cloud Console에서 프로젝트 생성
2. "Google Sheets API" 활성화
3. "서비스 계정" 생성 → JSON 키 파일 다운로드
4. JSON 키에서 `client_email`과 `private_key` 추출
5. `private_key`를 base64 인코딩: `echo -n "키 내용" | base64`
6. 대상 Google Spreadsheet를 Service Account 이메일에 "편집자" 권한으로 공유

### 5.5 비용

| 항목 | 요금제 | 월 비용 | 비고 |
|---|---|---|---|
| Vercel 호스팅 | Hobby (Free) | $0 | 개인 프로젝트 충분 |
| Google Cloud | Free Tier | $0 | Sheets API 무료 한도: 분당 60회 읽기, 분당 60회 쓰기 |
| GitHub | Free | $0 | 기존 모노레포 |
| **총합** | | **$0/월** | |

---

## 6. 폴더 구조 및 파일 컨벤션

```
p6-sheets-dashboard/
├── .env.example
├── components.json                   ← shadcn/ui v4 설정
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── src/
    ├── app/
    │   ├── layout.tsx                ← Root layout (Geist 폰트, metadata, Toaster)
    │   ├── globals.css               ← Tailwind v4 + shadcn imports
    │   ├── page.tsx                  ← → /dashboard 리다이렉트
    │   └── (dashboard)/
    │       ├── layout.tsx            ← 사이드바 + 헤더 레이아웃
    │       └── dashboard/
    │           ├── page.tsx          ← 개요: 통계 카드 + 최근 변경
    │           ├── actions.ts        ← 개요 데이터 Server Actions
    │           ├── inventory/
    │           │   ├── page.tsx      ← 재고 테이블 (검색/필터/페이지네이션)
    │           │   └── actions.ts    ← 재고 CRUD Server Actions
    │           ├── categories/
    │           │   ├── page.tsx      ← 카테고리 관리
    │           │   └── actions.ts    ← 카테고리 CRUD Server Actions
    │           └── settings/
    │               └── page.tsx      ← 시트 연결 정보 + 동기화
    ├── components/
    │   ├── layout/
    │   │   ├── DashboardSidebar.tsx  ← 좌측 사이드바 네비게이션
    │   │   └── DashboardHeader.tsx   ← 상단 바 (제목 + 새로고침)
    │   ├── dashboard/
    │   │   ├── StatsCards.tsx        ← 통계 카드 4개
    │   │   └── RecentActivity.tsx    ← 최근 변경 테이블
    │   ├── inventory/
    │   │   ├── InventoryTable.tsx    ← 메인 데이터 테이블 (client)
    │   │   ├── InventoryForm.tsx     ← 추가/수정 Dialog 폼 (client)
    │   │   ├── InventoryActions.tsx  ← 행 수정/삭제 버튼 (client)
    │   │   ├── InventoryFilters.tsx  ← 검색 + 카테고리 필터 (client)
    │   │   └── LowStockAlert.tsx     ← 재고부족 경고 배너
    │   ├── categories/
    │   │   └── CategoryList.tsx      ← 카테고리 목록 + CRUD UI
    │   └── ui/                       ← shadcn/ui 컴포넌트
    ├── lib/
    │   ├── utils.ts                  ← cn() 유틸리티
    │   ├── constants.ts              ← 시트 컬럼 매핑, 설정 상수
    │   └── google/
    │       ├── sheets.ts             ← Service Account 인증 클라이언트
    │       ├── inventory.ts          ← 재고 CRUD 함수 (getItems, addItem, updateItem, deleteItem)
    │       └── helpers.ts            ← row ↔ 타입 변환 유틸리티
    └── types/
        └── inventory.ts              ← InventoryItem, Category, InventoryFilters, ActionResult
```

### 6.1 파일 네이밍 컨벤션

P1~P5와 동일:
- 컴포넌트: PascalCase (`StatsCards.tsx`, `InventoryTable.tsx`)
- 유틸리티: camelCase (`utils.ts`, `sheets.ts`)
- 페이지 파일: `page.tsx` (Next.js 컨벤션)
- 레이아웃: `layout.tsx` (Next.js 컨벤션)
- Server Actions: `actions.ts` (라우트 디렉토리와 같은 위치)

---

## 7. Google Sheets 데이터 스키마

### 7.1 "Inventory" 시트 탭

| 컬럼 | 필드명 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| A | SKU | string | Y | 자동 생성 (`INV-001` 형식) |
| B | 상품명 | string | Y | 재고 항목 이름 |
| C | 카테고리 | string | Y | Categories 탭의 카테고리명 참조 |
| D | 수량 | number | Y | 현재 재고 수량 |
| E | 단가 | number | Y | 원(₩) 단위 |
| F | 공급업체 | string | N | 공급업체명 |
| G | 최종수정일 | string | Y | ISO 8601 (YYYY-MM-DD) 자동 갱신 |
| H | 비고 | string | N | 자유 메모 |

**Row 1**: 헤더 행 (읽기 시 스킵)

### 7.2 "Categories" 시트 탭

| 컬럼 | 필드명 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| A | 카테고리명 | string | Y | 고유 이름 |
| B | 설명 | string | N | 카테고리 설명 |
| C | 재고부족 기준 | number | Y | 이 수량 미만이면 재고부족 경고 표시 |

### 7.3 샘플 데이터

**Inventory 탭** (15~20행):

| SKU | 상품명 | 카테고리 | 수량 | 단가 | 공급업체 | 최종수정일 | 비고 |
|---|---|---|---|---|---|---|---|
| INV-001 | USB-C 케이블 (1m) | 전자기기 | 150 | 5000 | 삼성전자 | 2026-03-20 | 인기상품 |
| INV-002 | 무선 마우스 | 전자기기 | 12 | 25000 | 로지텍 | 2026-03-18 | 재고 부족 주의 |
| INV-003 | A4 복사용지 (500매) | 사무용품 | 200 | 8000 | 한솔제지 | 2026-03-15 | |
| INV-004 | 모니터 암 | 가구 | 8 | 45000 | 카멜마운트 | 2026-03-22 | |
| INV-005 | 형광펜 세트 (5색) | 사무용품 | 300 | 3000 | 모나미 | 2026-03-10 | |
| INV-006 | 27인치 모니터 | 전자기기 | 5 | 350000 | LG전자 | 2026-03-25 | 고가 품목 |
| INV-007 | 스탠딩 데스크 | 가구 | 3 | 280000 | 시디즈 | 2026-03-19 | |
| INV-008 | 블루투스 키보드 | 전자기기 | 45 | 55000 | 로지텍 | 2026-03-21 | |
| INV-009 | 포스트잇 (76x76mm) | 사무용품 | 500 | 2000 | 3M | 2026-03-14 | |
| INV-010 | 노트북 파우치 (15인치) | 전자기기 | 30 | 18000 | 쿠팡 | 2026-03-23 | |
| INV-011 | 사무용 의자 | 가구 | 2 | 420000 | 시디즈 | 2026-03-17 | 재입고 예정 |
| INV-012 | 화이트보드 (120x90) | 사무용품 | 10 | 35000 | 아이보드 | 2026-03-12 | |
| INV-013 | HDMI 케이블 (2m) | 전자기기 | 80 | 8000 | 벨킨 | 2026-03-20 | |
| INV-014 | 에어팟 프로 2 | 전자기기 | 7 | 329000 | 애플 | 2026-03-24 | |
| INV-015 | 책상 정리함 | 가구 | 25 | 15000 | 이케아 | 2026-03-16 | |

**Categories 탭**:

| 카테고리명 | 설명 | 재고부족 기준 |
|---|---|---|
| 전자기기 | 전자 제품 및 액세서리 | 10 |
| 사무용품 | 사무실 소모품 및 비품 | 30 |
| 가구 | 사무 가구 및 인테리어 | 5 |
| 식음료 | 사무실 음료 및 간식 | 20 |

### 7.4 TypeScript 타입 정의

```typescript
interface InventoryItem {
  rowIndex: number        // Google Sheets 행 번호 (업데이트/삭제용, 2부터 시작)
  sku: string             // INV-001 형식
  name: string            // 상품명
  category: string        // Categories 탭 참조
  quantity: number        // 현재 수량
  unitPrice: number       // 원(₩) 단위
  supplier: string        // 공급업체
  lastUpdated: string     // YYYY-MM-DD
  notes: string           // 비고
}

interface Category {
  rowIndex: number
  name: string
  description: string
  lowStockThreshold: number
}

interface InventoryFilters {
  search: string
  category: string        // '' = 전체
  lowStockOnly: boolean
}

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

---

## 8. SEO 및 성능 최적화 체크리스트

### 8.1 성능

- Server Components 기본 → 클라이언트 JS 최소화
- `'use client'` 경계를 컴포넌트 트리 말단으로 밀어내기
- Google Sheets API 호출은 모두 서버 측 (Server Actions)
- 테이블 데이터 로딩 시 Skeleton UI 표시
- `next/font`로 Geist 폰트 로딩 최적화

### 8.2 사용자 경험

- 낙관적 업데이트: CRUD 작업 시 UI 즉시 반영, 서버 응답 후 확정
- Sonner 토스트: 성공/실패/에러 알림
- 로딩 상태: Button 내 spinner, Skeleton 컴포넌트
- 에러 바운더리: Google Sheets API 연결 실패 시 안내 메시지

### 8.3 접근성

- shadcn/ui 기본 접근성 (Radix UI 기반)
- 시맨틱 HTML (nav, main, table, thead, tbody)
- 키보드 네비게이션: Dialog 포커스 트랩, Table 탐색

---

## 9. 개발 일정 (2.5일)

| 시간 | 작업 내용 | 완료 기준 |
|---|---|---|
| **0~1h** | 프로젝트 스캐폴딩 (Next.js, shadcn/ui, 설정 파일) | `pnpm dev` 기본 페이지 확인 |
| **1~4h** | Google Sheets 클라이언트 + CRUD 함수 (`lib/google/`) | 콘솔에서 시트 데이터 읽기/쓰기 확인 |
| **4~6h** | Server Actions + 타입 정의 | Server Action 호출 시 시트 데이터 변경 확인 |
| **6~7.5h** | 대시보드 레이아웃 (사이드바 + 헤더) | 반응형 레이아웃 정상 작동 |
| **7.5~9h** | 대시보드 개요 페이지 | 통계 카드 + 최근 변경 테이블 렌더링 |
| **9~12h** | 재고관리 페이지 (테이블 + 필터 + 페이지네이션) | 데이터 표시, 검색/필터 작동 |
| **12~14.5h** | 추가/수정/삭제 Dialog + 낙관적 업데이트 | CRUD 전 기능 + 토스트 알림 |
| **14.5~15.5h** | 카테고리 관리 페이지 | 카테고리 CRUD 정상 작동 |
| **15.5~16h** | 설정 페이지 | 스프레드시트 정보 + 동기화 버튼 |
| **16~17h** | 다크모드 + 반응형 QA | 360px~1920px 전 구간 정상 |
| **17~19h** | 빌드 확인, 버그 수정, 코드 정리 | `pnpm build` 성공, Vercel 배포 |

---

## 10. 완료 기준 (Definition of Done)

### 필수 완료 조건

1. Vercel에 배포되어 공개 URL에서 접근 가능
2. Google Sheets에서 데이터를 읽어 대시보드에 표시
3. 대시보드에서 항목 추가 → Google Sheets에 행 추가 확인
4. 대시보드에서 항목 수정 → Google Sheets에 셀 업데이트 확인
5. 대시보드에서 항목 삭제 → Google Sheets에 행 삭제 확인
6. 검색/필터/정렬/페이지네이션 정상 작동
7. 모바일(360px) ~ 데스크톱(1920px) 반응형 정상 작동
8. 다크/라이트 모드 전환 정상
9. `pnpm build` 에러 없이 성공
10. 루트 `CLAUDE.md`에 P6 섹션 추가

### 권장 완료 조건

- 재고부족 항목 시각적 강조 (Badge 또는 배경색)
- 낙관적 업데이트로 UI 즉시 반영
- Sonner 토스트 알림 (성공/실패)
- Skeleton 로딩 UI
- Google Sheets API 에러 시 사용자 친화적 에러 메시지
