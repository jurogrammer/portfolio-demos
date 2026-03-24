# P1 — Personal Portfolio

@AGENTS.md

## Overview

풀스택 엔지니어 주인재의 개인 포트폴리오 사이트. 위시켓 프리랜서 프로필용.
요구사항: `../requirements/p1-requirements.md`

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router (React 19) |
| Styling | Tailwind CSS v4 + tw-animate-css |
| UI | shadcn/ui v4 + Lucide React |
| Content | MDX (gray-matter + next-mdx-remote + rehype/remark plugins) |
| Animation | Framer Motion (dynamic import 필수) |
| Email | Resend via Server Actions |
| Rendering | SSG (정적 생성) |
| Theme | next-themes (dark/light) |
| Code highlighting | Shiki via rehype-pretty-code |

## Structure

```
src/
├── app/
│   ├── layout.tsx              ← Root layout (Header, Footer, fonts, ThemeProvider)
│   ├── page.tsx                ← Home (Hero, Highlights, FeaturedProjects, CTABanner)
│   ├── about/page.tsx          ← About (career timeline, tech stack)
│   ├── projects/
│   │   ├── page.tsx            ← Project list (with client-side filter: ProjectsClient)
│   │   └── [slug]/page.tsx     ← Project detail (MDX render)
│   ├── blog/
│   │   ├── page.tsx            ← Blog list (with client-side filter: BlogClient)
│   │   └── [slug]/page.tsx     ← Blog detail (MDX render + TableOfContents)
│   ├── contact/
│   │   ├── page.tsx            ← Contact form
│   │   └── actions.ts          ← Server Action (Resend email)
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── opengraph-image.tsx     ← Dynamic OG image (root)
│   └── not-found.tsx
├── components/
│   ├── layout/                 ← Header, Footer, MobileNav
│   ├── home/                   ← Hero, Highlights, FeaturedProjects, CTABanner
│   ├── projects/               ← ProjectCard
│   ├── blog/                   ← TableOfContents
│   ├── ui/                     ← shadcn/ui (button, card, badge, sheet, input, textarea, label, separator, AnimateOnScroll)
│   └── MdxContent.tsx          ← MDX renderer component
├── content/
│   ├── projects/*.mdx          ← Project entries
│   └── blog/*.mdx              ← Blog entries
├── lib/
│   ├── content.ts              ← MDX file loader (getAllProjects, getProjectBySlug, etc.)
│   ├── constants.ts            ← Site metadata, nav links, social links, career timeline, tech stack
│   ├── utils.ts                ← cn() utility
│   └── button-variants.ts     ← Shared button variant definitions
├── types/
│   └── content.ts              ← Project, BlogPost type definitions
└── public/                     ← Static assets, favicon
```

## Environment Variables

```bash
RESEND_API_KEY=           # Resend API key for contact form
CONTACT_EMAIL=            # Email recipient address
NEXT_PUBLIC_SITE_URL=     # Base URL for OG images, sitemap
```

`.env.example` 참고. `.env.local`은 gitignore 대상.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build (SSG)
pnpm lint         # ESLint
```

## MDX Content Format

### Projects (`src/content/projects/*.mdx`)

Frontmatter: `title`, `description`, `tech` (string[]), `liveUrl`, `githubUrl`, `thumbnail`, `category`, `duration`, `date`, `featured` (boolean)

### Blog (`src/content/blog/*.mdx`)

Frontmatter: `title`, `description`, `date`, `tags` (string[])

새 콘텐츠 추가 = `.mdx` 파일 추가 → `git push` → Vercel 자동 빌드.

## Key Conventions

- `next/image`로 모든 이미지, `next/font`로 모든 폰트
- Framer Motion은 반드시 `dynamic(() => import(...), { ssr: false })` 사용
- Lighthouse 전 항목 90+ 목표
- `generateStaticParams`로 전체 정적 생성
- 외부 이미지는 `placehold.co`만 허용 (`next.config.ts` remotePatterns)
- File naming: Components=PascalCase, Utils=camelCase, MDX=kebab-case

## Deployment

Vercel에서 빌드. 루트 `vercel.json`이 `p1-portfolio/`를 빌드 대상으로 지정.
