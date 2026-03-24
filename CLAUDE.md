# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

위시켓 (Wishket) 플랫폼 타겟 한국 프리랜서 개발자의 포트폴리오 데모 프로젝트 모음. 각 프로젝트(`p1`~`p5`)는 독립된 Next.js 16 앱이며, 요구사항 명세서는 `requirements/`에 정리되어 있다.

## Repository Layout

```
portfolio-demos/
├── CLAUDE.md               ← this file (repo-level guidance)
├── vercel.json             ← Vercel deployment config (builds p1-portfolio)
├── requirements/
│   ├── p1-requirements.md  ← P1 개인 포트폴리오
│   ├── p2-requirements.md  ← P2 기업 홈페이지 (TechVision Solutions)
│   ├── p3-requirements.md  ← P3 커뮤니티 게시판 (DevTalk)
│   ├── p4-requirements.md  ← P4 SaaS 웹앱 (TaskFlow)
│   └── p5-requirements.md  ← P5 AI 통합 콘텐츠 도구 (ContentAI)
├── p1-portfolio/           ← ✅ built — personal portfolio site
└── p2-techvision/          ← ✅ built — corporate homepage with admin CMS
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

## Vercel Deployment

현재 `vercel.json`은 `p1-portfolio`만 빌드/배포하도록 설정:

```json
{
  "framework": "nextjs",
  "buildCommand": "cd p1-portfolio && pnpm install --frozen-lockfile && pnpm build",
  "outputDirectory": "p1-portfolio/.next",
  "installCommand": "npm install -g pnpm"
}
```

## File Naming Conventions

- Components: PascalCase (`Hero.tsx`, `ProjectCard.tsx`)
- Utilities: camelCase (`utils.ts`, `content.ts`)
- MDX content: kebab-case (`techvision-solutions.mdx`)
- Route files: Next.js convention (`page.tsx`, `layout.tsx`, `route.ts`)
