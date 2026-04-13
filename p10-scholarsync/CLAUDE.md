@AGENTS.md

# P10 — ScholarSync KR (장학금 통합 검색 & AI 자소서)

## Overview

한국 대학생·대학원생을 위한 장학금 통합 검색 및 AI 자기소개서 생성 서비스.
요구사항: `../requirements/p10-requirements.md`

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router (React 19) |
| Styling | Tailwind CSS v4 + tw-animate-css |
| UI | shadcn/ui v4 (base-ui) + Lucide React |
| Database | Supabase (shared instance, `ss_` prefix) |
| AI | AI SDK v6 + OpenAI GPT-4o (자소서 스트리밍) + GPT-4o-mini (프로필 자동입력) |
| Email | Resend API (Post-MVP) |
| Deployment | Vercel (`p10-scholarsync`) |

## Structure

```
src/
├── app/
│   ├── layout.tsx                        ← Root layout (Geist font, Toaster)
│   ├── (main)/
│   │   ├── layout.tsx                    ← Main layout (Header, Footer)
│   │   ├── page.tsx                      ← Landing page (Hero, Features, Stats, CTA)
│   │   ├── auth/
│   │   │   ├── login/page.tsx            ← Email login
│   │   │   ├── signup/page.tsx           ← Email signup (calls /api/auth/signup)
│   │   │   └── callback/route.ts         ← OAuth callback handler
│   │   ├── scholarships/
│   │   │   ├── page.tsx                  ← Scholarship search/list (Server Component)
│   │   │   ├── actions.ts                ← searchScholarships server action
│   │   │   ├── loading.tsx               ← Skeleton grid
│   │   │   └── [id]/page.tsx             ← Scholarship detail + essay CTA
│   │   ├── my/
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx              ← Profile edit (auth-gated)
│   │   │   │   └── actions.ts            ← getProfile, updateProfile
│   │   │   └── essays/
│   │   │       ├── page.tsx              ← My essays list
│   │   │       ├── actions.ts            ← getMyEssays, getEssay, saveEssay, deleteEssay
│   │   │       └── [id]/page.tsx         ← Essay editor
│   │   ├── terms/page.tsx                ← 이용약관
│   │   └── privacy/page.tsx              ← 개인정보처리방침
│   └── api/
│       ├── auth/signup/route.ts          ← Server-side signup (admin API, auto-confirm)
│       ├── essay/generate/route.ts       ← AI essay generation (SSE streaming)
│       └── profile/autofill/route.ts     ← AI 프로필 자동입력 (텍스트+이미지 → 구조화 추출)
├── components/
│   ├── layout/                           ← Header (sticky, mobile Sheet nav), Footer
│   ├── scholarships/
│   │   ├── ScholarshipCard.tsx           ← Card with amount, D-day, badges
│   │   └── ScholarshipFilters.tsx        ← Desktop sidebar / mobile Sheet filters
│   ├── essay/
│   │   ├── EssayGenerator.tsx            ← Streaming AI generation with disclaimer
│   │   └── EssayEditor.tsx               ← Per-section textarea, char count, auto-save
│   ├── profile/
│   │   ├── ProfileForm.tsx               ← Full profile form (학적 + 자소서 맞춤 정보)
│   │   └── AutofillDialog.tsx            ← AI 자동입력 UI (텍스트/이미지 입력 → API 호출 → 폼 채움)
│   └── ui/                               ← shadcn/ui components (base-ui based)
├── lib/
│   ├── utils.ts                          ← cn() utility
│   ├── constants.ts                      ← REGIONS, DEGREE_TYPES, ORG_TYPE_LABELS, AI_DISCLAIMER
│   └── supabase/
│       ├── client.ts                     ← Browser client (createBrowserClient)
│       ├── server.ts                     ← Server client (cookies-based SSR)
│       └── admin.ts                      ← Service role client (admin ops)
├── types/
│   └── database.ts                       ← Scholarship, Profile, Essay, EssayGeneration types
└── supabase/
    ├── schema.sql                        ← DB schema (ss_ prefix, RLS policies)
    └── seed.sql                          ← 20건 장학금 시드 데이터
```

