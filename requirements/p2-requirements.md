# P2. 기업 홈페이지 "TechVision Solutions"

> 요구사항 명세서 및 인프라 구성 가이드
> 위시켓 웹개발 포트폴리오 프로젝트 시리즈
> 버전 1.0 | 2025년 3월

---

## 목차

1. 프로젝트 개요
2. 페이지 구성 및 기능 요구사항
3. 어드민 CMS 요구사항
4. 비기능 요구사항 (NFR)
5. 기술 스택 선정
6. 인프라 구성 및 배포
7. 폴더 구조 및 파일 컨벤션
8. Supabase 스키마 설계
9. 다국어(i18n) 전략
10. SEO 및 성능 최적화 체크리스트
11. 개발 일정 (2주)
12. 완료 기준 (Definition of Done)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | TechVision Solutions 기업 홈페이지 |
| **목적** | 위시켓 최다 수요 유형(기업 홈페이지, 평균 ₩460만)을 완성도 있게 구현. 비개발자 관리자가 콘텐츠를 관리할 수 있는 CMS 포함이 핵심 차별점 |
| **기간** | Week 2~4 (14일) |
| **타겟 사용자** | (가상) TechVision Solutions 회사 방문자 + 관리자 |
| **핵심 성공 지표** | SSG+ISR 하이브리드 렌더링, 어드민 CMS CRUD 완성, 다국어(한/영) 지원, Lighthouse 90+ |

### 1.1 배경

기업 홈페이지는 위시켓에서 물량 기준 가장 많은 프로젝트 유형이며, 진입 장벽이 낮아 첫 수주 확보에 적합하다. 대부분의 경쟁자는 정적 퍼블리싱만 제공하지만, Supabase 기반 CMS를 포함하면 "비개발자도 콘텐츠를 직접 관리 가능"이라는 핵심 셀링 포인트를 확보할 수 있다.

### 1.2 사이트맵

| URL 경로 | 페이지명 | 렌더링 전략 | 역할 |
|---|---|---|---|
| `/` | 홈 | SSG | Hero 슬라이더, 서비스 하이라이트, 고객사 로고, CTA |
| `/about` | 회사 소개 | SSG | 회사 연혁(타임라인), 팀 소개, 비전/미션 |
| `/services` | 서비스 | SSG | 서비스 목록 + 상세 |
| `/portfolio` | 포트폴리오 | ISR (60초) | 프로젝트 사례 갤러리 (필터링) |
| `/news` | 뉴스/블로그 | ISR (60초) | 뉴스 목록 (페이지네이션) |
| `/news/[slug]` | 뉴스 상세 | ISR (60초) | 개별 뉴스 콘텐츠 |
| `/careers` | 채용 | ISR (60초) | 채용 공고 목록 |
| `/contact` | 문의 | SSG | Google Maps 연동, 문의 폼 |
| `/[locale]/...` | 다국어 | — | 모든 공개 페이지 한/영 지원 |
| `/admin` | CMS 대시보드 | CSR | 관리자 전용 (인증 필요) |
| `/admin/posts` | 게시글 관리 | CSR | 뉴스/블로그 CRUD |
| `/admin/portfolio` | 포트폴리오 관리 | CSR | 사례 CRUD + 이미지 업로드 |
| `/admin/careers` | 채용 관리 | CSR | 공고 CRUD |
| `/admin/inquiries` | 문의 관리 | CSR | 문의 목록 + 읽음 처리 |

---

## 2. 페이지 구성 및 기능 요구사항

### 2.1 홈 (/)

**Hero 슬라이더**

- 3~5개 슬라이드 자동 전환 (5초 간격)
- 각 슬라이드: 배경 이미지 + 타이틀 + 서브 타이틀 + CTA 버튼
- 수동 네비게이션 (좌/우 화살표 + 도트 인디케이터)
- 모바일에서 스와이프 제스처 지원

**서비스 하이라이트**

- 핵심 서비스 3~4개 카드 (아이콘 + 제목 + 설명 1~2줄)
- 서비스 상세 페이지로 연결

**고객사 로고 섹션**

- 로고 이미지 6~8개 가로 스크롤 (자동 흐르기 애니메이션)
- 그레이스케일 → 호버 시 컬러 전환

