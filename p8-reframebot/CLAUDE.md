# P8 — ReframeBot (`p8-reframebot/`)

Requirements: `requirements/p8-requirements.md`

| Concern | Choice |
|---|---|
| Database | Supabase PostgreSQL (ap-southeast-1) + Prisma 6 |
| Auth | NextAuth.js v5 (magic link + demo credentials) |
| Rule engine | Custom KEYWORD/PATTERN matcher |
| Notifications | Sonner toasts |
| Forms | React Hook Form + Zod |
| State | Zustand (client state) |
| Deployment | Vercel (sin1 리전, Supabase와 동일) |

## Structure

```
p8-reframebot/
├── prisma/
│   ├── schema.prisma         ← All models with rb_ table prefix
│   └── seed.ts               ← Admin, demo users, cohort, questions, templates, rules
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout (Header + Footer)
│   │   ├── page.tsx                ← Landing / redirect
│   │   ├── globals.css             ← Tailwind v4 imports
│   │   ├── login/
│   │   │   └── page.tsx            ← Magic link + demo login
│   │   ├── (user)/                 ← Authenticated USER-only routes (admin redirected to /admin)
│   │   │   ├── layout.tsx          ← User nav (받은함/히스토리/프로필) + admin guard
│   │   │   ├── inbox/              ← Message inbox
│   │   │   ├── inbox/[messageId]/  ← Message detail + response form
│   │   │   ├── history/            ← Past Q&A history
│   │   │   └── profile/            ← User profile + stats
│   │   ├── (admin)/                ← Admin-only routes (role check in layout)
│   │   │   └── admin/
│   │   │       ├── layout.tsx      ← Admin sidebar layout + role guard
│   │   │       ├── page.tsx        ← Dashboard (stats via Promise.all)
│   │   │       ├── cohorts/        ← Cohort management
│   │   │       ├── questions/      ← Question scheduling
│   │   │       ├── rules/          ← Rule engine config (KEYWORD/PATTERN only)
│   │   │       ├── templates/      ← Reply template CRUD
│   │   │       ├── review/         ← Review queue
│   │   │       └── datasets/       ← Dataset export (CSV/JSONL)
│   │   └── api/
│   │       ├── auth/[...nextauth]/ ← NextAuth handler
│   │       └── cron/
│   │           ├── send-questions/ ← 09:00 KST: send today's questions
│   │           └── expire-questions/ ← 23:50 KST: mark old questions
│   ├── components/
│   │   ├── layout/                 ← Header, Footer, UserNav, AdminSidebar, Providers
│   │   ├── admin/                  ← Admin UI (forms, tables, panels)
│   │   ├── inbox/                  ← Inbox UI (MessageList, ResponseForm)
│   │   ├── history/                ← Timeline components
│   │   ├── landing/                ← Landing page (Hero, TechShowcase)
│   │   └── ui/                     ← shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts               ← Prisma singleton
│   │   ├── utils.ts                ← cn() utility
│   │   ├── constants.ts            ← Categories, status maps, condition type map
│   │   ├── auth.ts                 ← NextAuth v5 config
│   │   └── engine/
│   │       ├── matcher.ts          ← Rule matching (KEYWORD/PATTERN)
│   │       ├── template.ts         ← Template rendering + Korean var substitution
│   │       └── pipeline.ts         ← Full response → reply pipeline
│   └── types/
│       └── index.ts                ← ActionResult<T>, MatchResult, TemplateContext, etc.
└── vercel.json                     ← Cron schedules + regions: ["sin1"]
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL (pooled via PgBouncer) |
| `DIRECT_URL` | Supabase PostgreSQL (direct connection for migrations) |
| `NEXTAUTH_URL` | Auth callback base URL |
| `NEXTAUTH_SECRET` | NextAuth signing secret |
| `CRON_SECRET` | Bearer token for cron route authorization |
| `DEMO_MODE` | `true` = enable credential login (no email needed) |
| `EMAIL_SERVER_HOST` | SMTP host for magic links |
| `EMAIL_SERVER_PORT` | SMTP port |
| `EMAIL_SERVER_USER` | SMTP username |
| `EMAIL_SERVER_PASSWORD` | SMTP password |
| `EMAIL_FROM` | From address for magic links |

## Commands

```bash
cd p8-reframebot
pnpm install
pnpm dev                # start dev server (localhost:3000)
pnpm build              # prisma generate + next build
pnpm db:push            # push schema to DB (no migration file)
pnpm db:seed            # seed admin, demo users, cohort, questions, templates, rules
pnpm db:migrate         # run prisma migrate dev (creates migration files)
```

**주의**: `pnpm db:push`는 공유 Supabase 인스턴스의 cross-schema 참조(auth.users) 때문에 실패할 수 있음. 인덱스 추가 등은 `prisma db execute --schema prisma/schema.prisma --stdin`으로 SQL 직접 실행 권장.

## Key Patterns

- **rb_ prefix**: ALL Prisma models use `@@map("rb_*")` to avoid conflicts with other projects sharing the same Supabase instance (shared free tier).
- **Demo mode**: `DEMO_MODE=true` enables `CredentialsProvider` so reviewers can sign in as `user1@reframebot.com` etc. without email.
- **Rule engine pipeline**: On response submit → `matchResponse()` finds highest-priority matching rule (KEYWORD/PATTERN) → `renderTemplate()` substitutes Korean variables → `processResponseAndGenerateReply()` creates Reply + Message + Dataset atomically.
- **Cron auth**: Both cron routes verify `Authorization: Bearer <CRON_SECRET>` header. Vercel passes this automatically via vercel.json cron config with `CRON_SECRET` env var.
- **Cron schedule (KST)**: `send-questions` at 09:00 KST = 00:00 UTC. `expire-questions` at 23:50 KST = 14:50 UTC.
- **Session extension**: `session.user.id`, `session.user.role`, `session.user.nickname` are added in the NextAuth session callback.
- **Role-based routing**: Admin이 (user) 라우트 접근 시 `/admin`으로 리다이렉트. UserNav 드롭다운도 role에 따라 다른 메뉴 표시.
- **Header 구조**: Root layout의 Header는 로고 + 관리자 링크(admin만) + UserNav만 표시. 세부 네비는 각 route group layout에서 담당.

## Performance Optimizations (2026-04-09)

### DB Indexes (`schema.prisma`)

| Model | Index | Purpose |
|---|---|---|
| CohortUser | `@@index([cohortId])` | 코호트별 사용자 조회 |
| Message | `@@index([userId, type])` | 유저별 메시지 타입 필터 |
| Message | `@@index([questionId])` | 질문별 메시지 조회 |
| Response | `@@index([userId, questionId])` | 유저+질문 복합 조회 |
| Question | `@@index([scheduledAt, isSent])` | 크론잡 미발송 질문 조회 |

### Query Optimizations

| File | Before | After | Effect |
|---|---|---|---|
| `datasets/actions.ts` | N+1: dataset 조회 후 rule 별도 조회 | `include: { rule }` 단일 쿼리 | 쿼리 50% 감소 |
| `datasets/actions.ts` | cohort+category 필터 순차 4-6 쿼리 | `Promise.all` 병렬화 | 필터 시간 50% 단축 |
| `history/actions.ts` | messages → questionIds → responses 순차 | `Promise.all` 병렬 2 쿼리 | 페이지 로드 50% 단축 |
| `cron/send-questions` | 질문별 `createMany` + `update` 순차 루프 | `flatMap` + 단일 `createMany` + `$transaction` | N×2 → 3 쿼리 |
| `cron/send-questions` | `include: { cohort, user }` | `select: { userId: true }` | 데이터 전송량 90% 감소 |

### Vercel Region

Function 리전을 `iad1` (미국 동부) → `sin1` (싱가포르)로 변경. Supabase DB와 동일 리전으로 쿼리당 RTT ~200ms → ~1-3ms.

## Database Models (all rb_ prefixed)

| Table | Purpose |
|---|---|
| rb_users | Users with role (USER/ADMIN) and nickname |
| rb_accounts | NextAuth OAuth accounts |
| rb_sessions | NextAuth sessions |
| rb_verification_tokens | Magic link tokens |
| rb_cohorts | Learning cohorts (ACTIVE/CLOSED/ARCHIVED) |
| rb_cohort_users | Many-to-many user ↔ cohort membership |
| rb_questions | Daily reflection questions with schedule |
| rb_responses | User answers to questions |
| rb_replies | Auto-generated or edited replies to responses |
| rb_messages | Message inbox items (QUESTION/RESPONSE/REPLY/SYSTEM) |
| rb_reply_templates | Reply templates with Korean variable placeholders |
| rb_rules | Matching rules (KEYWORD/PATTERN) |
| rb_datasets | Training data export (input/output pairs, with optional rule relation) |

## Removed Features

- **SENTIMENT condition type** (2026-04-09): 한국어 사전 기반 감정 분석(NEGATIVE_WORDS/POSITIVE_WORDS 매칭) 제거. 정확도가 낮아 KEYWORD/PATTERN만 유지.
