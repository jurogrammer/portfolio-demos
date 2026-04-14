# P8. 규칙 기반 질문-응답-답장 자동화 플랫폼 MVP (ReframeBot)

> 요구사항 명세서
> 위시켓 웹개발 포트폴리오 프로젝트 시리즈
> 버전 1.0 | 2026년 4월

---

## 목차

1. 프로젝트 개요
2. 시스템 아키텍처
3. 규칙 엔진 설계
4. DB 스키마
5. 페이지 구성 및 기능 요구사항
6. API 설계
7. 비기능 요구사항 (NFR)
8. 기술 스택 선정
9. 폴더 구조 및 파일 컨벤션
10. 개발 일정
11. 완료 기준 (Definition of Done)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | ReframeBot — 규칙 기반 질문-응답-답장 자동화 플랫폼 MVP |
| **목적** | 사용자의 '질문→응답→언어 반응' 과정을 규칙으로 정의하여 자동화하는 구조를 설계·구현하고, 향후 AI 고도화를 위한 데이터 파이프라인을 갖춘 MVP를 시연한다. |
| **도메인** | 교육/학습 — 매일 학습 질문에 응답하면, 규칙 기반으로 리프레이밍·피드백 답장을 자동 생성 |
| **기간** | 5일 (~40시간) |
| **타겟 사용자** | 위시켓 클라이언트 (규칙 기반 자동화, 데이터 기반 고도화를 원하는 기업) |
| **핵심 성공 지표** | 질문 발송 → 응답 제출 → 규칙 매칭 → 자동 답장 생성의 전체 파이프라인 동작 확인. 관리자 CMS에서 규칙 CRUD + 검수 큐 처리 가능. |

### 1.1 배경

단순 상담이나 콘텐츠 제공 서비스를 넘어, 사용자의 언어 반응 패턴을 규칙으로 정의하여 자동화 가능한 구조를 만드는 것이 핵심이다. MVP에서는 키워드/정규식 기반 매칭 엔진으로 구현하되, 모든 상호작용 데이터를 구조화 저장하여 향후 AI 파인튜닝 학습 데이터로 직접 활용할 수 있는 파이프라인을 갖춘다.

### 1.2 서비스 운영 모델

- **기수제**: 기수당 30명, 관리자가 수동 배정 (MVP에서는 결제 없음)
- **익명 참여**: 닉네임만 노출, 이메일은 로그인 용도로만 사용
- **일일 1질문**: 매일 오전 9시 시스템이 질문 발송
- **1일 1응답**: 사용자는 하루에 한 번만 응답 제출 가능 (수정 불가)
- **자동 답장**: 규칙 매칭 → 템플릿 기반 답장 생성 → 웹 내 메시지함으로 전달
- **검수 큐**: 규칙 미매칭 응답은 관리자 검수 큐로 이동

### 1.3 사이트맵

| URL 경로 | 페이지명 | 역할 |
|---|---|---|
| `/` | 랜딩 페이지 | 서비스 소개, 현재 모집 기수 안내, 참여 신청 CTA |
| `/login` | 로그인 | 이메일 매직링크 로그인 |
| `/inbox` | 메시지함 (홈) | 오늘의 질문 카드 + 미읽음 답장 목록 |
| `/inbox/[messageId]` | 메시지 상세 | 질문 본문 + 응답 폼 / 답장 내용 |
| `/history` | 히스토리 | 날짜별 질문→응답→답장 타임라인 |
| `/profile` | 프로필 | 닉네임 수정, 기수 정보, 참여 통계 |
| `/admin` | 관리자 대시보드 | 기수별 참여율, 응답률, 자동/수동 비율 |
| `/admin/cohorts` | 기수 관리 | 기수 CRUD, 참여자 배정 |
| `/admin/questions` | 질문 관리 | 질문 등록/수정/삭제, 발송 예약, 발송 이력 |
| `/admin/rules` | 규칙 관리 | 규칙 CRUD, 조건 설정, 템플릿 연결 |
| `/admin/templates` | 템플릿 관리 | 답장 템플릿 CRUD, 변수 미리보기 |
| `/admin/review` | 검수 큐 | 미매칭 응답 목록 + 수동 답장 작성 |
| `/admin/datasets` | 데이터 내보내기 | 기간/기수 필터 → CSV/JSON 다운로드 |

---

## 2. 시스템 아키텍처

### 2.1 전체 흐름도

```
┌─────────────────────────────────────────────────────────┐
│                      Vercel                              │
│                                                          │
│  ┌─────────────────┐    ┌────────────────────────────┐  │
│  │  Next.js App    │    │  Server Actions / API       │  │
│  │                 │    │                              │  │
│  │  사용자 UI      │◀──▶│  /api/cron/send-questions   │  │
│  │  (메시지함,     │    │  /api/auth/* (NextAuth)     │  │
│  │   히스토리)     │    │                              │  │
│  │                 │    │  ┌────────────────────────┐  │  │
│  │  관리자 UI      │◀──▶│  │   Rule Matching Engine │  │  │
│  │  (CMS,          │    │  │   (TypeScript)         │  │  │
│  │   규칙관리,     │    │  │                        │  │  │
│  │   검수큐)       │    │  │  ① 키워드 매칭          │  │  │
│  └─────────────────┘    │  │  ② 정규식 패턴 매칭     │  │  │
│                          │  │  ③ 감정 사전 매칭       │  │  │
│                          │  │  ④ 템플릿 변수 치환     │  │  │
│                          │  └────────────────────────┘  │  │
│                          └──────────────┬───────────────┘  │
│                                         │                   │
│  ┌──────────────────────────────────────┴────────────┐     │
│  │              Vercel Cron Jobs                       │     │
│  │  - 매일 09:00 KST: 질문 발송                       │     │
│  │  - 매일 23:59 KST: 미응답 질문 만료 처리            │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │
                   ┌─────────┴─────────┐
                   │     Supabase      │
                   │  ┌─────────────┐  │
                   │  │ PostgreSQL  │  │
                   │  │ (메인 DB)   │  │
                   │  ├─────────────┤  │
                   │  │ Auth (참고) │  │
                   │  └─────────────┘  │
                   └───────────────────┘
```

