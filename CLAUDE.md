# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

위시켓 (Wishket) 플랫폼 타겟 한국 프리랜서 개발자의 포트폴리오 데모 프로젝트 모음. 각 프로젝트(`p1`~`p6`)는 독립된 Next.js 16 앱이며, 요구사항 명세서는 `requirements/`에 정리되어 있다.

## Repository Layout

```
portfolio-demos/
├── CLAUDE.md               ← this file (repo-level guidance)
├── requirements/
│   ├── p1-requirements.md  ← P1 개인 포트폴리오
│   ├── p2-requirements.md  ← P2 기업 홈페이지 (TechVision Solutions)
│   ├── p3-requirements.md  ← P3 커뮤니티 게시판 (DevTalk)
│   ├── p4-requirements.md  ← P4 SaaS 웹앱 (TaskFlow)
│   └── p5-requirements.md  ← P5 AI 통합 콘텐츠 도구 (ContentAI)
├── p1-portfolio/           ← ✅ built — personal portfolio site
├── p2-techvision/          ← ✅ built — corporate homepage with admin CMS
├── p6-sheets-dashboard/    ← ✅ built — Google Sheets inventory dashboard
├── p7-n8n-automation/      ← ✅ built — n8n customer inquiry automation
└── p10-scholarsync/        ← ✅ built — scholarship search & AI essay generator
```

---

## Shared Stack

All projects share a common base:

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui v4 + Lucide React |
| Package manager | pnpm |
| Deployment | Vercel |

---

## P1 — Personal Portfolio (`p1-portfolio/`)

Requirements: `requirements/p1-requirements.md`

| Concern | Choice |
|---|---|
| Content | Local MDX files (no CMS/DB) |
| Animation | Framer Motion (dynamic import) |
| Email | Resend API via Server Actions |
| Rendering | SSG (static generation) |

### Structure

