# P1. 포트폴리오 웹사이트

> 요구사항 명세서 및 인프라 구성 가이드
> 위시켓 웹개발 포트폴리오 프로젝트 시리즈
> 버전 1.0 | 2025년 3월

---

## 목차

1. 프로젝트 개요
2. 페이지 구성 및 기능 요구사항
3. 비기능 요구사항 (NFR)
4. 기술 스택 선정
5. 인프라 구성 및 배포
6. 폴더 구조 및 파일 컨벤션
7. 콘텐츠 관리 전략 (MDX)
8. SEO 및 성능 최적화 체크리스트
9. 개발 일정 (2주)
10. 완료 기준 (Definition of Done)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | 개인 포트폴리오 웹사이트 (위시켓 수주용) |
| **목적** | 위시켓 프로필 연동용 포트폴리오. P2~P5 프로젝트의 케이스 스터디 허브 및 기술 블로그 플랫폼 |
| **기간** | Week 1~2 (14일) |
| **타겟 사용자** | 위시켓 클라이언트 (프로젝트 발주자), 기술 성향 채용 담당자 |
| **핵심 성공 지표** | Lighthouse 성능 점수 90+, 모바일 반응형, SSG 완전 정적 생성 |

### 1.1 배경

위시켓 공식 데이터에 따르면, 유사 포트폴리오를 첨부한 지원자는 미팅 성사율이 60% 더 높다. 이 사이트 자체가 첫 번째 데모 프로젝트이며, 나머지 4개 프로젝트의 케이스 스터디를 전시하는 허브 역할을 한다.

### 1.2 사이트맵

| URL 경로 | 페이지명 | 역할 |
|---|---|---|
| `/` | 홈 (Hero) | 포지셔닝 문구 + CTA + 하이라이트 |
| `/about` | 소개 | 6년 백엔드 경력 스토리 + 기술 스택 |
| `/projects` | 프로젝트 | 케이스 스터디 목록 (P2~P5) |
| `/projects/[slug]` | 프로젝트 상세 | 문제 → 솔루션 → 결과 구조 |
| `/blog` | 블로그 | 기술 의사결정 기록 |
| `/blog/[slug]` | 블로그 상세 | MDX 렌더링 + 코드 하이라이팅 |
| `/contact` | 연락처 | 문의 폼 + 이메일 전송 |

---

## 2. 페이지 구성 및 기능 요구사항

### 2.1 홈 (/)

**Hero 섹션**

- 포지셔닝 문구: 이름 + 역할 + 핵심 가치 제안 (1줄)
- 부제: 경력 요약 (2줄 이내)
- CTA 버튼 2개: 프로젝트 보기 (프라이머리), 문의하기 (세컨더리)
- 스크롤 애니메이션으로 자연스러운 등장 효과

**하이라이트 섹션**

- 핵심 수치 4개 카드: 백엔드 경력(6년), 처리 트랜잭션(일 10만 건), 완료 프로젝트(5+), 기술 스택(12+)
- 스크롤 트리거로 순차적 등장

**피쳐 프로젝트 섹션**

- `featured: true`인 프로젝트 최대 3개 카드 노출
- 각 카드: 썸네일 이미지 + 제목 + 기술 스택 배지 + 카테고리
- 호버 시 이미지 scale-up 애니메이션
- 상세 페이지로 연결

**CTA 배너**

- 프로젝트 의뢰 유도 문구 + 연락처 페이지 링크

### 2.2 소개 (/about)

- 경력 타임라인: 연도별 주요 경력 이벤트 (수직 타임라인 UI)
- 기술 스택 섹션: 백엔드 / 프론트엔드 / 인프라 3개 그룹으로 분류
- 각 기술마다 경력 연수 + 한 줄 설명 (숙련도 바 대신 서술형)
- 개인 사진 또는 아바타 (선택)

### 2.3 프로젝트 (/projects)

- 프로젝트 카드 그리드: 2컬럼 (md 이상) / 1컬럼 (모바일)
- 카테고리 필터: 전체 / 기업 홈페이지 / 커뮤니티 / SaaS / AI
- 각 카드: 썸네일 + 카테고리 + 제목 + 기술 스택 배지 + 기간
- 클릭 시 상세 페이지로 전환

### 2.4 프로젝트 상세 (/projects/[slug])

- 케이스 스터디 포맷: 프로젝트 개요 → 해결한 문제 → 기술적 도전과 해결 → 결과
- 상단: 제목 + 기술 스택 배지 + 라이브 데모 버튼 + GitHub 버튼
- 본문: MDX로 렌더링된 콘텐츠 (Markdown + 컴포넌트)
- 스크린샷 갤러리: 데스크톱 + 모바일 목업 이미지
- 이전/다음 프로젝트 네비게이션