### 2.2 데이터 흐름 — 핵심 사이클

```
[Vercel Cron: 09:00]
  │
  ▼
질문 발송 ──▶ 해당 기수 참여자의 messages 테이블에 INSERT (type='question')
  │
  ▼
사용자 응답 제출 ──▶ responses 테이블 INSERT
  │                     │
  │              ┌──────┴──────┐
  │              ▼             ▼
  │         규칙 매칭 성공    규칙 미매칭
  │              │             │
  │              ▼             ▼
  │         replies INSERT   responses.needs_review = true
  │         (is_auto=true)   관리자 검수 큐에 노출
  │              │
  │              ▼
  │         messages INSERT (type='reply')
  │              │
  │              ▼
  │         datasets INSERT (비정규화 AI 학습용)
  │
  ▼
사용자 메시지함에서 답장 확인
```

---

## 3. 규칙 엔진 설계

### 3.1 매칭 우선순위

규칙은 `priority` (낮을수록 먼저)로 정렬하여 순차 매칭. 첫 번째 매칭 성공 시 해당 규칙의 템플릿으로 답장 생성.

```typescript
// lib/engine/matcher.ts
interface MatchResult {
  matched: boolean;
  rule: Rule | null;
  matchedKeywords: string[];
  confidence: number; // 0.0 ~ 1.0
}

async function matchResponse(
  responseBody: string,
  questionCategory: string
): Promise<MatchResult> {
  // 1. 해당 question_category에 해당하는 활성 규칙을 priority 순으로 조회
  // 2. 각 규칙의 condition_type에 따라 매칭 시도
  // 3. 첫 매칭 성공 시 반환
  // 4. 전부 실패 시 { matched: false } 반환
}
```

### 3.2 조건 타입별 매칭 로직

**KEYWORD** — 파이프(|) 구분 키워드 OR 매칭
```typescript
// condition_value: "못하|안되|실패|포기"
function matchKeyword(text: string, conditionValue: string): string[] {
  const keywords = conditionValue.split('|').map(k => k.trim());
  return keywords.filter(kw => text.includes(kw));
}
// 반환된 배열이 비어있지 않으면 매칭 성공
```

**PATTERN** — 정규식 매칭
```typescript
// condition_value: "나는\\s*.*할\\s*수\\s*없"
function matchPattern(text: string, conditionValue: string): boolean {
  const regex = new RegExp(conditionValue, 'gi');
  return regex.test(text);
}
```

**SENTIMENT** — 간이 감정 사전 (MVP)
```typescript
// condition_value: "NEGATIVE" | "POSITIVE" | "NEUTRAL"
const NEGATIVE_WORDS = ['힘들', '싫', '못하', '안되', '포기', '지치', '우울', '불안'];
const POSITIVE_WORDS = ['좋', '행복', '감사', '성장', '해냈', '뿌듯', '기쁘'];

function matchSentiment(text: string, conditionValue: string): boolean {
  const negScore = NEGATIVE_WORDS.filter(w => text.includes(w)).length;
  const posScore = POSITIVE_WORDS.filter(w => text.includes(w)).length;
  const detected = negScore > posScore ? 'NEGATIVE' : posScore > negScore ? 'POSITIVE' : 'NEUTRAL';
  return detected === conditionValue;
}
```

### 3.3 템플릿 변수 치환

```typescript
// lib/engine/template.ts
interface TemplateContext {
  nickname: string;       // 사용자 닉네임
  keyword: string;        // 매칭된 키워드 (첫 번째)
  keywords: string;       // 매칭된 키워드 전체 (쉼표 구분)
  original: string;       // 응답 원문 (50자 이내 발췌)
  question: string;       // 질문 본문
  date: string;           // 오늘 날짜 (MM월 DD일)
}

function renderTemplate(templateBody: string, ctx: TemplateContext): string {
  return templateBody
    .replace(/\{닉네임\}/g, ctx.nickname)
    .replace(/\{키워드\}/g, ctx.keyword)
    .replace(/\{키워드목록\}/g, ctx.keywords)
    .replace(/\{원문발췌\}/g, ctx.original)
    .replace(/\{질문\}/g, ctx.question)
    .replace(/\{날짜\}/g, ctx.date);
}
```

**템플릿 예시**:
```
{닉네임}님, 오늘 질문에 대한 응답에서 '{키워드}'라는 표현이 눈에 띄네요.

"{원문발췌}"

혹시 이렇게 바꿔 생각해보면 어떨까요?

"나는 아직 배우는 중이다. 지금 못하는 것이 앞으로도 못한다는 뜻은 아니다."

내일도 함께해요!
```

### 3.4 전체 답장 생성 파이프라인 (Server Action)

