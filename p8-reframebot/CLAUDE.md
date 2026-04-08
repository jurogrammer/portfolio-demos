# P8 — ReframeBot (`p8-reframebot/`)

Requirements: `requirements/p8-requirements.md`

| Concern | Choice |
|---|---|
| Database | Supabase PostgreSQL + Prisma 6 |
| Auth | NextAuth.js v5 (magic link + demo credentials) |
| Rule engine | Custom KEYWORD/PATTERN/SENTIMENT matcher |
| Notifications | Sonner toasts |
| Forms | React Hook Form + Zod |
| State | Zustand (client state) |

## Structure

```
p8-reframebot/
├── prisma/
│   ├── schema.prisma         ← All models with rb_ table prefix
│   └── seed.ts               ← Admin, demo users, cohort, questions, templates, rules
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout
│   │   ├── page.tsx                ← Landing / redirect
│   │   ├── globals.css             ← Tailwind v4 imports
│   │   ├── login/
│   │   │   └── page.tsx            ← Magic link + demo login
│   │   ├── (user)/                 ← Authenticated user routes
│   │   │   ├── inbox/              ← Message inbox
│   │   │   ├── message/[id]/       ← Message detail + response form
│   │   │   ├── history/            ← Past Q&A history
│   │   │   └── profile/            ← User profile + stats
│   │   ├── (admin)/                ← Admin routes
│   │   │   └── admin/
│   │   │       ├── layout.tsx      ← Admin sidebar layout
│   │   │       ├── page.tsx        ← Dashboard (stats)
│   │   │       ├── cohorts/        ← Cohort management
│   │   │       ├── questions/      ← Question scheduling
│   │   │       ├── rules/          ← Rule engine config
│   │   │       ├── templates/      ← Reply template CRUD
│   │   │       ├── review/         ← Review queue
│   │   │       └── datasets/       ← Dataset export
│   │   └── api/
│   │       ├── auth/[...nextauth]/ ← NextAuth handler
│   │       └── cron/
│   │           ├── send-questions/ ← 09:00 KST: send today's questions
│   │           └── expire-questions/ ← 23:50 KST: mark old questions
│   ├── components/
│   │   ├── layout/                 ← Header, Footer, AdminSidebar
│   │   └── ui/                     ← shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts               ← Prisma singleton
│   │   ├── utils.ts                ← cn() utility
│   │   ├── constants.ts            ← Categories, status maps, sentiment word lists
│   │   ├── auth.ts                 ← NextAuth v5 config
│   │   └── engine/
│   │       ├── sentiment.ts        ← Korean sentiment analysis
│   │       ├── matcher.ts          ← Rule matching (KEYWORD/PATTERN/SENTIMENT)
│   │       ├── template.ts         ← Template rendering + Korean var substitution
│   │       └── pipeline.ts         ← Full response → reply pipeline
│   └── types/
│       └── index.ts                ← ActionResult<T>, MatchResult, TemplateContext, etc.
└── vercel.json                     ← Cron schedules
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

## Key Patterns

- **rb_ prefix**: ALL Prisma models use `@@map("rb_*")` to avoid conflicts with other projects sharing the same Supabase instance (shared free tier).
- **Demo mode**: `DEMO_MODE=true` enables `CredentialsProvider` so reviewers can sign in as `user1@reframebot.com` etc. without email.
- **Rule engine pipeline**: On response submit → `matchResponse()` finds highest-priority matching rule → `renderTemplate()` substitutes Korean variables → `processResponseAndGenerateReply()` creates Reply + Message + Dataset atomically.
- **Cron auth**: Both cron routes verify `Authorization: Bearer <CRON_SECRET>` header. Vercel passes this automatically via vercel.json cron config with `CRON_SECRET` env var.
- **Cron schedule (KST)**: `send-questions` at 09:00 KST = 00:00 UTC. `expire-questions` at 23:50 KST = 14:50 UTC.
- **Session extension**: `session.user.id`, `session.user.role`, `session.user.nickname` are added in the NextAuth session callback.
- **Sentiment analysis**: Pure dictionary matching against Korean NEGATIVE_WORDS / POSITIVE_WORDS lists. Score = (pos - neg) / total. Label thresholds: < -0.2 → NEGATIVE, > 0.2 → POSITIVE.

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
| rb_rules | Matching rules (KEYWORD/PATTERN/SENTIMENT) |
| rb_datasets | Training data export (input/output pairs) |
