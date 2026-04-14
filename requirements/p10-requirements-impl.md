# ScholarSync KR — 구현 현황 문서 (Implementation Status Document) v1.0

**작성일**: 2026-04-13
**최종 수정일**: 2026-04-13
**작성자**: Claude Code / Writer
**상태**: 구현 완료 (MVP Phase)
**기준**: [PRD v1.1](p10-requirements.md) 기준

---

## 1. 문서 목적

본 문서는 ScholarSync KR의 **현재 구현된 상태**를 정확히 기록한다. 원본 PRD(p10-requirements.md)와의 차이점, 구현된 기능, 미구현 사항, 알려진 제약사항을 명시하여 향후 개발과 배포의 기준선이 된다.

---

## 2. 기술 스택 (구현)

| 영역 | 선택 | 버전 | 상태 |
|---|---|---|---|
| **프레임워크** | Next.js App Router | 16.2.3 | ✅ |
| **언어** | TypeScript | 5.x | ✅ |
| **런타임** | React | 19.2.4 | ✅ |
| **스타일링** | Tailwind CSS | 4.x + tw-animate-css | ✅ |
| **UI Components** | shadcn/ui v4 (base-ui) | 4.2.0 | ✅ |
| **아이콘** | Lucide React | 1.8.0 | ✅ |
| **데이터베이스** | Supabase PostgreSQL | ap-northeast-2 | ✅ |
| **인증** | Supabase Auth (이메일) | @supabase/ssr@0.10.2 | ✅ |
| **AI — 자소서 생성** | OpenAI GPT-4o (스트리밍) | @ai-sdk/openai@3.0.52 | ✅ |
| **AI — 프로필 자동입력** | OpenAI GPT-4o-mini (JSON Schema) | @ai-sdk/openai@3.0.52 | ✅ |
| **AI SDK** | Vercel AI SDK | 6.0.158 | ✅ |
| **이메일** | Resend API | 6.10.0 | ⏳ (Post-MVP) |
| **호스팅** | Vercel Serverless | - | ✅ |
| **패키지 관리자** | pnpm | - | ✅ |
| **테마** | next-themes | 0.4.6 | ✅ |
| **토스트 알림** | Sonner | 2.0.7 | ✅ |
| **유틸리티** | Zod (스키마 검증) | 4.3.6 | ✅ |

---

## 3. 구현 기능 vs 계획 기능

### 3.1 P0-A: 핵심 루프 (완성 ✅)

| 기능 ID | 기능명 | 설명 | 구현 상태 | 비고 |
|---|---|---|---|---|
| **F-01** | 회원가입/로그인 | 이메일 기반 회원가입, 자동 이메일 확인 (MVP) | ✅ 완성 | Kakao OAuth는 Post-MVP |
| **F-02** | 프로필 입력 | 학적 정보 + 자소서 맞춤 정보 (7개 카테고리) | ✅ 완성 | GPA: 학년별 + 평균, 4.5 또는 4.3 만점 선택 가능 |
| **F-04** | 장학금 매칭 | 소득분위·학점·지역·전공·학위과정 필터링 | ✅ 완성 | Supabase PostgreSQL 기반 쿼리, 20건 시드 데이터 |
| **F-05** | 장학금 상세 보기 | 자격, 금액, 마감일, 자소서 항목, 원본 링크 | ✅ 완성 | 모바일 반응형, D-day 배지 표시 |
| **F-06** | 자소서 초안 생성 | 기관별 항목·글자수에 맞춘 한국어 초안 (스트리밍) | ✅ 완성 | AI 생성물 고지 필수 표시, 월 3회 무료 제한 |
| **F-07** | 자소서 편집/저장 | 사용자 수정, 복사, 다운로드 | ✅ 완성 | 5초 디바운스 자동 저장 |

### 3.2 P0-B: 확장 기능 (부분 구현)