```typescript
// app/(user)/inbox/[messageId]/actions.ts — submitResponse Server Action 내부
async function processResponseAndGenerateReply(
  responseId: string,
  responseBody: string,
  userId: string,
  questionId: string
) {
  // 1. 질문 정보 조회 (카테고리 포함)
  const question = await getQuestion(questionId);

  // 2. 규칙 매칭
  const matchResult = await matchResponse(responseBody, question.category);

  if (matchResult.matched && matchResult.rule) {
    // 3a. 매칭 성공 → 템플릿 렌더링
    const template = await getTemplate(matchResult.rule.template_id);
    const user = await getUser(userId);
    const replyBody = renderTemplate(template.body, {
      nickname: user.nickname,
      keyword: matchResult.matchedKeywords[0] || '',
      keywords: matchResult.matchedKeywords.join(', '),
      original: responseBody.slice(0, 50),
      question: question.body,
      date: formatDate(new Date()),
    });

    // 4a. replies INSERT (is_auto=true)
    const reply = await createReply({
      response_id: responseId,
      body: replyBody,
      rule_id: matchResult.rule.id,
      is_auto: true,
    });

    // 5a. messages INSERT (type='reply') → 사용자 메시지함에 노출
    await createMessage({
      user_id: userId,
      type: 'reply',
      ref_id: reply.id,
    });

    // 6a. datasets INSERT (AI 학습용 비정규화)
    await insertDataset({ question, responseBody, replyBody, matchResult, isAuto: true });

  } else {
    // 3b. 미매칭 → 검수 큐
    await markForReview(responseId);
  }
}
```

---

## 4. DB 스키마

### 4.1 Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ─── 사용자 ───

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  nickname  String
  role      Role     @default(USER)
  cohortId  String?  @map("cohort_id")
  cohort    Cohort?  @relation(fields: [cohortId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")

  responses Response[]
  messages  Message[]

  @@map("users")
}

enum Role {
  USER
  ADMIN
}

// ─── 기수 ───

model Cohort {
  id        String       @id @default(cuid())
  name      String       // "1기", "2기" 등
  capacity  Int          @default(30)
  status    CohortStatus @default(RECRUITING)
  startDate DateTime?    @map("start_date")
  endDate   DateTime?    @map("end_date")
  createdAt DateTime     @default(now()) @map("created_at")

  users     User[]
  questions Question[]

  @@map("cohorts")
}

enum CohortStatus {
  RECRUITING  // 모집중
  ACTIVE      // 진행중
  COMPLETED   // 종료
}

// ─── 질문 ───

model Question {
  id          String    @id @default(cuid())
  body        String    // 질문 본문
  category    String    // 질문 카테고리 (자기인식, 목표설정, 감정관리, 관계, 성장)
  cohortId    String    @map("cohort_id")
  cohort      Cohort    @relation(fields: [cohortId], references: [id])
  scheduledAt DateTime  @map("scheduled_at") // 발송 예정 시각
  isSent      Boolean   @default(false) @map("is_sent")
  sentAt      DateTime? @map("sent_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  responses Response[]

  @@index([cohortId, scheduledAt])
  @@map("questions")
}

// ─── 응답 ───

model Response {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id])
  questionId  String   @map("question_id")
  question    Question @relation(fields: [questionId], references: [id])
  body        String   // 응답 본문
  needsReview Boolean  @default(false) @map("needs_review") // 검수 필요 여부
  submittedAt DateTime @default(now()) @map("submitted_at")

  reply Reply?

  @@unique([userId, questionId]) // 1인 1응답 제약
  @@index([questionId])
  @@index([needsReview])
  @@map("responses")
}

// ─── 답장 ───

model Reply {
  id         String   @id @default(cuid())
  responseId String   @unique @map("response_id")
  response   Response @relation(fields: [responseId], references: [id])
  body       String   // 답장 본문
  ruleId     String?  @map("rule_id") // null이면 수동 답장
  rule       Rule?    @relation(fields: [ruleId], references: [id])
  isAuto     Boolean  @default(true) @map("is_auto")
  createdBy  String?  @map("created_by") // 수동 답장 시 관리자 ID
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("replies")
}

// ─── 메시지함 ───

model Message {
  id        String      @id @default(cuid())
  userId    String      @map("user_id")
  user      User        @relation(fields: [userId], references: [id])
  type      MessageType // QUESTION 또는 REPLY
  refId     String      @map("ref_id") // questionId 또는 replyId
  isRead    Boolean     @default(false) @map("is_read")
  createdAt DateTime    @default(now()) @map("created_at")

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("messages")
}

enum MessageType {
  QUESTION
  REPLY
}

// ─── 규칙 ───

model Rule {
  id               String        @id @default(cuid())
  name             String        // "부정적 자기인식 리프레이밍"
  priority         Int           @default(100) // 낮을수록 먼저 매칭
  questionCategory String        @map("question_category") // 적용 대상 질문 카테고리
  conditionType    ConditionType @map("condition_type")
  conditionValue   String        @map("condition_value") // "못하|안되|실패" 또는 정규식
  templateId       String        @map("template_id")
  template         ReplyTemplate @relation(fields: [templateId], references: [id])
  isActive         Boolean       @default(true) @map("is_active")
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")

  replies  Reply[]

  @@index([questionCategory, isActive, priority])
  @@map("rules")
}

enum ConditionType {
  KEYWORD
  PATTERN
  SENTIMENT
}

// ─── 답장 템플릿 ───

model ReplyTemplate {
  id        String   @id @default(cuid())
  name      String   // "리프레이밍 격려형"
  body      String   // 변수 포함 본문: "{닉네임}님, ..."
  variables String[] // 사용 가능 변수: ["닉네임", "키워드", "원문발췌"]
  category  String   // 리프레이밍 / 격려 / 심화질문 / 정보제공
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  rules Rule[]

  @@map("reply_templates")
}