**실적 수치 섹션**

- 4개 카운터 카드: 완료 프로젝트 수, 고객사 수, 팀 인원, 업력 연수
- 스크롤 트리거로 숫자 카운트업 애니메이션

**CTA 배너**

- "프로젝트 상담 받기" + 문의 페이지 링크

### 2.2 회사 소개 (/about)

- 비전/미션 텍스트 섹션
- 회사 연혁 타임라인: 연도별 주요 이벤트 (수직 타임라인 UI)
- 팀 소개: 멤버 카드 그리드 (사진 + 이름 + 직함 + 한 줄 소개)
- 오피스 사진 갤러리 (선택)

### 2.3 서비스 (/services)

- 서비스 카드 목록: 아이콘 + 제목 + 요약 + "자세히 보기"
- 서비스 상세 섹션: 제목, 상세 설명, 관련 기술 스택, 진행 프로세스 단계(4~6단계)
- 서비스 간 내비게이션 (이전/다음)

### 2.4 포트폴리오 (/portfolio)

- 프로젝트 사례 카드 그리드: 3컬럼 (lg) / 2컬럼 (md) / 1컬럼 (sm)
- 카테고리 필터: 전체 / 웹 / 모바일 / 컨설팅
- 각 카드: 썸네일 + 카테고리 배지 + 제목 + 클라이언트명
- featured 항목 상단 고정
- 클릭 시 모달 또는 상세 뷰: 설명 + 기술 스택 + 이미지 갤러리

### 2.5 뉴스/블로그 (/news, /news/[slug])

- 목록: 썸네일 + 카테고리(뉴스/블로그) + 날짜 + 제목 + 발췌
- 페이지네이션: 12개 단위
- 상세: 본문(Rich Text) + 썸네일 + 작성일 + 카테고리
- 관련 뉴스 추천 (같은 카테고리 최신 3개)

### 2.6 채용 (/careers)

- 채용 공고 목록: 직무명 + 부서 + 근무지 + 고용 형태
- 활성(is_active=true) 공고만 노출
- 공고 클릭 시 아코디언 또는 모달: 상세 설명 + 자격 요건
- "지원하기" 버튼 → 이메일 또는 외부 링크

### 2.7 문의 (/contact)

- Google Maps 임베드 (회사 위치 표시)
- 문의 폼: 이름, 이메일, 전화번호(선택), 회사명(선택), 문의 내용
- Supabase `inquiries` 테이블에 저장 + Resend로 관리자 이메일 발송
- 폼 검증: 필수 필드 + 이메일 형식
- 성공/실패 피드백 UI
- 회사 연락처 정보: 주소, 전화번호, 이메일 (사이드바 또는 상단)

### 2.8 공통 컴포넌트

**Header**

- 로고 + 메인 네비게이션 (홈, 회사소개, 서비스, 포트폴리오, 뉴스, 채용, 문의)
- 모바일: 햄버거 메뉴
- 언어 전환 버튼 (🇰🇷 / 🇺🇸)
- 스크롤 시 배경 블러 + 그림자

**Footer**

- 회사 로고 + 간략 소개
- 사이트맵 링크 그룹
- 연락처 정보 (주소, 전화, 이메일)
- 소셜 미디어 링크
- 카피라이트

---

## 3. 어드민 CMS 요구사항

### 3.1 인증

- Supabase Auth 이메일/비밀번호 로그인
- 관리자 계정 1개 (seed 데이터로 생성)
- 미인증 시 `/admin/login`으로 리다이렉트
- Next.js Middleware에서 인증 상태 검증

### 3.2 대시보드 (/admin)

- 통계 카드: 총 게시글 수, 총 포트폴리오 수, 미읽은 문의 수, 활성 채용 공고 수
- 최근 문의 5건 리스트
- 최근 게시글 5건 리스트

### 3.3 게시글 관리 (/admin/posts)

