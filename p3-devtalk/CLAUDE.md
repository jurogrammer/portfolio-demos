# P3 — DevTalk 개발자 Q&A 커뮤니티

@AGENTS.md

## Overview

개발자 Q&A 커뮤니티 "DevTalk". 실시간 알림, 대댓글, 추천/비추천, 전체 텍스트 검색, 관리자 패널 포함.
요구사항: `../requirements/p3-requirements.md`

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router (React 19) |
| Styling | Tailwind CSS v4 + tw-animate-css |
| UI | shadcn/ui v4 + Lucide React |
| Database | Supabase (@supabase/supabase-js + @supabase/ssr) |
| Auth | Supabase Auth (카카오 OAuth + 이메일) |
| Realtime | Supabase Realtime (notifications) |
| Search | Supabase Full Text Search (tsvector + GIN) |
| State | Zustand |
| Markdown | @uiw/react-md-editor + react-syntax-highlighter |
| Date | date-fns |

## Structure

```
src/
├── app/
│   ├── layout.tsx                    ← Root layout (ThemeProvider, fonts)
│   ├── globals.css
│   ├── api/                          ← API routes
│   ├── (public)/
│   │   ├── layout.tsx                ← Public layout (Header, Footer)
│   │   ├── page.tsx                  ← Home (최신글 + 인기글 + 카테고리)
│   │   ├── c/[category]/page.tsx     ← 카테고리별 목록
│   │   ├── post/[id]/page.tsx        ← 게시글 상세
│   │   ├── post/[id]/edit/page.tsx   ← 게시글 수정
│   │   ├── search/page.tsx           ← 검색 결과
│   │   └── u/[username]/page.tsx     ← 사용자 프로필
│   ├── (auth)/auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts        ← OAuth callback
│   ├── (protected)/
│   │   ├── write/page.tsx            ← 글쓰기
│   │   ├── settings/page.tsx         ← 설정
│   │   └── notifications/page.tsx    ← 알림
│   └── (admin)/admin/
│       ├── layout.tsx                ← Admin layout (Sidebar)
│       ├── page.tsx                  ← Dashboard
│       ├── users/page.tsx
│       ├── reports/page.tsx
│       └── posts/page.tsx
├── components/
│   ├── layout/    ← Header, Footer, ThemeProvider
│   ├── post/      ← PostCard, PostContent, PostActions, VoteButtons
│   ├── comment/   ← CommentList, CommentItem, CommentForm
│   ├── editor/    ← MarkdownEditor
│   ├── search/    ← SearchBar
│   ├── notification/ ← NotificationBell, NotificationList
│   ├── admin/     ← AdminSidebar, stats, tables
│   ├── home/      ← PopularPosts, CategoryNav
│   ├── profile/   ← ProfileCard, ActivityTabs
│   └── ui/        ← shadcn/ui components
├── hooks/         ← useRealtimeNotifications
├── stores/        ← Zustand (notification.ts, auth.ts)
├── lib/supabase/  ← client.ts, server.ts, admin.ts, middleware.ts
└── types/         ← database.ts
```

## Environment Variables

Same Supabase project as P2 (shared). Variables in `.env.local`.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # ESLint
```

## Key Conventions

- Korean-only UI (no i18n)
- Dark mode default with toggle
- proxy.ts at src/ level for Next.js 16 middleware
- Supabase RLS enforced; use appropriate client (client/server/admin)
- All pages use Server Components by default; 'use client' only when needed