// ─── AI 학습용 데이터셋 (비정규화) ───

model Dataset {
  id                String   @id @default(cuid())
  cohortId          String   @map("cohort_id")
  questionBody      String   @map("question_body")
  questionCategory  String   @map("question_category")
  responseBody      String   @map("response_body")
  responseSubmittedAt DateTime @map("response_submitted_at")
  replyBody         String   @map("reply_body")
  replyIsAuto       Boolean  @map("reply_is_auto")
  matchedRuleId     String?  @map("matched_rule_id")
  matchedKeywords   String[] @map("matched_keywords")
  adminEdited       Boolean  @default(false) @map("admin_edited")
  qualityScore      Int?     @map("quality_score") // 관리자 1~5 평가 (향후)
  createdAt         DateTime @default(now()) @map("created_at")

  @@index([cohortId])
  @@index([questionCategory])
  @@index([replyIsAuto])
  @@map("datasets")
}
```

### 4.2 시드 데이터 (개발/시연용)

**기수**: 1기 (ACTIVE, 30명 정원)

**질문 5개 (시연용)**:
| # | 카테고리 | 질문 |
|---|---|---|
| 1 | 자기인식 | 오늘 하루를 돌아보며, 나에 대해 새롭게 알게 된 점이 있나요? |
| 2 | 목표설정 | 이번 주 가장 이루고 싶은 한 가지는 무엇인가요? |
| 3 | 감정관리 | 최근 가장 강하게 느낀 감정은 무엇이었나요? 그 감정의 원인은? |
| 4 | 관계 | 주변 사람에게 전하고 싶지만 아직 못한 말이 있나요? |
| 5 | 성장 | 1년 전의 나와 비교했을 때, 가장 달라진 점은 무엇인가요? |

**규칙 3개 (시연용)**:
| 규칙명 | 카테고리 | 조건 | 템플릿 |
|---|---|---|---|
| 부정적 자기인식 | 자기인식 | KEYWORD: `못하\|부족\|별로\|안되` | 리프레이밍 격려형 |
| 목표 회의감 | 목표설정 | PATTERN: `(모르겠\|없\|글쎄).*(목표\|하고 싶은)` | 탐색 유도형 |
| 부정 감정 표출 | 감정관리 | SENTIMENT: `NEGATIVE` | 감정 수용형 |

**템플릿 3개 (시연용)**:

리프레이밍 격려형:
```
{닉네임}님, '{키워드}'라는 표현이 눈에 띄네요.

"{원문발췌}"

혹시 이렇게 바꿔 생각해보면 어떨까요?
→ "아직 배우는 중이다. 지금 못하는 것이 앞으로도 못한다는 뜻은 아니다."

하루를 마무리하며 자신에게 한 마디 해주세요. 내일도 함께해요!
```

탐색 유도형:
```
{닉네임}님, 목표가 뚜렷하지 않아도 괜찮아요.

지금 이 순간 '하고 싶지 않은 것'부터 떠올려 볼까요?
하기 싫은 것의 반대편에 하고 싶은 것이 숨어 있을 수도 있거든요.

"{원문발췌}" — 이 안에도 힌트가 있을지 모릅니다.
```

감정 수용형:
```
{닉네임}님, 오늘 느낀 감정을 솔직하게 표현해주셨네요.

감정에는 옳고 그름이 없어요.
"{원문발췌}" — 이 감정을 느낀 자신을 있는 그대로 인정해 주세요.

