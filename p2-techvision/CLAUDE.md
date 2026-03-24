# P2 — TechVision Solutions 기업 홈페이지

@AGENTS.md

## Overview

IT 솔루션 기업 "TechVision Solutions"의 반응형 기업 홈페이지 + 어드민 CMS.
요구사항: `../requirements/p2-requirements.md`

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router (React 19) |
| Styling | Tailwind CSS v4 + tw-animate-css |
| UI | shadcn/ui v4 + Lucide React |
| Database | Supabase (@supabase/supabase-js + @supabase/ssr) |
| Email | Resend via Route Handler |
| i18n | `[locale]` dynamic segment + dictionary context |
| Rendering | SSR/SSG hybrid |

## Structure

```
src/
├── app/
│   ├── layout.tsx                  ← Root layout
│   ├── page.tsx                    ← Root redirect (→ /[locale])
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── globals.css
│   ├── api/contact/route.ts        ← Contact form API (Resend)
│   ├── [locale]/
│   │   ├── layout.tsx              ← Locale layout (i18n provider)
│   │   └── (public)/
│   │       ├── layout.tsx          ← Public layout (Header, Footer)
│   │       ├── page.tsx            ← Home (HeroSlider, ServicesHighlight, StatsCounter, ClientLogos, CTABanner)
│   │       ├── about/page.tsx
│   │       ├── services/page.tsx
│   │       ├── portfolio/page.tsx   ← PortfolioGrid
│   │       ├── news/
│   │       │   ├── page.tsx
│   │       │   └── [slug]/page.tsx
│   │       ├── careers/page.tsx
│   │       └── contact/page.tsx     ← ContactForm
│   └── (admin)/
│       ├── layout.tsx              ← Admin layout wrapper
│       └── admin/
│           ├── layout.tsx          ← Admin layout (AdminSidebar)
│           ├── page.tsx            ← Dashboard
│           ├── login/page.tsx
│           ├── posts/              ← News CRUD (list, new, [id]/edit)
│           ├── portfolio/          ← Portfolio CRUD (list, new, [id]/edit)
│           ├── careers/            ← Careers CRUD (list, new, [id]/edit)
│           └── inquiries/page.tsx  ← Contact inquiry management
├── components/
│   ├── public/
│   │   ├── Header.tsx, Footer.tsx
│   │   ├── home/                   ← HeroSlider, ServicesHighlight, StatsCounter, ClientLogos, CTABanner
│   │   ├── contact/ContactForm.tsx
│   │   └── portfolio/PortfolioGrid.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── PostForm.tsx, PostActions.tsx
│   │   ├── PortfolioForm.tsx, PortfolioActions.tsx
│   │   ├── CareerForm.tsx, CareerActions.tsx
│   │   ├── InquiriesList.tsx
│   │   └── TagInput.tsx
│   └── ui/                         ← shadcn/ui components
├── lib/
│   ├── utils.ts                    ← cn() utility
│   ├── supabase/
│   │   ├── client.ts              ← Browser Supabase client
│   │   ├── server.ts             ← Server-side Supabase client (cookies)
│   │   └── admin.ts              ← Service role Supabase client
│   └── i18n/
│       ├── index.ts              ← getDictionary(), locale config
│       └── DictionaryContext.tsx  ← React context for translations
├── types/
│   └── database.ts               ← Supabase DB type definitions
└── supabase/
    └── schema.sql                ← Database schema (migration source)
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (admin ops)
RESEND_API_KEY=                   # Resend API key for contact form
CONTACT_EMAIL=                    # Email recipient address
NEXT_PUBLIC_SITE_URL=             # Base URL for SEO
```

`.env.local`은 gitignore 대상.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # ESLint
```

## Supabase

- 스키마: `supabase/schema.sql`
- 클라이언트 3종: `client.ts` (browser), `server.ts` (SSR, cookies), `admin.ts` (service role)
- 타입: `src/types/database.ts`
- 이미지: Supabase Storage 사용 (`*.supabase.co` remotePatterns 설정됨)

## i18n

- `[locale]` dynamic segment로 라우팅
- `lib/i18n/index.ts`에서 `getDictionary()` → locale별 번역 데이터 로드
- `DictionaryContext`로 클라이언트 컴포넌트에 번역 전달

## Admin CMS

- `/admin/login` → 인증 후 접근
- 뉴스(posts), 포트폴리오(portfolio), 채용(careers) CRUD
- 문의(inquiries) 조회/관리
- `AdminSidebar`로 내비게이션

## Key Conventions

- Public 페이지: `(public)` route group, 공용 Header/Footer
- Admin 페이지: `(admin)` route group, AdminSidebar
- File naming: Components=PascalCase, Utils=camelCase
- Supabase 접근은 반드시 적절한 클라이언트 사용 (client/server/admin)

## Deployment

모노레포(`jurogrammer/portfolio-demos`)의 서브디렉토리. Vercel Dashboard에서 Root Directory를 `p2-techvision`으로 설정하여 독립 배포.