| 기능 ID | 기능명 | 설명 | 구현 상태 | 상세 |
|---|---|---|---|---|
| **F-03** | 프로필 AI 자동입력 | 이력서/자기소개서 텍스트 또는 이미지(최대 5장)에서 구조화 추출 | ✅ 완성 | GPT-4o-mini + JSON Schema, 클립보드/드래그/파일 업로드 지원 |
| **F-03b** | 성적표 PDF 업로드 | PDF Vision 파싱 | ⏳ 미구현 | P0-B 범위였으나 MVP에서 생략 |
| ~~**F-08**~~ | ~~크레딧 결제~~ | ~~Toss Payments~~ | ❌ Post-MVP | 제품 검증 후 도입 |
| **F-09** | 마감일 이메일 알림 | 매칭된 장학금 마감 3일 전 알림 | ⏳ 미구현 | Resend API 연동 Post-MVP |

### 3.3 P1: Nice-to-have (미구현)

모두 Post-MVP 범위. 현재 MVP 버전에서는 구현되지 않음:
- RAG 기반 장학금 매칭 고도화
- Google Calendar 동기화
- AI 자소서 첨삭 피드백
- 합격 사례 커뮤니티
- 리퍼럴 코드
- NPS 인앱 서베이

---

## 4. 데이터베이스 스키마

Supabase 공유 인스턴스 (`fpoqnnqegriwtafaybhw`, ap-northeast-2)에서 **4개 테이블** 운영. 모두 `ss_` 프리픽스 사용.

### 4.1 ss_profiles (사용자 프로필)