다음 질문에서 이 감정이 어떻게 변했는지 함께 살펴봐요.
```

---

## 5. 페이지 구성 및 기능 요구사항

### 5.1 랜딩 페이지 (`/`)

**히어로 섹션**
- 제목: "매일 하나의 질문이 생각의 방향을 바꿉니다"
- 부제: "ReframeBot은 규칙 기반 자동화로 당신의 응답에 맞춤형 피드백을 전달합니다"
- "참여 신청" CTA 버튼 → `/login`
- "서비스 소개" 스크롤 유도

**서비스 흐름 섹션**
- 3단계 카드: ① 매일 질문 수신 → ② 나의 응답 작성 → ③ 맞춤 답장 확인
- Lucide 아이콘 + 화살표로 시각화

**기술 시연 섹션**
- "이 플랫폼의 핵심 기술" 제목
- 3개 카드: 규칙 엔진 (키워드/패턴/감정 매칭), 데이터 파이프라인 (AI 학습용), 관리자 CMS (규칙/템플릿/검수)
- 각 카드에 간단한 코드 스니펫 또는 다이어그램

**기술 스택 뱃지**
- Next.js, TypeScript, Supabase, Prisma, Tailwind CSS, NextAuth.js, Vercel

### 5.2 로그인 (`/login`)

**매직링크 로그인 폼**
- 이메일 입력 필드 + "로그인 링크 받기" 버튼
- 제출 후 "이메일을 확인해주세요" 안내 메시지
- **시연 모드**: 환경변수 `DEMO_MODE=true` 시, 이메일 입력 없이 시연용 계정으로 즉시 로그인 버튼 노출
  - "시연용 사용자로 로그인" → 시드 사용자 세션 생성
  - "시연용 관리자로 로그인" → 시드 관리자 세션 생성

**NextAuth.js 설정**:
- EmailProvider (매직링크)
- CredentialsProvider (시연 모드 전용)

### 5.3 메시지함 (`/inbox`) — 로그인 후 기본 화면

**레이아웃**: 모바일 — 단일 컬럼 리스트, PC — 좌측 리스트 + 우측 상세 (2-pane)

**오늘의 질문 카드** (최상단 고정)
- 질문 발송 상태에 따라:
  - 질문 있음 + 미응답: 질문 본문 미리보기 + "응답하기" 버튼 (강조)
  - 질문 있음 + 응답 완료: "오늘의 응답을 제출했습니다" + 답장 대기/확인 상태
  - 질문 없음: "오늘의 질문이 아직 도착하지 않았어요" 안내

**메시지 리스트**
- 최신순 정렬
- 각 아이템: 아이콘 (질문=MessageCircle, 답장=Reply) + 내용 미리보기 + 시간 + 읽음/미읽음 뱃지
- 미읽음 메시지 배경 강조 (bg-blue-50)
- 무한 스크롤 또는 "더 보기" 페이지네이션 (20개씩)

### 5.4 메시지 상세 (`/inbox/[messageId]`)

**질문 메시지 상세**
- 질문 본문 (큰 텍스트)
- 카테고리 뱃지
- 날짜 표시
- 응답 폼 (미응답 시):
  - textarea (최소 20자, 최대 2000자)
  - 글자 수 카운터
  - "응답 제출" 버튼 (제출 후 수정 불가 경고 Dialog)
- 내 응답 표시 (응답 완료 시):
  - 응답 본문 + 제출 시간
  - 답장 대기 중 / 답장 도착 상태

**답장 메시지 상세**
- 원래 질문 요약 (접힌 상태, 펼치기 가능)
- 내 응답 요약
- 답장 본문 (큰 텍스트, 메인)
- 읽음 처리 (상세 진입 시 자동)

### 5.5 히스토리 (`/history`)

- 날짜별 그룹핑
- 각 날짜 블록: 질문 → 내 응답 → 답장 (채팅 버블 형태의 타임라인)
- 응답 없는 날: "응답하지 않은 질문" 표시 (흐린 텍스트)
- 날짜 범위 필터 (최근 7일 / 30일 / 전체)
- 무한 스크롤

### 5.6 프로필 (`/profile`)

- 닉네임 수정 폼
- 기수 정보 (기수명, 시작일, 현재 참여자 수)
- 참여 통계: 총 응답 수 / 응답률 / 연속 참여일
- 로그아웃 버튼

### 5.7 관리자 대시보드 (`/admin`)

**레이아웃**: 좌측 사이드바 (기수관리, 질문, 규칙, 템플릿, 검수큐, 데이터) + 메인 콘텐츠

**대시보드 통계 카드**
- 전체 참여자 수 / 활성 기수 수
- 오늘 응답률 (응답 수 / 발송 수)
- 자동 답장 비율 (자동 / 전체)
- 검수 대기 건수 (미매칭 응답)

**최근 활동 테이블**
- 최근 10건 응답: 닉네임, 질문 미리보기, 응답 미리보기, 매칭 상태 (자동/수동/대기), 시간

### 5.8 기수 관리 (`/admin/cohorts`)

**기수 목록**
- 테이블: 기수명, 상태 뱃지(모집중/진행중/종료), 참여자 수/정원, 시작일, 종료일
- "새 기수 생성" 버튼

**기수 상세/편집**
- 기수명, 정원, 시작일/종료일 수정
- 상태 변경 드롭다운
- 참여자 목록: 닉네임, 이메일, 가입일, 응답률
- "참여자 추가" — 이메일로 검색하여 배정

### 5.9 질문 관리 (`/admin/questions`)

**질문 목록**
- 테이블: 질문 미리보기 (50자), 카테고리, 대상 기수, 예정일, 발송 상태
- 필터: 기수, 카테고리, 발송 상태
- "새 질문 등록" 버튼

**질문 등록/수정 폼**
- 질문 본문 textarea
- 카테고리 드롭다운 (자기인식, 목표설정, 감정관리, 관계, 성장)
- 대상 기수 선택
- 발송 예정일 DatePicker
- "즉시 발송" 토글 (예정일 무시하고 바로 발송)

### 5.10 규칙 관리 (`/admin/rules`)

**규칙 목록**
- 테이블: 규칙명, 적용 카테고리, 조건 타입 뱃지, 조건값 미리보기, 연결된 템플릿, 우선순위, 활성/비활성 토글
- 정렬: 우선순위 순
- "새 규칙 추가" 버튼

**규칙 등록/수정 폼**
- 규칙명 입력
- 적용 질문 카테고리 드롭다운
- 조건 타입 선택 (KEYWORD / PATTERN / SENTIMENT)
- 조건값 입력:
  - KEYWORD: 키워드 태그 입력 (파이프 구분)
  - PATTERN: 정규식 입력 + 실시간 테스트 영역 (테스트 텍스트 입력 → 매칭 결과 표시)
  - SENTIMENT: 긍정/부정/중립 라디오
- 연결할 템플릿 드롭다운
- 우선순위 숫자 입력
- 활성/비활성 토글

**규칙 테스트 패널** (사이드바 또는 하단)
- 테스트 텍스트 입력 → "매칭 테스트" 버튼 → 매칭 결과 (매칭된 규칙, 키워드, 생성될 답장 미리보기)

### 5.11 템플릿 관리 (`/admin/templates`)

**템플릿 목록**
- 카드 그리드: 템플릿명, 카테고리 뱃지, 본문 미리보기 (100자), 연결된 규칙 수
- "새 템플릿 추가" 버튼

**템플릿 등록/수정 폼**
- 템플릿명 입력
- 카테고리 드롭다운 (리프레이밍, 격려, 심화질문, 정보제공)
- 본문 textarea (변수 삽입 버튼: `{닉네임}`, `{키워드}`, `{원문발췌}`, `{질문}`, `{날짜}`)
- **미리보기 패널**: 변수에 샘플값 치환한 결과 실시간 표시

### 5.12 검수 큐 (`/admin/review`)

**미매칭 응답 목록**
- 테이블: 닉네임, 질문 미리보기, 응답 전문, 제출 시간, 처리 상태
- 필터: 기수, 날짜 범위
- 각 행 클릭 → 상세 패널 열림

**상세 패널 (슬라이드오버 또는 모달)**
- 질문 전문
- 응답 전문
- "수동 답장 작성" textarea + 제출
- "이 응답으로 새 규칙 제안" 버튼 → 규칙 생성 폼으로 이동 (응답 내용 사전 입력)
- 처리 완료 시 검수 큐에서 제거

### 5.13 데이터 내보내기 (`/admin/datasets`)

**필터**
- 기수 선택 (복수)
- 날짜 범위
- 자동/수동 필터
- 카테고리 필터

**미리보기 테이블**
- 상위 10건 미리보기: 질문, 응답, 답장, 매칭 규칙, 자동 여부

**내보내기 버튼**
- "CSV 다운로드" — 스프레드시트 분석용
- "JSON 다운로드" — AI 학습 데이터용 (OpenAI Fine-tuning JSONL 형식 호환)

JSON 형식:
```json
{
  "messages": [
    {"role": "system", "content": "당신은 교육/학습 리프레이밍 전문가입니다."},
    {"role": "user", "content": "[카테고리: 자기인식] 질문: 오늘 하루를 돌아보며...\n응답: 오늘도 별다른 거 없이 지나갔어요. 뭔가 부족한 느낌..."},
    {"role": "assistant", "content": "닉네임님, '부족'이라는 표현이 눈에 띄네요..."}
  ]
}
```

---

## 6. API 설계

### 6.1 인증 (NextAuth.js)

NextAuth.js 기본 라우트 사용 (`/api/auth/*`).

| 엔드포인트 | 설명 |
|---|---|
| `POST /api/auth/signin/email` | 매직링크 발송 |
| `GET /api/auth/callback/email` | 매직링크 검증 → 세션 생성 |
| `POST /api/auth/signin/credentials` | 시연 모드 로그인 |
| `POST /api/auth/signout` | 로그아웃 |

### 6.2 사용자 Server Actions

모든 사용자 기능은 Server Actions으로 구현. API Route 대신 Server Action을 사용하여 프록시 없이 직접 DB 접근.

```typescript
// app/(user)/inbox/actions.ts
'use server'
async function getMessages(page: number): Promise<Message[]>
async function markAsRead(messageId: string): Promise<void>

// app/(user)/inbox/[messageId]/actions.ts
'use server'
async function getMessageDetail(messageId: string): Promise<MessageDetail>
async function submitResponse(questionId: string, body: string): Promise<ActionResult>
// → 내부에서 processResponseAndGenerateReply() 호출

// app/(user)/history/actions.ts
'use server'
async function getHistory(filter: HistoryFilter): Promise<HistoryEntry[]>

// app/(user)/profile/actions.ts
'use server'
async function updateNickname(nickname: string): Promise<ActionResult>
async function getProfileStats(): Promise<ProfileStats>
```

### 6.3 관리자 Server Actions

```typescript
// app/(admin)/admin/actions.ts
'use server'
async function getDashboardStats(): Promise<DashboardStats>

// app/(admin)/admin/cohorts/actions.ts
'use server'
async function getCohorts(): Promise<Cohort[]>
async function createCohort(data: CohortInput): Promise<ActionResult>
async function updateCohort(id: string, data: CohortInput): Promise<ActionResult>
async function assignUser(cohortId: string, email: string): Promise<ActionResult>

// app/(admin)/admin/questions/actions.ts
'use server'
async function getQuestions(filter: QuestionFilter): Promise<Question[]>
async function createQuestion(data: QuestionInput): Promise<ActionResult>
async function updateQuestion(id: string, data: QuestionInput): Promise<ActionResult>
async function deleteQuestion(id: string): Promise<ActionResult>
async function sendQuestionNow(id: string): Promise<ActionResult>

// app/(admin)/admin/rules/actions.ts
'use server'
async function getRules(): Promise<Rule[]>
async function createRule(data: RuleInput): Promise<ActionResult>
async function updateRule(id: string, data: RuleInput): Promise<ActionResult>
async function deleteRule(id: string): Promise<ActionResult>
async function toggleRule(id: string): Promise<ActionResult>
async function testRule(text: string): Promise<MatchResult> // 규칙 테스트

// app/(admin)/admin/templates/actions.ts
'use server'
async function getTemplates(): Promise<ReplyTemplate[]>
async function createTemplate(data: TemplateInput): Promise<ActionResult>
async function updateTemplate(id: string, data: TemplateInput): Promise<ActionResult>
async function deleteTemplate(id: string): Promise<ActionResult>
async function previewTemplate(id: string, sampleData: TemplateContext): Promise<string>

// app/(admin)/admin/review/actions.ts
'use server'
async function getReviewQueue(filter: ReviewFilter): Promise<Response[]>
async function submitManualReply(responseId: string, body: string): Promise<ActionResult>
async function suggestRuleFromResponse(responseId: string): Promise<RuleInput> // 규칙 제안

// app/(admin)/admin/datasets/actions.ts
'use server'
async function getDatasetPreview(filter: DatasetFilter): Promise<Dataset[]>
async function exportDatasetCSV(filter: DatasetFilter): Promise<string> // CSV 문자열
async function exportDatasetJSON(filter: DatasetFilter): Promise<string> // JSONL 문자열
```

### 6.4 크론 API Route

```typescript
// app/api/cron/send-questions/route.ts
// Vercel Cron: 매일 09:00 KST
export async function GET(request: Request) {
  // 1. Authorization 헤더로 CRON_SECRET 검증
  // 2. 오늘 날짜의 미발송 질문 조회
  // 3. 각 질문의 대상 기수 참여자에게 messages INSERT (type='question')
  // 4. questions.is_sent = true, sent_at = now() 업데이트
}

// app/api/cron/expire-questions/route.ts
// Vercel Cron: 매일 23:59 KST (선택사항)
export async function GET(request: Request) {
  // 미응답 질문에 대한 처리 (히스토리에 '미응답' 표시용)
}
```

**vercel.json 크론 설정**:
```json
{
  "crons": [
    { "path": "/api/cron/send-questions", "schedule": "0 0 * * *" },
    { "path": "/api/cron/expire-questions", "schedule": "50 14 * * *" }
  ]
}
```
> 참고: Vercel Cron은 UTC 기준. KST 09:00 = UTC 00:00, KST 23:50 = UTC 14:50.

---

## 7. 비기능 요구사항 (NFR)

### 7.1 성능

| 항목 | 기준 |
|---|---|
| First Load JS | < 120KB per route |
| LCP | < 2.5s |
| 규칙 매칭 응답 시간 | < 500ms (규칙 100개 기준) |
| 메시지함 로딩 | < 1s (20개 기준) |

### 7.2 보안

| 항목 | 구현 |
|---|---|
| 인증 | NextAuth.js 세션 기반 (httpOnly 쿠키) |
| 관리자 보호 | Middleware에서 role=ADMIN 검증 |
| CSRF | NextAuth.js 내장 CSRF 토큰 |
| 입력 검증 | Zod 스키마 (Server Actions 입력 전체) |
| XSS | 답장 본문 렌더링 시 `sanitize-html` 적용 |
| Rate Limit | 응답 제출 — IP 기반 1분당 5회 제한 |

### 7.3 접근성

- shadcn/ui 기본 접근성 유지
- 키보드 네비게이션 (Tab, Enter)
- 색상 대비 WCAG AA 이상
- 모바일 터치 타겟 최소 44px

---

## 8. 기술 스택 선정

| 영역 | 기술 | 버전 | 용도 |
|---|---|---|---|
| Framework | Next.js (App Router) | 15 | SSR + Server Actions + Cron |
| Language | TypeScript | 5.x | 타입 안전성 |
| Styling | Tailwind CSS | 4 | 반응형 UI |
| UI | shadcn/ui + Lucide React | latest | 컴포넌트 + 아이콘 |
| Auth | NextAuth.js (Auth.js) | 5 | 매직링크 + 시연 모드 |
| DB | Supabase PostgreSQL | - | 호스팅 DB |
| ORM | Prisma | 6.x | 스키마 관리, 타입 안전 쿼리 |
| Form | React Hook Form + Zod | latest | 폼 처리 + 유효성 검증 |
| State | Zustand | latest | 클라이언트 상태 (읽음 배지 등) |
| Toast | Sonner | latest | 알림 토스트 |
| Package | pnpm | 9.x | 패키지 관리 |
| Deploy | Vercel | - | 호스팅 + Cron |

---

## 9. 폴더 구조 및 파일 컨벤션

```
p8-reframebot/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                       ← 시연용 시드 데이터
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← Root layout: 폰트, ThemeProvider, Toaster, SessionProvider
│   │   ├── page.tsx                  ← 랜딩 페이지
│   │   ├── login/
│   │   │   └── page.tsx              ← 로그인 (매직링크 + 시연 모드)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts          ← NextAuth.js 핸들러
│   │   │   └── cron/
│   │   │       ├── send-questions/
│   │   │       │   └── route.ts      ← 질문 발송 크론
│   │   │       └── expire-questions/
│   │   │           └── route.ts      ← 미응답 만료 크론
│   │   ├── (user)/                   ← 사용자 라우트 그룹
│   │   │   ├── layout.tsx            ← 사용자 레이아웃 (Header + 인증 가드)
│   │   │   ├── inbox/
│   │   │   │   ├── page.tsx          ← 메시지함 (Server Component)
│   │   │   │   ├── actions.ts        ← getMessages, markAsRead
│   │   │   │   ├── loading.tsx
│   │   │   │   └── [messageId]/
│   │   │   │       ├── page.tsx      ← 메시지 상세
│   │   │   │       └── actions.ts    ← getMessageDetail, submitResponse
│   │   │   ├── history/
│   │   │   │   ├── page.tsx          ← 히스토리
│   │   │   │   ├── actions.ts
│   │   │   │   └── loading.tsx
│   │   │   └── profile/
│   │   │       ├── page.tsx          ← 프로필
│   │   │       └── actions.ts
│   │   └── (admin)/                  ← 관리자 라우트 그룹
│   │       └── admin/
│   │           ├── layout.tsx        ← 관리자 레이아웃 (Sidebar + 권한 가드)
│   │           ├── page.tsx          ← 대시보드
│   │           ├── actions.ts        ← getDashboardStats
│   │           ├── cohorts/
│   │           │   ├── page.tsx
│   │           │   └── actions.ts
│   │           ├── questions/
│   │           │   ├── page.tsx
│   │           │   └── actions.ts
│   │           ├── rules/
│   │           │   ├── page.tsx
│   │           │   └── actions.ts
│   │           ├── templates/
│   │           │   ├── page.tsx
│   │           │   └── actions.ts
│   │           ├── review/
│   │           │   ├── page.tsx
│   │           │   └── actions.ts
│   │           └── datasets/
│   │               ├── page.tsx
│   │               └── actions.ts
│   ├── components/
│   │   ├── layout/                   ← Header, Footer, UserNav, AdminSidebar
│   │   ├── landing/                  ← Hero, FlowSteps, TechShowcase, StackBadges
│   │   ├── inbox/                    ← TodayQuestion, MessageList, MessageItem, ResponseForm
│   │   ├── history/                  ← Timeline, TimelineEntry
│   │   ├── admin/                    ← StatsCards, CohortTable, QuestionForm, RuleForm,
│   │   │                                TemplateForm, ReviewPanel, DatasetExport, RuleTestPanel
│   │   └── ui/                       ← shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── utils.ts                  ← cn() 유틸리티
│   │   ├── constants.ts              ← 카테고리 목록, 상태값, 감정 사전
│   │   ├── prisma.ts                 ← Prisma Client 싱글턴
│   │   ├── auth.ts                   ← NextAuth.js 설정
│   │   └── engine/
│   │       ├── matcher.ts            ← 규칙 매칭 엔진 (matchResponse)
│   │       ├── template.ts           ← 템플릿 변수 치환 (renderTemplate)
│   │       ├── sentiment.ts          ← 감정 사전 기반 분류
│   │       └── pipeline.ts           ← 전체 파이프라인 (processResponseAndGenerateReply)
│   └── types/
│       ├── index.ts                  ← 공통 타입 (ActionResult 등)
│       └── prisma.d.ts               ← Prisma 확장 타입
├── public/
│   └── og-image.png
├── vercel.json                       ← Cron 설정
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 10. 개발 일정 (5일)

| 일차 | 시간 | 작업 내용 |
|---|---|---|
| **Day 1** | 8h | 프로젝트 셋업 (Next.js + Prisma + Supabase + NextAuth.js), DB 마이그레이션, 시드 데이터, 인증 플로우 (매직링크 + 시연 모드), 랜딩 페이지 |
| **Day 2** | 8h | 사용자 핵심 기능: 메시지함 (페이지 + Server Actions), 메시지 상세 (질문 확인 + 응답 제출), 답장 확인 |
| **Day 3** | 8h | 규칙 엔진 구현 (matcher.ts + template.ts + pipeline.ts), 크론잡 질문 발송, 히스토리 페이지 |
| **Day 4** | 8h | 관리자 CMS: 대시보드, 기수/질문/규칙/템플릿 CRUD, 검수 큐, 데이터 내보내기 |
| **Day 5** | 8h | 반응형 디자인 마무리, 규칙 테스트 패널, 프로필, 통합 테스트, Vercel 배포, 시연 시나리오 검증 |

---

## 11. 완료 기준 (Definition of Done)

### 11.1 핵심 플로우 동작 확인

- [ ] 시연 모드 로그인 → 메시지함 진입
- [ ] 오늘의 질문 확인 → 응답 제출 (1일 1회 제한 동작)
- [ ] 응답 제출 → 규칙 매칭 → 자동 답장 생성 → 메시지함에 답장 노출
- [ ] 규칙 미매칭 응답 → 검수 큐에 노출
- [ ] 관리자 검수 큐에서 수동 답장 작성 → 사용자 메시지함에 노출
- [ ] 히스토리 페이지에서 질문→응답→답장 타임라인 확인

### 11.2 관리자 CMS 동작 확인

- [ ] 기수 생성 + 참여자 배정
- [ ] 질문 등록 + 즉시 발송
- [ ] 규칙 CRUD + 규칙 테스트 패널 동작
- [ ] 템플릿 CRUD + 변수 미리보기
- [ ] 데이터 내보내기 (CSV, JSON)

### 11.3 기술 시연 포인트

- [ ] 규칙 엔진: 키워드/패턴/감정 3가지 조건 타입 매칭 시연
- [ ] 데이터 파이프라인: datasets 테이블에 비정규화 데이터 저장 확인
- [ ] JSON 내보내기가 OpenAI Fine-tuning JSONL 형식과 호환 확인
- [ ] 반응형: PC + 모바일 웹 양쪽에서 정상 동작

### 11.4 빌드/배포

- [ ] `pnpm build` 에러 없음
- [ ] `pnpm lint` 경고 없음
- [ ] Vercel 배포 완료 + 크론잡 동작 확인
- [ ] Lighthouse 성능 80+ (전 항목)

### 11.5 환경 변수

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL 접속 URL (Pooled) |
| `DIRECT_URL` | Supabase PostgreSQL 직접 접속 URL (Migration용) |
| `NEXTAUTH_URL` | 사이트 기본 URL |
| `NEXTAUTH_SECRET` | NextAuth.js 세션 암호화 키 |
| `EMAIL_SERVER_*` | 매직링크 이메일 발송 SMTP 설정 |
| `CRON_SECRET` | 크론잡 인증 시크릿 |
| `DEMO_MODE` | `true` 시 시연 모드 로그인 활성화 |
| `NEXT_PUBLIC_SITE_URL` | OG 이미지, 메타데이터 기본 URL |