- 목록: 제목, 카테고리, 발행 상태, 작성일 — 테이블 UI
- 생성: 제목, 슬러그(자동 생성), 카테고리 선택, 본문(Rich Text 또는 Textarea), 썸네일 업로드, 발행/임시저장 토글
- 수정: 기존 데이터 로드 → 편집 → 저장
- 삭제: 확인 다이얼로그 후 삭제
- 한국어/영어 필드 동시 입력 (title, title_en, content, content_en)

### 3.4 포트폴리오 관리 (/admin/portfolio)

- 목록: 제목, 카테고리, featured 여부, 노출 순서
- 생성/수정: 제목, 설명, 클라이언트명, 기술 스택(태그 입력), 카테고리, 썸네일 + 갤러리 이미지 업로드 (Supabase Storage), featured 토글, 노출 순서
- 이미지 업로드: Supabase Storage 버킷에 저장, URL 반환

### 3.5 채용 관리 (/admin/careers)

- 목록: 직무명, 부서, 활성 여부
- 생성/수정: 직무명, 부서, 근무지, 고용 형태, 상세 설명, 자격 요건(배열), 활성/비활성 토글

### 3.6 문의 관리 (/admin/inquiries)

- 목록: 이름, 이메일, 회사명, 날짜, 읽음 상태 — 테이블 UI
- 상세: 문의 전문 보기 + 읽음 처리 버튼
- 미읽은 문의 수 배지 (사이드바)

---

## 4. 비기능 요구사항 (NFR)

| 항목 | 목표 | 측정/검증 방법 |
|---|---|---|
| **Lighthouse 성능** | 90점 이상 (공개 페이지) | Chrome DevTools Lighthouse |
| **LCP** | 2.5초 미만 | Core Web Vitals |
| **CLS** | 0.1 미만 | Hero 슬라이더 크기 고정으로 방지 |
| **반응형** | 360px ~ 1920px 대응 | Chrome DevTools 디바이스 모드 |
| **SEO** | Lighthouse SEO 95+ | Metadata API + SSG/ISR |
| **접근성** | Lighthouse 접근성 90+ | 시맨틱 HTML, alt 텍스트, 키보드 네비게이션 |
| **다국어** | 한/영 완전 전환 | URL prefix 기반 (/ko, /en) |
| **어드민 응답** | CMS CRUD 3초 이내 | 네트워크 탭에서 API 응답 시간 측정 |
| **이미지 업로드** | 최대 5MB, 자동 리사이즈 | Supabase Storage + 클라이언트 검증 |

---

## 5. 기술 스택 선정

| 영역 | 기술 | 선정 사유 |
|---|---|---|
| **프레임워크** | Next.js 14+ (App Router) | SSG + ISR 하이브리드. P1과 동일 스택 |
| **언어** | TypeScript | 전 프로젝트 공통 |
| **스타일링** | Tailwind CSS | 전 프로젝트 공통 |
| **UI 컴포넌트** | shadcn/ui + Lucide React | 어드민 UI에서 Table, Dialog, Form 등 활용 |
| **DB / 백엔드** | Supabase (PostgreSQL) | RLS로 접근 제어, Storage로 이미지 관리, Auth로 관리자 인증 |
| **이미지 저장** | Supabase Storage | 무료 1GB. 포트폴리오/뉴스 이미지 |
| **다국어** | next-intl 또는 직접 구현 | URL prefix 기반 (/ko, /en) |
| **지도** | Google Maps Embed API | 무료 임베드. API 키 불필요 |
| **이메일 발송** | Resend | 문의 접수 알림 |
| **배포** | Vercel | 전 프로젝트 공통 |

### 5.1 P1과 달라진 점

| 항목 | P1 | P2 |
|---|---|---|
| 콘텐츠 관리 | MDX (로컬 파일) | Supabase (DB + Storage) |
| 렌더링 전략 | SSG 100% | SSG + ISR 하이브리드 |
| 인증 | 없음 | Supabase Auth (어드민) |
| DB | 없음 | Supabase PostgreSQL |
| 다국어 | 없음 | 한/영 지원 |

---

## 6. 인프라 구성 및 배포

### 6.1 인프라 구성도