## Supabase

- **공유 인스턴스**: P2, P3, P8과 같은 Supabase 프로젝트 (`fpoqnnqegriwtafaybhw`)
- **테이블 프리픽스**: `ss_`
- **테이블 목록**:
  - `ss_profiles` — 사용자 프로필 (학적 정보 + 자소서 맞춤 정보 7개 카테고리)
  - `ss_scholarships` — 장학금 데이터 (20건 시드)
  - `ss_essays` — 저장된 자소서 (user_id + scholarship_id UNIQUE)
  - `ss_essay_generations` — 생성 횟수 추적 (월 3회 제한)
- **RLS**: 모든 테이블에 Row Level Security 적용
- **Auth**: 이메일 가입 시 admin API로 즉시 확인 (이메일 인증 건너뜀 — MVP)
- **프로필 자동 생성**: signup API route에서 생성 + getProfile에서 없으면 자동 upsert

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

`.env.local`은 gitignore 대상.

## Commands

```bash
cd p10-scholarsync
pnpm dev          # dev server (turbopack)
pnpm build        # production build
pnpm lint         # ESLint
```

## Key Patterns

- **모바일 우선 반응형**: 60% 모바일 트래픽 예상. Header는 md 이하에서 Sheet 메뉴, 필터도 Sheet
- **AI 생성물 고지**: 자소서 상단에 AI 생성 면책 문구 필수 (`AI_DISCLAIMER` 상수)
- **스트리밍**: AI SDK `streamText` + `toTextStreamResponse()` (v6). 클라이언트에서 `ReadableStream` 직접 파싱
- **자동 저장**: 자소서 편집 시 5초 디바운스 자동 저장
- **에세이 마커**: AI 출력에 `[ESSAY_N]`/`[/ESSAY_N]` 마커로 항목 분리
- **학점 체계**: 4.5만점 / 4.3만점 선택 가능, 프로필에 `gpa_scale` 저장
- **프로필 경험 필드**: 수상/봉사/인턴/프로젝트/리더십/동기/기타 7개 카테고리로 세분화
- **shadcn/ui v4**: base-ui 기반. `asChild` 대신 `render` prop 사용 (예: `SheetTrigger render={<Button />}`)
- **DB 직접 접근**: PostgreSQL 직접 연결 가능 (`pg` 패키지, pooler URL)
- **AI 프로필 자동입력**: 이력서/자기소개서 텍스트 또는 이미지(최대 5장, 4MB)를 붙여넣으면 GPT-4o-mini가 `generateObject` + `jsonSchema`로 구조화 추출하여 프로필 폼에 자동 채움. 클립보드 붙여넣기, 드래그앤드롭, 파일 업로드 지원. OpenAI JSON Schema에는 반드시 `additionalProperties: false` 필요

## Deployment

모노레포(`jurogrammer/portfolio-demos`)의 서브디렉토리. Vercel Dashboard에서 Root Directory를 `p10-scholarsync`으로 설정하여 독립 배포.

| Vercel Project | URL | Root Directory |
|---|---|---|
| p10-scholarsync | https://p10-scholarsync.vercel.app | `p10-scholarsync` |

## Known Limitations (MVP)

- Kakao OAuth 미구현 (이메일 가입만)
- 이메일 인증 건너뜀 (Supabase Site URL이 P3로 설정됨 — 공유 인스턴스 제약)
- 마감일 이메일 알림 미구현 (Resend 연동 Post-MVP)
- 결제/크레딧 시스템 없음 (MVP는 무료 운영, 월 3회 생성 제한)
- 성적표 PDF 업로드 미구현 (P0-B 범위)