### 2.5 블로그 (/blog, /blog/[slug])

- 목록: 제목 + 날짜 + 읽기 시간 + 태그
- 상세: MDX 렌더링 + 코드 블록 신택스 하이라이팅 + 목차(TOC)
- 태그 필터링 기능
- 이전/다음 글 네비게이션

### 2.6 연락처 (/contact)

- 문의 폼: 이름, 이메일, 회사명(선택), 문의 내용
- Server Action으로 폼 처리 → Resend API로 이메일 발송
- 폼 검증: 필수 필드 체크 + 이메일 형식 검증
- 성공/실패 피드백 UI
- GitHub / LinkedIn / 위시켓 프로필 링크

### 2.7 공통 컴포넌트

**Header**

- 로고 + 네비게이션 (홈, 소개, 프로젝트, 블로그, 연락)
- 모바일: 햄버거 메뉴 (Sheet 컴포넌트)
- 다크/라이트 모드 토글
- 스크롤 시 배경 블러 (backdrop-blur)

**Footer**

- 카피라이트 + 소셜 링크 (GitHub, LinkedIn)
- 위시켓 프로필 바로가기 링크

---

## 3. 비기능 요구사항 (NFR)

| 항목 | 목표 | 측정/검증 방법 |
|---|---|---|
| **Lighthouse 성능** | 90점 이상 (Performance) | Chrome DevTools Lighthouse 탭에서 측정 |
| **LCP** | 2.5초 미만 | Core Web Vitals 측정 기준 |
| **CLS** | 0.1 미만 | next/font, next/image로 layout shift 방지 |
| **반응형** | 360px ~ 1920px 대응 | Chrome DevTools 디바이스 모드로 검증 |
| **SEO** | Lighthouse SEO 95+ | Metadata API로 페이지별 meta 태그 자동 생성 |
| **접근성** | Lighthouse 접근성 90+ | 시맨틱 HTML, alt 텍스트, 키보드 네비게이션 |
| **다크 모드** | OS 설정 연동 + 수동 토글 | prefers-color-scheme + CSS 변수 |
| **빌드 시간** | 30초 미만 | Vercel 빌드 로그 확인 |
| **번들 사이즈** | First Load JS < 100KB | next build 출력의 페이지별 번들 사이즈 확인 |

---

## 4. 기술 스택 선정

| 영역 | 기술 | 선정 사유 |
|---|---|---|
| **프레임워크** | Next.js 14+ (App Router) | SSG로 완전 정적 생성 → 최고 성능. Server Components로 번들 최소화 |
| **언어** | TypeScript | 타입 안전성 확보, IDE 자동완성, 리팩토링 안정성 |
| **스타일링** | Tailwind CSS | 유틸리티 퍼스트로 빠른 UI 구현. P2~P5와 동일 스택 유지 |
| **UI 컴포넌트** | shadcn/ui + Lucide React | Radix UI 기반 접근성 보장. 컴포넌트 코피 방식으로 커스터마이징 자유 |
| **콘텐츠 관리** | MDX (로컬 파일) | DB 불필요. Git으로 버전 관리. 컴포넌트 임베딩 가능 |
| **애니메이션** | Framer Motion | 페이지 전환, 스크롤 트리거, 호버 효과. React 생태계 표준 |
| **이메일 발송** | Resend | 무료 100통/일. Next.js Server Action과 직관적 연동 |
| **배포** | Vercel | Next.js 공식 호스팅. 자동 CDN + Edge + SSL + CI/CD |
| **패키지 매니저** | pnpm | npm 대비 디스크 효율적, 빠른 설치. Vercel 기본 지원 |

### 4.1 선택하지 않은 기술과 사유

| 후보 기술 | 선택 기술 | 제외 사유 |
|---|---|---|
| Supabase / DB | MDX (로컬) | 포트폴리오는 정적 콘텐츠. DB 운영 부담 불필요. P2부터 Supabase 도입 |
| WordPress | Next.js SSG | 포트폴리오 사이트 자체가 Next.js 역량 증명. WP는 목적에 부합하지 않음 |
| Gatsby | Next.js | Next.js가 P2~P5와 동일 스택. 학습 비용 최소화 |
| Contentlayer | gray-matter + next-mdx-remote | Contentlayer 유지보수 중단. 직접 구현이 안정적 |

---

## 5. 인프라 구성 및 배포

### 5.1 인프라 구성도