| 구성 요소 | 설명 |
|---|---|
| **소스 코드 저장소** | GitHub (Public Repository) |
| **빌드 & 배포** | Vercel (GitHub 연동 → Push 시 자동 빌드/배포) |
| **CDN** | Vercel Edge Network |
| **SSL 인증서** | Vercel 자동 발급 |
| **DB** | Supabase PostgreSQL (ap-northeast-1) |
| **파일 저장** | Supabase Storage (post-images, portfolio-images 버킷) |
| **인증** | Supabase Auth (이메일/비밀번호) |
| **이메일 발송** | Resend API |
| **지도** | Google Maps Embed |
| **도메인** | techvision-demo.vercel.app (무료) |

### 6.2 배포 파이프라인

1. GitHub main 브랜치에 Push
2. Vercel 자동 감지 → `next build` 실행
3. SSG 페이지 정적 생성 + ISR 페이지 초기 생성
4. Vercel Edge Network에 배포
5. ISR 페이지는 요청 시 60초 주기로 재생성

### 6.3 환경변수

| 변수명 | 용도 | 설정 위치 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Vercel + .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | Vercel + .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서버 전용 키 (절대 노출 금지) | Vercel |
| `RESEND_API_KEY` | 문의 알림 이메일 발송 | Vercel |
| `CONTACT_EMAIL` | 문의 수신 이메일 | Vercel |
| `NEXT_PUBLIC_SITE_URL` | OG 이미지, sitemap URL | Vercel |

### 6.4 비용

| 항목 | 요금제 | 월 비용 | 비고 |
|---|---|---|---|
| Vercel 호스팅 | Hobby (Free) | $0 | |
| Supabase | Free | $0 | 500MB DB, 1GB Storage, 5만 MAU |
| Resend 이메일 | Free | $0 | 100통/일 |
| Google Maps Embed | Free | $0 | 임베드는 API 키 불필요 |
| **총합** | | **$0/월** | |

---

## 7. 폴더 구조 및 파일 컨벤션

| 경로 | 역할 |
|---|---|
| `src/app/[locale]/(public)/` | 공개 페이지 (다국어 prefix) |
| `src/app/[locale]/(public)/page.tsx` | 홈 |
| `src/app/[locale]/(public)/about/page.tsx` | 회사 소개 |
| `src/app/[locale]/(public)/services/page.tsx` | 서비스 |
| `src/app/[locale]/(public)/portfolio/page.tsx` | 포트폴리오 |
| `src/app/[locale]/(public)/news/page.tsx` | 뉴스 목록 |
| `src/app/[locale]/(public)/news/[slug]/page.tsx` | 뉴스 상세 |
| `src/app/[locale]/(public)/careers/page.tsx` | 채용 |
| `src/app/[locale]/(public)/contact/page.tsx` | 문의 |
| `src/app/(admin)/admin/` | 어드민 CMS (다국어 불필요) |
| `src/app/(admin)/admin/layout.tsx` | 어드민 레이아웃 (사이드바 + 인증 가드) |
| `src/app/(admin)/admin/posts/` | 게시글 CRUD |
| `src/app/(admin)/admin/portfolio/` | 포트폴리오 CRUD |
| `src/app/(admin)/admin/careers/` | 채용 CRUD |
| `src/app/(admin)/admin/inquiries/` | 문의 관리 |
| `src/app/api/` | API Route Handlers (문의 이메일 등) |
| `src/components/public/` | 공개 페이지 컴포넌트 |
| `src/components/admin/` | 어드민 전용 컴포넌트 |
| `src/components/ui/` | shadcn/ui 컴포넌트 |
| `src/lib/supabase/` | client.ts, server.ts, middleware.ts |
| `src/lib/i18n/` | 다국어 유틸리티 |
| `src/dictionaries/` | ko.json, en.json (번역 파일) |
| `src/types/` | database.ts (Supabase 자동 생성), 공통 타입 |
| `public/images/` | 정적 이미지 (로고, 아이콘, 더미 사진) |

---

## 8. Supabase 스키마 설계

### 8.1 테이블 목록

| 테이블 | 역할 | RLS |
|---|---|---|
| `posts` | 뉴스/블로그 게시글 | 공개 읽기(published만) + 관리자 전체 |
| `portfolio_items` | 포트폴리오 사례 | 공개 읽기 + 관리자 전체 |
| `job_postings` | 채용 공고 | 공개 읽기(active만) + 관리자 전체 |
| `inquiries` | 문의 접수 | 공개 쓰기(INSERT만) + 관리자 읽기 |

