# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a portfolio demos repository for a Korean freelance developer targeting the 위시켓 (Wishket) platform. It contains two distinct workflows:

1. **Website Builder** — A design-to-code workflow using custom skills (`/capture-essence`, `/build-site`)
2. **P1 Portfolio Site** — A Next.js 14 App Router personal portfolio website (requirements in `requirements/p1-requirements.md`)

---

## Website Builder Workflow

### Skills

**`/capture-essence <url>`** — Captures design essence from a live webpage and saves structured data to `website-builder/essences/<slug>/essence.md` along with screenshots.

**`/build-site <essence-slug> <project-slug> ["requirements"]`** — Reads a saved essence and generates a pure static site (`index.html`, `styles.css`, `script.js`) into `website-builder/projects/<project-slug>/site/`.

### Preview Server

The preview server is configured in `.claude/launch.json`:

```bash
npx serve website-builder/projects -l 3000 --no-clipboard
```

This serves all projects under `website-builder/projects/` at `http://localhost:3000`.

### Directory Layout

```
website-builder/
├── essences/
│   └── <slug>/
│       ├── essence.md        ← structured design data (colors, typography, layout)
│       └── screenshots/      ← captured page screenshots
└── projects/
    └── <project-slug>/
        ├── brief.md          ← client requirements (optional)
        └── site/
            ├── index.html
            ├── styles.css
            ├── script.js
            └── assets/
```

The essence index lives at `website-builder/essences/essence_index.md`.

### Build Output Constraints

Generated sites must be pure static files — no JS frameworks, no build step. External dependencies are limited to Google Fonts CDN. Images use `https://placehold.co/` unless client-provided.

---

## P1 Portfolio Site

Requirements are fully specified in `requirements/p1-requirements.md`. Key decisions:

| Concern | Choice |
|---|---|
| Framework | Next.js 14+ App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + Lucide React |
| Content | Local MDX files (no CMS/DB) |
| Animation | Framer Motion (dynamic import) |
| Email | Resend API via Server Actions |
| Package manager | pnpm |
| Deployment | Vercel (SSG) |

### App Structure (when built)

```
src/
├── app/                      ← App Router pages (URL = path)
│   └── layout.tsx            ← Root layout: Header, Footer, fonts, theme provider
├── components/
│   ├── layout/               ← Header, Footer, MobileNav
│   ├── home/                 ← Hero, Highlights, FeaturedProjects
│   └── ui/                   ← shadcn/ui components
├── content/
│   ├── projects/             ← *.mdx (frontmatter: title, description, tech, liveUrl, githubUrl, thumbnail, category, duration, date, featured)
│   └── blog/                 ← *.mdx (frontmatter: title, description, date, tags)
├── lib/                      ← utils.ts, content.ts (MDX loader), constants.ts
└── types/                    ← TypeScript type definitions
```

### File Naming

- Components: PascalCase (`Hero.tsx`, `ProjectCard.tsx`)
- Utilities: camelCase (`utils.ts`, `content.ts`)
- MDX content: kebab-case (`techvision-solutions.mdx`)

### Environment Variables

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Contact form email sending |
| `CONTACT_EMAIL` | Email recipient address |
| `NEXT_PUBLIC_SITE_URL` | OG images, sitemap base URL |

### Common Commands (when the project exists)

```bash
pnpm dev          # start dev server
pnpm build        # production build (SSG)
pnpm lint         # ESLint
```

### Performance Targets

Lighthouse scores must all reach 90+. All pages are statically generated via `generateStaticParams`. Framer Motion must be dynamically imported to keep First Load JS < 100KB per page. Use `next/image` for all images, `next/font` for all fonts.

### Content Management

Adding content = adding an `.mdx` file to `src/content/projects/` or `src/content/blog/`. No DB or CMS changes needed. A `git push` triggers Vercel to rebuild and deploy automatically.