| 구성 요소 | 설명 |
|---|---|
| **소스 코드 저장소** | GitHub (Public Repository) |
| **빌드 & 배포** | Vercel (GitHub 연동 → Push 시 자동 빌드/배포) |
| **CDN** | Vercel Edge Network (자동 적용, 관리 불필요) |
| **SSL 인증서** | Vercel 자동 발급 (Let's Encrypt) |
| **이메일 발송** | Resend API (문의 폼 → 관리자 이메일 전송) |
| **도메인** | [name].vercel.app (무료) 또는 커스텀 도메인 (선택) |
| **이미지 최적화** | Next.js Image Optimization (Vercel 자체 처리, WebP/AVIF 자동 변환) |
| **분석** | Vercel Analytics (무료) + Google Analytics 4 (선택) |

### 5.2 배포 파이프라인

모든 배포는 Git Push만으로 완결된다. 별도 CI/CD 구성이 필요 없다.

1. GitHub main 브랜치에 Push
2. Vercel이 자동 감지 → `next build` 실행
3. SSG: 모든 페이지 정적 HTML로 빌드 시간에 생성
4. Vercel Edge Network에 배포 (전 세계 CDN)
5. Preview URL 발급 (PR별 별도 미리보기 가능)

### 5.3 환경변수

| 변수명 | 용도 | 설정 위치 |
|---|---|---|
| `RESEND_API_KEY` | 문의 폼 이메일 발송 | Vercel Environment Variables |
| `CONTACT_EMAIL` | 문의 수신 이메일 주소 | Vercel Environment Variables |
| `NEXT_PUBLIC_SITE_URL` | OG 이미지, 사이트맵 URL | Vercel Environment Variables |

### 5.4 비용

| 항목 | 요금제 | 월 비용 | 비고 |
|---|---|---|---|
| Vercel 호스팅 | Hobby (Free) | $0 | 개인 프로젝트 충분 |
| Resend 이메일 | Free | $0 | 100통/일, 3,000통/월 |
| GitHub | Free | $0 | Public repo 무제한 |
| 도메인 (선택) | 연간 | ~₩15,000/년 | .dev 또는 .kr 도메인 |
| **총합** | | **$0/월** | 커스텀 도메인 제외 |

---

## 6. 폴더 구조 및 파일 컨벤션

P2~P5 프로젝트와 동일한 구조를 유지하여 일관성을 확보한다.

| 경로 | 역할 |
|---|---|
| `src/app/` | Next.js App Router 페이지 (라우트 구조 = URL 구조) |
| `src/app/layout.tsx` | 루트 레이아웃: Header, Footer, 폰트, 테마 프로바이더 |
| `src/app/globals.css` | Tailwind 디렉티브 + CSS 변수 (다크/라이트 모드) |
| `src/components/layout/` | Header, Footer, MobileNav 등 레이아웃 컴포넌트 |
| `src/components/home/` | Hero, Highlights, FeaturedProjects 등 홈 섹션 |
| `src/components/ui/` | shadcn/ui 컴포넌트 (Button, Badge, Sheet 등) |
| `src/lib/` | utils.ts, content.ts (MDX 로더), constants.ts |
| `src/content/projects/` | 프로젝트 MDX 파일 (예: techvision.mdx) |
| `src/content/blog/` | 블로그 MDX 파일 (예: why-nextjs.mdx) |
| `src/types/` | TypeScript 타입 정의 (content.ts) |
| `src/hooks/` | 커스텀 훅 (P1에서는 최소한) |
| `public/images/projects/` | 프로젝트 스크린샷, 목업 이미지 |

### 6.1 파일 네이밍 컨벤션

- 컴포넌트: PascalCase (`Hero.tsx`, `ProjectCard.tsx`)
- 유틸리티: camelCase (`utils.ts`, `content.ts`)
- MDX 콘텐츠: kebab-case (`techvision-solutions.mdx`)
- 페이지 파일: `page.tsx` (Next.js 컨벤션)
- 레이아웃: `layout.tsx` (Next.js 컨벤션)

---

## 7. 콘텐츠 관리 전략 (MDX)

### 7.1 프로젝트 MDX Frontmatter 스키마

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `title` | string | Y | 프로젝트 제목 |
| `description` | string | Y | 1~2줄 요약 (카드 + SEO에 사용) |
| `tech` | string[] | Y | 사용 기술 스택 배열 |
| `liveUrl` | string | Y | Vercel 배포 데모 URL |
| `githubUrl` | string | Y | GitHub 레포지토리 URL |
| `thumbnail` | string | Y | 썸네일 이미지 경로 (/images/projects/...) |
| `category` | string | Y | 카테고리 (기업홈페이지/커뮤니티/SaaS/AI) |
| `duration` | string | Y | 개발 기간 (예: 2주) |
| `date` | string | Y | 완성일 (YYYY-MM-DD) |
| `featured` | boolean | Y | 홈 피쳐 섹션 노출 여부 |

### 7.2 블로그 MDX Frontmatter 스키마

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `title` | string | Y | 글 제목 |
| `description` | string | Y | 1줄 요약 (SEO meta description) |
| `date` | string | Y | 작성일 (YYYY-MM-DD) |
| `tags` | string[] | Y | 태그 배열 (필터링용) |
| `readingTime` | string | 자동 | reading-time 라이브러리로 자동 계산 |

### 7.3 콘텐츠 추가 플로우

1. `src/content/projects/` 또는 `src/content/blog/`에 `.mdx` 파일 생성
2. Frontmatter에 스키마에 맞는 메타데이터 작성
3. `public/images/projects/`에 스크린샷 추가 (16:9 비율 권장)
4. `git push` → Vercel 자동 빌드 및 배포

DB 변경이나 별도 CMS 없이 파일 추가만으로 콘텐츠 관리가 완결된다.

---

## 8. SEO 및 성능 최적화 체크리스트

### 8.1 SEO

- Next.js Metadata API로 페이지별 title, description, og:image 자동 생성
- `generateStaticParams`로 모든 동적 경로 사전 생성 (SSG)
- sitemap.xml 자동 생성 (next-sitemap 또는 `app/sitemap.ts`)
- robots.txt 설정
- JSON-LD 구조화 데이터 (Person + WebSite 스키마)
- canonical URL 설정

### 8.2 성능

- `next/image`로 모든 이미지 최적화 (WebP/AVIF 자동 변환, lazy loading)
- `next/font`로 폰트 로딩 최적화 (layout shift 방지)
- Server Components 기본 → 클라이언트 JS 최소화
- 애니메이션 라이브러리(Framer Motion) 동적 import로 번들 사이즈 제어
- 이미지 사이즈 가이드: 썸네일 1200x630px, 프로젝트 스크린샷 최대 1920px 너비

### 8.3 접근성

- 시맨틱 HTML 태그 사용 (header, main, nav, article, section)
- 모든 이미지에 의미 있는 alt 텍스트
- 키보드 네비게이션 지원 (focus visible 스타일)
- 색상 대비비 WCAG AA 이상 (4.5:1)

---

## 9. 개발 일정 (2주)

### Week 1: 기반 구축 + 핵심 페이지

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 1** | 프로젝트 초기화, 폴더 구조, 의존성 설치, Vercel 최초 배포 | vercel.app URL에서 기본 페이지 확인 |
| **Day 2** | 공통 레이아웃 (Header, Footer, 다크모드, 모바일 네비) | 모든 페이지에서 네비게이션 정상 작동 |
| **Day 3** | 홈 페이지 (Hero, 하이라이트, 피쳐 프로젝트, CTA) | Hero 애니메이션 + 반응형 확인 |
| **Day 4** | About 페이지 (타임라인, 기술 스택 섹션) | 경력 타임라인 UI 완성 |
| **Day 5** | MDX 로더 구현, 프로젝트 목록/상세 페이지 | MDX 파일 추가 → 자동 페이지 생성 확인 |

### Week 2: 블로그 + 문의 + 폴리싱

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 6** | 블로그 목록/상세, 코드 하이라이팅, TOC | 블로그 글 렌더링 + 태그 필터링 |
| **Day 7** | 연락처 페이지 (Server Action + Resend 연동) | 문의 전송 → 이메일 수신 확인 |
| **Day 8~9** | SEO (메타데이터, sitemap, robots, JSON-LD) | Google Rich Results Test 통과 |
| **Day 10~12** | 애니메이션 폴리싱, 반응형 QA, 다크모드 QA | 360px~1920px 전 구간 정상 |
| **Day 13~14** | Lighthouse 최적화, 콘텐츠 작성 (블로그 1개 + 더미 프로젝트 1개) | Lighthouse 4개 항목 모두 90+ |

---

## 10. 완료 기준 (Definition of Done)

### 필수 완료 조건

1. Vercel에 배포되어 공개 URL에서 접근 가능
2. GitHub Public Repository에 소스 코드 공개 + README 작성
3. Lighthouse Performance / SEO / Accessibility / Best Practices 모두 90점 이상
4. 모바일(360px) ~ 데스크톱(1920px) 반응형 정상 작동
5. 다크/라이트 모드 전환 정상
6. 문의 폼 전송 → 이메일 수신 확인
7. MDX 파일 추가 시 자동으로 페이지 생성 확인

### 권장 완료 조건

- 블로그 첫 번째 글 발행 (예: Next.js App Router를 선택한 이유)
- 더미 프로젝트 케이스 스터디 1개 작성 (P2 시작 전)
- OG 이미지 설정 (소셜 미디어 공유 시 미리보기)
- Google Search Console 등록
- 30~60초 데모 영상 제작 (위시켓 제안서 첨부용)