### 8.2 posts 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `title` | TEXT | NOT NULL | 한국어 제목 |
| `title_en` | TEXT | | 영어 제목 |
| `slug` | TEXT | UNIQUE, NOT NULL | URL 슬러그 |
| `content` | TEXT | NOT NULL | 한국어 본문 |
| `content_en` | TEXT | | 영어 본문 |
| `excerpt` | TEXT | | 발췌 (목록용) |
| `thumbnail_url` | TEXT | | 썸네일 이미지 URL |
| `category` | TEXT | DEFAULT 'news' | 'news' 또는 'blog' |
| `is_published` | BOOLEAN | DEFAULT false | 발행 여부 |
| `published_at` | TIMESTAMPTZ | | 발행일 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

### 8.3 portfolio_items 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `title` | TEXT | NOT NULL | 프로젝트 제목 |
| `description` | TEXT | | 설명 |
| `client_name` | TEXT | | 클라이언트명 |
| `tech_stack` | TEXT[] | | 기술 스택 배열 |
| `thumbnail_url` | TEXT | | 대표 이미지 URL |
| `images` | TEXT[] | | 갤러리 이미지 URL 배열 |
| `category` | TEXT | | 'web' / 'mobile' / 'consulting' |
| `is_featured` | BOOLEAN | DEFAULT false | 상단 고정 여부 |
| `display_order` | INT | DEFAULT 0 | 노출 순서 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 8.4 job_postings 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `title` | TEXT | NOT NULL | 직무명 |
| `department` | TEXT | | 부서 |
| `location` | TEXT | DEFAULT '서울' | 근무지 |
| `employment_type` | TEXT | DEFAULT 'full-time' | 고용 형태 |
| `description` | TEXT | NOT NULL | 상세 설명 |
| `requirements` | TEXT[] | | 자격 요건 배열 |
| `is_active` | BOOLEAN | DEFAULT true | 활성 여부 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 8.5 inquiries 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `name` | TEXT | NOT NULL | 문의자 이름 |
| `email` | TEXT | NOT NULL | 이메일 |
| `phone` | TEXT | | 전화번호 |
| `company` | TEXT | | 회사명 |
| `message` | TEXT | NOT NULL | 문의 내용 |
| `is_read` | BOOLEAN | DEFAULT false | 읽음 여부 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 8.6 RLS 정책 요약

| 테이블 | 정책 | 조건 |
|---|---|---|
| `posts` | 공개 SELECT | `is_published = true` |
| `posts` | 관리자 ALL | `auth.jwt() ->> 'role' = 'admin'` |
| `portfolio_items` | 공개 SELECT | 무조건 허용 |
| `portfolio_items` | 관리자 ALL | `auth.jwt() ->> 'role' = 'admin'` |
| `job_postings` | 공개 SELECT | `is_active = true` |
| `inquiries` | 공개 INSERT | 무조건 허용 |
| `inquiries` | 관리자 SELECT/UPDATE | `auth.jwt() ->> 'role' = 'admin'` |

### 8.7 Storage 버킷

| 버킷명 | 공개 | 용도 |
|---|---|---|
| `post-images` | public | 뉴스/블로그 썸네일 |
| `portfolio-images` | public | 포트폴리오 대표 + 갤러리 이미지 |

---

## 9. 다국어(i18n) 전략

### 9.1 URL 구조

- 한국어: `/ko/about`, `/ko/news/[slug]`
- 영어: `/en/about`, `/en/news/[slug]`
- 기본 locale: `ko` (리다이렉트)

### 9.2 정적 콘텐츠 번역

- `src/dictionaries/ko.json`, `src/dictionaries/en.json`에 UI 텍스트 관리
- `app/[locale]/layout.tsx`에서 locale을 받아 사전 로드

### 9.3 DB 콘텐츠 번역

- posts: `title` / `title_en`, `content` / `content_en`
- 현재 locale에 따라 해당 필드를 조회
- 영어 필드가 비어있으면 한국어 fallback

---