```sql
CREATE TABLE ss_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 학적 정보
  university TEXT,
  department TEXT,
  grade INT (1~6),
  degree_type TEXT ('undergraduate'|'master'|'doctorate', default='undergraduate'),

  -- 학점 (2가지 방식 지원)
  gpa NUMERIC(3,2) CHECK(0 ≤ gpa ≤ 4.5),
  gpa_by_grade JSONB DEFAULT '{}',  -- 학년별 학점: {"1": 4.0, "2": 3.9, ...}
  gpa_scale NUMERIC(3,1) DEFAULT 4.5,  -- 4.5 또는 4.3

  -- 지원 자격
  income_quintile INT (1~10),
  region TEXT,
  interests TEXT[],

  -- 자소서 작성 맞춤 정보 (7개 카테고리)
  bio_keywords TEXT,        -- 성격, 강점, 가치관 요약
  awards TEXT,              -- 수상 경력
  volunteering TEXT,        -- 봉사활동
  work_experience TEXT,     -- 인턴/직무 경험
  projects TEXT,            -- 프로젝트/연구 경험
  leadership TEXT,          -- 리더십/동아리 경험
  motivation TEXT,          -- 지원 동기, 미래 계획
  experiences TEXT,         -- 기타 경험 (교환학생, 자격증 등)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS 정책**: 사용자는 자신의 프로필만 조회/수정 가능
**자동 생성**: Supabase `auth.users` 트리거로 회원가입 시 자동 생성

---

### 4.2 ss_scholarships (장학금 데이터)

```sql
CREATE TABLE ss_scholarships (
  id UUID PRIMARY KEY,

  -- 기본 정보
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  org_type TEXT NOT NULL ('government'|'foundation'|'local_gov'|'university'),
  source_url TEXT NOT NULL,

  -- 대상 조건
  target_degree TEXT[] NOT NULL DEFAULT '{all}',  -- ['undergraduate'], ['master'], ['doctorate'], ['all']
  min_gpa NUMERIC(3,2),
  max_income_quintile INT (1~10),
  target_regions TEXT[],
  target_majors TEXT[],

  -- 지원금
  amount_type TEXT NOT NULL ('full_tuition'|'half_tuition'|'fixed'|'variable'),
  amount_value INT,  -- 정액일 경우만 사용

  -- 지원 기간
  deadline DATE NOT NULL,
  application_start DATE,

  -- 자소서 항목
  essay_prompts JSONB,  -- [{"prompt": "질문", "max_chars": 1500}, ...]
  extra_requirements TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS 정책**: 모두 공개 읽기 (is_active=true), service role만 쓰기
**현재 데이터**: 20건 시드 데이터 (seed.sql) — 정부/재단/지자체 조합
**인덱스**: deadline, is_active 기반 쿼리 최적화

---

### 4.3 ss_essays (저장된 자소서)

```sql
CREATE TABLE ss_essays (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES ss_scholarships(id) ON DELETE CASCADE,

  content JSONB NOT NULL DEFAULT '{}',  -- {"essay_1": "내용...", "essay_2": "내용..."}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, scholarship_id)
);
```

**RLS 정책**: 사용자는 자신의 에세이만 조회/수정/삭제 가능
**유니크 제약**: 사용자당 장학금당 1개 초안만 저장 (upsert로 갱신)

---

### 4.4 ss_essay_generations (생성 횟수 추적)

```sql
CREATE TABLE ss_essay_generations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES ss_scholarships(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**용도**: 월별 무료 자소서 생성 횟수 제한 (3회/월) 추적
**RLS 정책**: 사용자는 자신의 기록만 조회/삽입 가능
**인덱스**: (user_id, generated_at) 조합 쿼리 최적화

---

## 5. API 라우트 및 서버 액션

### 5.1 API 라우트 (Route Handlers)

#### `POST /api/auth/signup`
- **역할**: 이메일 기반 회원가입
- **입력**: `{ email, password }`
- **처리**:
  - Supabase admin API로 사용자 생성 (`email_confirm=true` MVP 자동 확인)
  - `ss_profiles` 자동 upsert
  - 비밀번호 최소 8자 검증
- **응답**: `{ success: true, userId }`
- **오류**: 중복 이메일, 비밀번호 길이 검증

#### `POST /api/essay/generate`
- **역할**: AI 자소서 스트리밍 생성
- **인증**: Supabase auth 필수
- **입력**: `{ scholarship_id, prompt (또는 user_keywords) }`
- **처리**:
  1. 월별 생성 횟수 확인 (무료 제한: 3회/월)
  2. 사용자 프로필 + 장학금 정보 조회
  3. GPT-4o로 스트리밍 자소서 생성 (temp=0.8)
  4. `[ESSAY_1]...[/ESSAY_1]` 마커로 항목 분리
  5. 생성 기록 비동기 저장 (fire-and-forget)
- **출력**: SSE 스트림 (텍스트/스트림)
- **오류**: 429 (월 제한 초과), 401 (미로그인)

#### `POST /api/profile/autofill`
- **역할**: AI 프로필 자동입력 (텍스트/이미지 → 구조화)
- **인증**: Supabase auth 필수
- **입력**: `{ text?: string, images?: string[] (Data URLs) }`
- **처리**:
  1. 입력 검증: 텍스트 ≥20자 또는 이미지 ≥1장
  2. GPT-4o-mini + JSON Schema로 구조화 추출
  3. 14개 필드 추출: university, department, grade, degree_type, region, interests, bio_keywords, awards, volunteering, work_experience, projects, leadership, motivation, experiences
  4. 추측하지 말고 명시되지 않은 정보는 빈 문자열 반환
- **출력**: JSON 객체 (프로필 폼에 자동 채움)
- **제한**: 텍스트 ≤10,000자, 이미지 ≤5장 (4MB/장)

---

### 5.2 서버 액션 (Server Actions, 'use server')

#### `searchScholarships(filters)`
**경로**: `src/app/(main)/scholarships/actions.ts`

```typescript
interface ScholarshipFilters {
  degree_type?: string
  region?: string
  org_type?: string
  keyword?: string
  gpa?: string
  income_quintile?: string
}
```

- **처리**: PostgreSQL 동적 쿼리 (Supabase filter)
  - `degree_type`: 배열 포함 여부 또는 'all'
  - `region`: NULL 또는 배열 포함 여부
  - `org_type`: 정확 일치
  - `keyword`: 이름/기관 ILIKE 검색
  - `gpa`: min_gpa ≤ (사용자 GPA)
  - `income_quintile`: max_income_quintile ≥ (사용자 분위)
- **정렬**: deadline 오름차순 (가까운 마감일 먼저)
- **반환**: Scholarship[] (is_active=true만)

---

#### `getProfile()` / `updateProfile(data)`
**경로**: `src/app/(main)/my/profile/actions.ts`

**getProfile()**:
- 로그인한 사용자의 프로필 조회
- 없으면 자동 생성 (upsert)

**updateProfile(data: ProfileUpdateData)**:
- 입력값:
  ```typescript
  {
    university, department, grade, gpa_by_grade (Record<string, string>),
    gpa_scale, income_quintile, region, degree_type,
    interests (쉼표 구분), bio_keywords, experiences,
    awards, volunteering, work_experience, projects, leadership, motivation
  }
  ```
- 처리:
  1. 학년별 GPA(`gpa_by_grade`)에서 평균 계산
  2. interests를 배열로 변환 (쉼표 → trim → filter)
  3. 숫자 필드 파싱 (parseInt, parseFloat)
  4. `updated_at` 갱신
- 반환: `{ error?: string }`

---

#### `getMyEssays()` / `getEssay(id)` / `saveEssay()` / `deleteEssay()`
**경로**: `src/app/(main)/my/essays/actions.ts`

**getMyEssays()**:
- 로그인한 사용자의 모든 저장된 자소서
- 관계 조인: `scholarship(id, name, organization)`
- 정렬: `updated_at` 내림차순 (최근 수정순)

**getEssay(id)**:
- 특정 자소서 + 장학금 정보 (essay_prompts 포함)
- 사용자 권한 확인

**saveEssay(scholarshipId, content: Record<string, string>)**:
- Upsert: user_id + scholarship_id 조합
- 자동으로 `updated_at` 갱신
- 반환: Essay (저장된 객체)

**deleteEssay(id)**:
- 사용자 확인 후 삭제

---

## 6. 컴포넌트 아키텍처

### 6.1 레이아웃 컴포넌트
```
src/components/layout/
├── Header.tsx                 ← sticky 상단, 로그인/프로필 버튼, md 이하에서 Sheet 메뉴
└── Footer.tsx                 ← 바닥글, 약관/개인정보처리방침 링크
```

### 6.2 페이지 구조
```
(main)/
├── page.tsx                   ← 랜딩 페이지 (Hero, 기능, 통계, CTA)
├── auth/
│   ├── login/page.tsx         ← 로그인 폼
│   ├── signup/page.tsx        ← 회원가입 폼 (/api/auth/signup 호출)
│   └── callback/route.ts      ← OAuth 콜백 (미구현)
├── scholarships/
│   ├── page.tsx               ← 장학금 검색/목록 (Server Component)
│   ├── actions.ts             ← searchScholarships
│   ├── loading.tsx            ← 로딩 스켈레톤
│   └── [id]/page.tsx          ← 장학금 상세 + 자소서 생성 CTA
├── my/
│   ├── profile/
│   │   ├── page.tsx           ← 프로필 편집 (인증 필수)
│   │   └── actions.ts         ← getProfile, updateProfile
│   └── essays/
│       ├── page.tsx           ← 저장된 자소서 목록
│       ├── actions.ts         ← getMyEssays, getEssay, saveEssay, deleteEssay
│       └── [id]/page.tsx      ← 자소서 에디터
├── essays/new/page.tsx        ← 새 자소서 생성 시작 페이지
├── terms/page.tsx             ← 이용약관
└── privacy/page.tsx           ← 개인정보처리방침
```

### 6.3 기능별 컴포넌트
```
src/components/
├── essay/
│   ├── EssayGenerator.tsx      ← SSE 스트리밍 생성 UI + AI 고지
│   └── EssayEditor.tsx         ← 항목별 textarea, 글자 수 카운터, 자동 저장
├── profile/
│   ├── ProfileForm.tsx         ← 전체 프로필 폼 (학적 + 경험 7개 필드)
│   └── AutofillDialog.tsx      ← AI 자동입력 UI (텍스트/이미지 입력 → API → 폼 채움)
├── scholarships/
│   ├── ScholarshipCard.tsx     ← 카드 뷰 (금액, D-day, 배지)
│   └── ScholarshipFilters.tsx  ← 필터 UI (데스크톱 sidebar / 모바일 Sheet)
└── ui/                         ← shadcn/ui v4 컴포넌트 (base-ui 기반)
```

### 6.4 shadcn/ui v4 특징
- **base-ui 기반**: JSX 렌더링 (asChild 대신 render prop 사용)
- **포함 컴포넌트**: Button, Input, Select, Textarea, Sheet, Card, Badge, Dialog, Tabs 등
- **스타일**: Tailwind CSS v4 + tw-animate-css (애니메이션)

---

## 7. 인증 흐름

### 7.1 회원가입
```
1. 사용자: /auth/signup에서 이메일+비밀번호 입력
2. 클라이언트: /api/auth/signup에 POST
3. 서버:
   - Supabase admin API로 사용자 생성 (email_confirm=true)
   - ss_profiles 자동 upsert (trigger 또는 명시적)
   - { success: true, userId } 응답
4. 클라이언트: /my/profile로 리다이렉트 (온보딩)
```

### 7.2 로그인
```
1. 사용자: /auth/login에서 이메일+비밀번호 입력
2. Supabase Client SDK로 signInWithPassword()
3. 성공 시 JWT 토큰 쿠키에 저장
4. /scholarships로 리다이렉트
```

### 7.3 로그아웃
```
Header 컴포넌트의 "로그아웃" 버튼 → signOut()
```

### 7.4 보호된 페이지
- `/my/profile`, `/my/essays`, `/my/essays/[id]`: 로그인 확인 후 접근
- 미로그인 시 `/auth/login?redirect=/my/profile`로 리다이렉트

### 7.5 제약사항 (MVP)
- **Kakao OAuth 미구현**: 이메일 가입만 지원
- **이메일 인증 건너뜀**: `email_confirm=true` (Supabase Site URL이 P3로 설정되어 공유 인스턴스 제약)
- **비밀번호 재설정**: 미구현 (Post-MVP)

---

## 8. AI 기능 상세

### 8.1 자소서 생성 (F-06)

**모델**: OpenAI GPT-4o
**온도**: 0.8 (창의성 유지, 다양한 초안 생성)
**스트리밍**: AI SDK v6 `streamText()` → SSE `toTextStreamResponse()`

**프롬프트 구성**:
```
시스템 프롬프트:
- 한국어 전문 작성자 역할
- 글자 수 엄격 준수 (공백 포함)
- [ESSAY_N] 마커로 항목 구분
- 지원자 정보를 자연스럽게 통합

입력값:
- 기본 프로필: 대학, 학과, 학점 (학년별+평균), 학년, 지역, 학위
- 경험 정보: 수상, 봉사, 인턴/직무, 프로젝트, 리더십, 동기, 기타
- 장학금: 기관명, 자소서 항목별 질문 + 글자수 제한
- 선택 입력: 사용자 추가 강조 내용
```

**출력**:
```
[ESSAY_1]
(항목 1 내용, max_chars 이내)
[/ESSAY_1]
[ESSAY_2]
(항목 2 내용, max_chars 이내)
[/ESSAY_2]
```

**글자 수**: 목표 충족률 90% 이상 (max_chars의 80~100%)
**고지**: 상단에 AI_DISCLAIMER 필수 표시

---

### 8.2 프로필 자동입력 (F-03)

**모델**: OpenAI GPT-4o-mini (비용 절감)
**방식**: `generateObject()` + JSON Schema (TypeScript-based)
**온도**: 0.2 (정확성 중시)

**입력**:
- 텍스트: 이력서, 자기소개서, 자유 형식 (≤10,000자)
- 이미지: 성적표, 증명서 등 (최대 5장, 4MB/장, Data URL)
- 클립보드/드래그/파일 업로드 지원

**추출 필드** (14개):
```typescript
interface AutofillResult {
  university: string
  department: string
  grade: number (0=미입력)
  degree_type: 'undergraduate' | 'master' | 'doctorate'
  region: string (광역시/도 단위로 정규화)
  interests: string (쉼표 구분)
  bio_keywords: string
  awards: string
  volunteering: string
  work_experience: string
  projects: string
  leadership: string
  motivation: string
  experiences: string
}
```

**규칙**:
- 명시되지 않은 정보: 빈 문자열 (추측 금지)
- 거주 지역: "강남구" → "서울", "수원시" → "경기"
- 경험 필드: 불릿("- ") 구분, 날짜/기간 포함
- 필드 유효성: `additionalProperties: false` (초과 필드 금지)

**응답**: JSON 객체 → 프로필 폼에 자동 채움

---

## 9. 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fpoqnnqegriwtafaybhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# OpenAI
OPENAI_API_KEY=<api-key>

# Resend (Post-MVP)
RESEND_API_KEY=<api-key>

# 배포
NEXT_PUBLIC_SITE_URL=https://p10-scholarsync.vercel.app
```

**.env.local**: `.gitignore` 대상 (커밋 금지)

---

## 10. 알려진 제약사항 (MVP)

### 10.1 미구현 기능

| 기능 | 이유 | 타이밍 |
|---|---|---|
| Kakao OAuth | 간편 인증 구현 필요 | Post-MVP |
| 이메일 인증 | Supabase Site URL 공유 인스턴스 제약 | Post-MVP |
| 성적표 PDF 업로드 | P0-B 스코프, MVP에서 스킵 | P1 |
| 마감일 이메일 알림 | Resend 연동 필요 | Post-MVP |
| 결제/크레딧 시스템 | 무료 운영 (월 3회 제한) | Post-MVP |
| NPS 인앱 서베이 | 사용자 확보 후 | Post-MVP |

### 10.2 알려진 동작 제약

1. **공유 Supabase 인스턴스**: P2, P3, P8과 동일 인스턴스 사용
   - Site URL: P3로 설정됨 (이메일 콜백 URL)
   - 테이블 프리픽스 `ss_` 사용으로 격리

2. **무료 자소서 생성 제한**: 월 3회 (tracked in `ss_essay_generations`)
   - 월은 UTC 기준 1일 00:00 ~ 말일 23:59

3. **AI 생성물 고지**: 필수
   - 자소서 상단에 AI_DISCLAIMER 표시
   - 표절 방지를 위해 이용약관에 면책 조항 명시

4. **유니크 제약**: 사용자당 장학금당 1개 초안
   - 동일 장학금으로 다시 생성하면 덮어씀
   - `ss_essays.UNIQUE(user_id, scholarship_id)`

5. **장학금 데이터**: 수동 큐레이션 (20건)
   - 정부, 재단, 지자체 조합
   - 자동 크롤러 없음
   - `is_active=false`는 마감일 경과 후 수동 처리

---

## 11. 배포 설정

### 11.1 Vercel 배포

**프로젝트**: p10-scholarsync
**Root Directory**: `p10-scholarsync`
**환경**: 프로덕션 (`p10-scholarsync.vercel.app`)

**자동 배포**:
```bash
git push → Vercel 트리거 (모노레포 특성상 불확실)
```

**수동 배포** (필요시):
```bash
cd p10-scholarsync
vercel --prod
```

**배포 확인**:
```bash
vercel ls 2>&1 | grep p10
```

### 11.2 빌드 및 실행

```bash
cd p10-scholarsync

# 개발
pnpm dev          # turbopack, localhost:3000

# 프로덕션 빌드
pnpm build
pnpm start

# 린트
pnpm lint
```

### 11.3 환경 변수 관리

Vercel Dashboard → Settings → Environment Variables에서 관리:
- Development: 로컬 `.env.local`
- Production: 배포된 환경변수 설정

---

## 12. 배포 후 테스트 체크리스트

- [ ] 회원가입 및 로그인 동작
- [ ] 프로필 입력 저장
- [ ] 장학금 검색 필터 작동
- [ ] 장학금 상세 조회
- [ ] AI 자소서 생성 (스트리밍)
- [ ] 자소서 편집 및 저장
- [ ] AI 프로필 자동입력 (텍스트/이미지)
- [ ] 로그아웃
- [ ] 모바일 반응형 확인
- [ ] 성능 (Lighthouse) 측정

---

## 13. 성능 목표 및 달성 현황

| 항목 | 목표 | 현황 | 상태 |
|---|---|---|---|
| 매칭 결과 조회 | 2초 이내 | PostgreSQL 인덱스 최적화 | ✅ |
| 자소서 첫 글자 출력 | 3초 이내 | 스트리밍 SSE 적용 | ✅ |
| 첫 로드 JS | 150KB 이하 | Next.js 번들 최적화 중 | ⏳ |
| 모바일 우선 | 60% 트래픽 예상 | 반응형 설계 완료 | ✅ |
| Lighthouse 점수 | 90+ (전 항목) | 측정 필요 | ⏳ |

---

## 14. 주요 파일 목록

```
p10-scholarsync/
├── package.json                           ← 의존성 관리
├── supabase/
│   ├── schema.sql                         ← 4개 테이블 + RLS 정책
│   ├── seed.sql                           ← 20건 장학금 시드 데이터
│   └── migrations/
│       └── 20260413_add_gpa_by_grade.sql ← GPA 학년별 추적
├── src/
│   ├── app/
│   │   ├── layout.tsx                     ← Root layout (Geist font, Toaster)
│   │   ├── (main)/
│   │   │   ├── layout.tsx                 ← 메인 레이아웃 (Header, Footer)
│   │   │   ├── page.tsx                   ← 랜딩 페이지
│   │   │   ├── auth/                      ← 인증 페이지
│   │   │   ├── scholarships/              ← 장학금 검색/상세
│   │   │   ├── my/profile/                ← 프로필 관리
│   │   │   ├── my/essays/                 ← 자소서 관리
│   │   │   ├── essays/new/                ← 새 자소서 시작
│   │   │   ├── terms/                     ← 이용약관
│   │   │   └── privacy/                   ← 개인정보처리방침
│   │   └── api/
│   │       ├── auth/signup/route.ts       ← 회원가입
│   │       ├── essay/generate/route.ts    ← 자소서 생성 (스트리밍)
│   │       └── profile/autofill/route.ts  ← 프로필 자동입력
│   ├── components/
│   │   ├── layout/                        ← Header, Footer
│   │   ├── essay/                         ← 자소서 관련 컴포넌트
│   │   ├── profile/                       ← 프로필 관련 컴포넌트
│   │   ├── scholarships/                  ← 장학금 관련 컴포넌트
│   │   └── ui/                            ← shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── constants.ts                   ← 상수 (지역, 학위, AI 고지)
│   │   ├── utils.ts                       ← 유틸 함수
│   │   └── supabase/
│   │       ├── client.ts                  ← 브라우저 클라이언트
│   │       ├── server.ts                  ← 서버 클라이언트 (SSR)
│   │       └── admin.ts                   ← 관리자 클라이언트
│   ├── types/
│   │   └── database.ts                    ← TypeScript 타입 정의
│   └── supabase/
│       ├── schema.sql                     ← DB 스키마
│       └── seed.sql                       ← 시드 데이터
└── CLAUDE.md                              ← 프로젝트 가이드
```

---

## 15. 코드 품질 및 컨벤션

### 15.1 TypeScript 타입
- 모든 함수에 반환 타입 명시
- Supabase 타입: `src/types/database.ts`에서 정의
- 자동으로 생성된 타입: supabase-js 활용 (필요시)

### 15.2 에러 처리
- Server Actions: `{ error?: string }` 반환
- API Routes: `Response.json({ error: "메시지" }, { status: 4xx })`
- 사용자 메시지: 모두 한국어

### 15.3 로깅
- 개발: `console.error()` for debugging
- 프로덕션: Vercel Analytics 또는 Sentry (아직 설정 안 됨)

### 15.4 스타일
- CSS: Tailwind CSS v4 (`@apply` 최소화)
- 명명: PascalCase (컴포넌트), camelCase (함수/변수)
- 파일: 라우트는 Next.js 관례 (`page.tsx`, `layout.tsx`, `route.ts`)

---

## 16. 다음 단계 (Post-MVP)

### 16.1 즉시 필요
1. **배포 후 검증**: 모든 기능 프로덕션 테스트
2. **마케팅**: 에브리타임 캠페인, 블로그 콘텐츠
3. **사용자 피드백**: NPS, 이탈률 분석

### 16.2 1주일 내
- Kakao OAuth 통합
- 이메일 인증 복구 (Site URL 재설정)
- 마감일 알림 (Resend) 구현
- 성능 최적화 (Lighthouse 90+)

### 16.3 2주일 이후
- 장학금 데이터 200건 추가 수집
- PDF 성적표 업로드 및 Vision 파싱
- 결제 시스템 (Toss Payments)
- NPS 인앱 서베이

### 16.4 버전 고도화 (v2.0)
- RAG 기반 의미 검색
- AI 자소서 첨삭 피드백
- 합격 사례 커뮤니티
- 리퍼럴 프로그램

---

## 17. 참조 문서

- **원본 PRD**: [p10-requirements.md](p10-requirements.md)
- **프로젝트 가이드**: [p10-scholarsync/CLAUDE.md](../p10-scholarsync/CLAUDE.md)
- **Supabase 스키마**: [p10-scholarsync/supabase/schema.sql](../p10-scholarsync/supabase/schema.sql)
- **Supabase 시드**: [p10-scholarsync/supabase/seed.sql](../p10-scholarsync/supabase/seed.sql)

---

*문서 끝.*