```
p1-portfolio/src/
├── app/                      ← App Router pages
│   ├── layout.tsx            ← Root layout: Header, Footer, fonts, theme provider
│   ├── page.tsx              ← Home
│   ├── about/                ← About page
│   ├── projects/             ← Projects list + [slug] detail
│   ├── blog/                 ← Blog list + [slug] detail
│   └── contact/              ← Contact form (Server Actions)
├── components/
│   ├── layout/               ← Header, Footer, MobileNav
│   ├── home/                 ← Hero, Highlights, FeaturedProjects, CTABanner
│   ├── projects/             ← ProjectCard
│   ├── blog/                 ← TableOfContents
│   └── ui/                   ← shadcn/ui components
├── content/
│   ├── projects/             ← *.mdx (frontmatter: title, description, tech, liveUrl, githubUrl, thumbnail, category, duration, date, featured)
│   └── blog/                 ← *.mdx (frontmatter: title, description, date, tags)
├── lib/                      ← utils.ts, content.ts (MDX loader), constants.ts
└── types/                    ← content.ts (TypeScript type definitions)
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Contact form email sending |
| `CONTACT_EMAIL` | Email recipient address |
| `NEXT_PUBLIC_SITE_URL` | OG images, sitemap base URL |

### Commands

```bash
cd p1-portfolio
pnpm dev          # start dev server
pnpm build        # production build (SSG)
pnpm lint         # ESLint
```

### Performance Targets

Lighthouse 90+ 전 항목. `generateStaticParams`로 전체 정적 생성. Framer Motion은 dynamic import로 First Load JS < 100KB 유지. `next/image`, `next/font` 필수.

### Content Management

`src/content/projects/` 또는 `src/content/blog/`에 `.mdx` 파일 추가 → `git push` → Vercel 자동 빌드/배포.

---

## P2 — TechVision Solutions (`p2-techvision/`)

Requirements: `requirements/p2-requirements.md`

| Concern | Choice |
|---|---|
| Database | Supabase (SSR + supabase-js) |
| i18n | `[locale]` dynamic segment |
| Admin | `/admin` route group with CMS |
| Email | Resend API via Route Handler |

### Structure

```
p2-techvision/src/
├── app/
│   ├── layout.tsx            ← Root layout
│   ├── page.tsx              ← Root redirect
│   ├── api/contact/          ← Contact form Route Handler
│   ├── [locale]/(public)/    ← Public pages (home, about, services, portfolio, news, careers, contact)
│   └── (admin)/admin/        ← Admin CMS (login, posts, portfolio, careers, inquiries)
├── components/
│   ├── public/               ← Header, Footer, home/*, contact/ContactForm, portfolio/PortfolioGrid
│   ├── admin/                ← AdminSidebar, PostForm, PortfolioForm, CareerForm, TagInput, *Actions
│   └── ui/                   ← shadcn/ui components
├── lib/                      ← Supabase client, utils
└── types/                    ← database.ts (Supabase types)
```

### Key Features

- 다국어 지원 (`[locale]` 라우팅)
- 어드민 CMS: 뉴스/포트폴리오/채용 CRUD, 문의 관리
- Supabase 기반 데이터 관리

---

## P3~P5 (미구현)

- **P3 DevTalk** — 커뮤니티 게시판 (실시간 기능, Supabase)
- **P4 TaskFlow** — SaaS 웹앱 (멀티테넌트, Toss Payments 결제)
- **P5 ContentAI** — AI 통합 콘텐츠 도구 (크레딧 시스템)

---

## P6 — Google Sheets Inventory Dashboard (`p6-sheets-dashboard/`)

Requirements: `requirements/p6-requirements.md`

| Concern | Choice |
|---|---|
| Data store | Google Sheets API v4 (no database) |
| Auth | Service Account + base64-encoded private key |
| Mutations | Server Actions + `revalidatePath` |
| UI state | `useOptimistic` (ADD), `useTransition` (EDIT/DELETE) |
| Notifications | Sonner toasts |

### Structure

```
p6-sheets-dashboard/src/
├── app/
│   ├── layout.tsx                        ← Root layout: Geist font, Toaster
│   ├── page.tsx                          ← Redirect to /dashboard
│   └── (dashboard)/
│       ├── layout.tsx                    ← Dashboard layout (sidebar + header)
│       ├── actions.ts                    ← refreshDashboardLayout server action
│       └── dashboard/
│           ├── page.tsx                  ← Overview page (stats + recent activity)
│           ├── loading.tsx               ← Overview skeleton
│           ├── error.tsx                 ← Error boundary
│           ├── actions.ts                ← getDashboardStats, getRecentChanges
│           ├── inventory/
│           │   ├── page.tsx              ← Inventory page (Server Component)
│           │   ├── InventoryPageClient.tsx ← Client wrapper with useOptimistic
│           │   ├── loading.tsx           ← Skeleton
│           │   ├── error.tsx             ← Error boundary
│           │   └── actions.ts            ← fetchInventory, createItem, editItem, removeItem
│           ├── categories/
│           │   ├── page.tsx              ← Categories page (Server Component)
│           │   ├── loading.tsx           ← Skeleton
│           │   ├── error.tsx             ← Error boundary
│           │   └── actions.ts            ← fetchCategories, createCategory, editCategory, removeCategory
│           └── settings/
│               └── page.tsx              ← Settings page (spreadsheet info)
├── components/
│   ├── layout/                           ← DashboardSidebar, DashboardHeader, ThemeToggle
│   ├── inventory/                        ← InventoryTable, InventoryFilters, InventoryActions, InventoryForm, LowStockAlert
│   ├── categories/                       ← CategoryList
│   └── ui/                              ← shadcn/ui components
├── lib/
│   ├── constants.ts                      ← Sheet names, column mappings, PAGE_SIZE=20, SKU_PREFIX
│   ├── utils.ts                          ← cn() utility
│   └── google/
│       ├── sheets.ts                     ← getSheets(), withRetry() (exponential backoff on 429)
│       ├── inventory.ts                  ← getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, getCategories, addCategory, updateCategory, deleteCategory
│       └── helpers.ts                    ← rowToInventoryItem, inventoryItemToRow, rowToCategory, categoryToRow, generateNextSku
└── types/
    └── inventory.ts                      ← InventoryItem, Category, InventoryFilters, ActionResult<T>
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `GOOGLE_SPREADSHEET_ID` | Target Google Sheets spreadsheet ID |
| `GOOGLE_CLIENT_EMAIL` | Service Account email |
| `GOOGLE_PRIVATE_KEY_BASE64` | Service Account private key (base64-encoded) |
| `NEXT_PUBLIC_SITE_URL` | Site URL for metadata |

### Commands

```bash
cd p6-sheets-dashboard
pnpm dev          # start dev server
pnpm build        # production build
pnpm lint         # ESLint
```

### Key Patterns

- **Sheets as DB**: Google Sheets is the sole data store. Every mutation appends/updates/deletes rows and calls `revalidatePath`.
- **SKU-based mutation lookup**: `updateInventoryItem`/`deleteInventoryItem` always fetch fresh rows first to resolve current row position by SKU — never use stale `rowIndex` from client. Same pattern for categories (by name).
- **`force-dynamic`**: Every dashboard page exports `export const dynamic = 'force-dynamic'` to prevent static rendering at build time.
- **Rate limit retry**: All Sheets API calls go through `withRetry(fn, maxRetries=3)` with exponential backoff (1s, 2s, 4s) on HTTP 429.
- **Referential integrity**: `removeCategory` checks for inventory items using the category before deleting; blocks with Korean error message if found.
- **Optimistic updates**: ADD operations use `useOptimistic`; EDIT/DELETE use `useTransition` + `isPending` spinners.

### Performance Targets

First Load JS < 150KB per route. All dashboard pages are `force-dynamic` Server Components.

---

## P7 — n8n Customer Inquiry Automation (`p7-n8n-automation/`)

Requirements: `requirements/p7-requirements.md`

| Concern | Choice |
|---|---|
| Workflow engine | n8n (self-hosted, Docker) |
| AI classification | OpenAI API (n8n built-in node) |
| Notifications | Slack API (n8n built-in node) |
| Data store | Google Sheets API v4 (no database) |
| Email | Resend API (n8n HTTP Request node) |
| n8n hosting | Render (free Docker hosting) |

### Structure

```
p7-n8n-automation/src/
├── app/
│   ├── layout.tsx                  ← Root layout: Geist font, ThemeProvider, Toaster
│   ├── page.tsx                    ← Landing: 프로젝트 소개 + 워크플로우 설명
│   ├── inquiry/
│   │   ├── page.tsx                ← 문의 접수 폼
│   │   ├── actions.ts              ← 문의 제출 Server Action
│   │   └── status/
│   │       └── [ticketId]/
│   │           ├── page.tsx         ← 상태 조회 타임라인
│   │           └── actions.ts       ← 상태 조회 Server Action
│   ├── dashboard/
│   │   ├── page.tsx                ← 문의 현황 (읽기 전용)
│   │   └── actions.ts              ← 대시보드 데이터 Server Action
│   └── api/
│       └── inquiry/
│           └── route.ts            ← n8n 웹훅 프록시 (POST)
├── components/
│   ├── layout/                     ← Header, Footer
│   ├── home/                       ← Hero, WorkflowCards, TechStack
│   ├── inquiry/                    ← InquiryForm, StatusTimeline
│   ├── dashboard/                  ← StatsCards, InquiryTable
│   └── ui/                         ← shadcn/ui components
├── lib/
│   ├── utils.ts                    ← cn() utility
│   ├── constants.ts                ← 상태 맵, 카테고리 목록, 색상
│   ├── n8n/
│   │   └── webhook.ts              ← n8n 웹훅 호출 유틸 (서버 전용)
│   └── google/
│       ├── sheets.ts               ← Service Account 인증 클라이언트
│       └── inquiries.ts            ← 문의 데이터 읽기 함수
└── types/
    └── inquiry.ts                  ← Inquiry, InquiryStatus, ActionResult 타입
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `N8N_WEBHOOK_URL` | n8n 웹훅 베이스 URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account 이메일 |
| `GOOGLE_PRIVATE_KEY_BASE64` | Service Account 프라이빗 키 (base64) |
| `GOOGLE_SPREADSHEET_ID` | 문의 로그 스프레드시트 ID |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL |

### Commands

```bash
cd p7-n8n-automation
pnpm dev          # start dev server
pnpm build        # production build
pnpm lint         # ESLint
```

### Key Patterns

- **n8n URL 미노출**: 클라이언트에서 n8n URL 접근 불가. Server Action → API Route → n8n 웹훅 프록시 구조.
- **Google Sheets as DB**: n8n에서 저장, Next.js에서 읽기. `googleapis` 패키지로 Service Account 인증.
- **Docker 개발환경**: `docker/docker-compose.yml`로 n8n 로컬 실행 (localhost:5678).
- **워크플로우 버전 관리**: `workflows/*.json`에 n8n export 파일 저장. credential은 미포함.

---

## Vercel Deployment

모노레포 내 각 프로젝트는 Vercel Dashboard에서 **Root Directory** 설정으로 독립 배포:

| Vercel Project | Root Directory | GitHub Repo |
|---|---|---|
| p1-portfolio | `p1-portfolio` | `jurogrammer/portfolio-demos` |
| p2-techvision | `p2-techvision` | `jurogrammer/portfolio-demos` |
| p6-sheets-dashboard | `p6-sheets-dashboard` | `jurogrammer/portfolio-demos` |
| p7-n8n-automation | `p7-n8n-automation` | `jurogrammer/portfolio-demos` |
| p10-scholarsync | `p10-scholarsync` | `jurogrammer/portfolio-demos` |

- root `vercel.json` 없음 — 각 프로젝트 내부 설정으로 관리
- `git push` 시 변경된 프로젝트 자동 빌드/배포 (모노레포 특성상 트리거 안 될 수 있음)
- **자동 배포 안 될 경우**: 해당 프로젝트 디렉토리에서 `vercel --prod` 수동 배포
- 배포 확인: `vercel ls 2>&1 | grep <project-name>`

## File Naming Conventions

- Components: PascalCase (`Hero.tsx`, `ProjectCard.tsx`)
- Utilities: camelCase (`utils.ts`, `content.ts`)
- MDX content: kebab-case (`techvision-solutions.mdx`)
- Route files: Next.js convention (`page.tsx`, `layout.tsx`, `route.ts`)