## 10. SEO 및 성능 최적화 체크리스트

### 10.1 SEO

- Next.js Metadata API로 페이지별 title, description, og:image
- SSG 페이지: 빌드 시 정적 HTML 생성
- ISR 페이지: revalidate=60으로 준실시간 업데이트 + SEO 유지
- sitemap.xml: 정적 + 동적(posts, portfolio) 경로 모두 포함
- robots.txt: /admin 경로 차단
- hreflang 태그: 한/영 페이지 상호 참조
- JSON-LD: Organization 스키마

### 10.2 성능

- next/image: 모든 이미지 최적화
- next/font: 폰트 로딩 최적화
- Hero 슬라이더: 첫 슬라이드 priority 로딩, 나머지 lazy
- ISR: DB 데이터 변경 시에도 캐시된 HTML 제공 → 빠른 응답
- 어드민은 성능 최적화 대상에서 제외 (CSR)

### 10.3 접근성

- 시맨틱 HTML (P1과 동일)
- 슬라이더: aria-label, 키보드 네비게이션 지원
- 폼: 레이블 연결, 에러 메시지 접근성

---

## 11. 개발 일정 (2주)

### Week 1: 공개 페이지 + Supabase 셋업

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 1** | 프로젝트 초기화, Supabase 프로젝트 생성, 스키마 SQL 실행, Vercel 최초 배포 | DB 테이블 생성 확인 + vercel.app 접근 |
| **Day 2** | 공통 레이아웃 (Header, Footer, 다국어 구조), 홈 페이지 (Hero 슬라이더, 하이라이트) | Hero 슬라이더 작동 + 반응형 |
| **Day 3** | 회사 소개 + 서비스 페이지 | 타임라인 UI + 서비스 카드 |
| **Day 4** | 포트폴리오 페이지 (Supabase 조회, 필터링) + 뉴스 목록 | DB 데이터 기반 렌더링 확인 |
| **Day 5** | 뉴스 상세 + 채용 + 문의 페이지 (폼 + 이메일) | 문의 전송 → DB 저장 + 이메일 |

### Week 2: 어드민 CMS + 다국어 + 폴리싱

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 6** | 어드민 인증 (로그인/로그아웃) + 대시보드 | 관리자 로그인 → 대시보드 통계 |
| **Day 7** | 게시글 CRUD + 이미지 업로드 (Supabase Storage) | 생성→목록→수정→삭제 사이클 |
| **Day 8** | 포트폴리오 CRUD + 채용 CRUD + 문의 관리 | 어드민에서 모든 CRUD 완료 |
| **Day 9~10** | 다국어 구현 (dictionaries + DB 필드 전환) | /ko, /en 전환 정상 작동 |
| **Day 11~12** | 반응형 QA, 더미 데이터 시딩, 스크린샷 촬영 | 모든 페이지 더미 데이터 채움 |
| **Day 13~14** | SEO 최적화 (메타데이터, sitemap, robots), Lighthouse 점검 | Lighthouse 90+ |

---

## 12. 완료 기준 (Definition of Done)

### 필수 완료 조건

1. Vercel에 배포되어 공개 URL에서 접근 가능
2. GitHub Public Repository에 소스 코드 공개 + README
3. 공개 페이지 7개 모두 정상 렌더링 (홈, 소개, 서비스, 포트폴리오, 뉴스, 채용, 문의)
4. 어드민 CMS: 게시글/포트폴리오/채용/문의 CRUD 정상 작동
5. 다국어(한/영) 전환 정상 작동
6. Lighthouse Performance / SEO 모두 90점 이상 (공개 페이지)
7. 모바일(360px) ~ 데스크톱(1920px) 반응형 정상 작동
8. 문의 폼 → DB 저장 + 이메일 발송 확인

### 권장 완료 조건

- 더미 데이터 시딩 (뉴스 5개, 포트폴리오 4개, 채용 3개)
- OG 이미지 페이지별 설정
- P1 포트폴리오 사이트에 케이스 스터디 작성
- 디바이스 목업 스크린샷 (데스크톱 + 모바일 각 3~5장)
- 30~60초 데모 영상 (공개 페이지 + 어드민 CMS 시연)
