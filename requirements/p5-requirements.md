# P5. AI 통합 콘텐츠 도구 "ContentAI"

> 요구사항 명세서 및 인프라 구성 가이드
> 위시켓 웹개발 포트폴리오 프로젝트 시리즈
> 버전 1.0 | 2025년 3월

---

## 목차

1. 프로젝트 개요
2. 사용자 유형 및 크레딧 모델
3. 페이지 구성 및 기능 요구사항
4. AI 기능 상세 명세
5. 크레딧 시스템 설계
6. 비기능 요구사항 (NFR)
7. 기술 스택 선정
8. 인프라 구성 및 배포
9. 폴더 구조 및 파일 컨벤션
10. Supabase 스키마 설계
11. AI 스트리밍 구현 전략
12. 개발 일정 (2주)
13. 완료 기준 (Definition of Done)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | ContentAI — AI 기반 콘텐츠 생성/분석 도구 |
| **목적** | 위시켓 AI 서비스 프로젝트(평균 ₩3,090만, 전년 대비 371% 성장) 수주를 위한 차별화 데모. OpenAI API 연동, 스트리밍 응답, 크레딧 시스템, 사용자 히스토리 등 B2B AI SaaS의 핵심 패턴 구현 |
| **기간** | Week 11~13 (14일) |
| **타겟 사용자** | (가상) 마케터, 콘텐츠 크리에이터, 소규모 사업자 |
| **핵심 성공 지표** | AI 스트리밍 응답, 크레딧 기반 사용량 관리, 생성 히스토리 저장/즐겨찾기, Toss Payments Pro 구독 |

### 1.1 배경

위시켓 2025년 AI 프로젝트 의뢰가 전년 대비 371% 증가하며, AIDP(AI Delivery Platform)를 출시하여 AI 프로젝트 중개를 본격화했다. AI 통합 경험은 현 시장에서 가장 강력한 차별화 요소이며, 백엔드 개발자가 API 연동, 스트리밍, 사용량 관리, 결제 통합을 구현하는 데 유리한 영역이다.

### 1.2 사이트맵

| URL 경로 | 페이지명 | 인증 | 역할 |
|---|---|---|---|
| `/` | 랜딩 페이지 | 불필요 | 제품 소개 + 데모 + 요금제 + CTA |
| `/pricing` | 요금제 | 불필요 | Free/Pro 비교 |
| `/auth/login` | 로그인 | 불필요 | 이메일 + 소셜 로그인 |
| `/auth/register` | 회원가입 | 불필요 | |
| `/app` | 앱 홈 (도구 선택) | 필요 | AI 도구 카드 목록 + 잔여 크레딧 |
| `/app/generate` | 콘텐츠 생성 | 필요 | 블로그, 마케팅 카피, 이메일 생성 |
| `/app/analyze` | 콘텐츠 분석 | 필요 | 요약, 키워드 추출, 톤 분석 |
| `/app/translate` | 번역 | 필요 | 한↔영 전문 번역 |
| `/app/history` | 생성 히스토리 | 필요 | 과거 생성 결과 목록 |
| `/app/favorites` | 즐겨찾기 | 필요 | 즐겨찾기한 결과 목록 |
| `/app/settings` | 설정 | 필요 | 프로필, 알림, 구독 관리 |
| `/app/billing` | 결제 | 필요 | Pro 구독 + 크레딧 충전 |

---

## 2. 사용자 유형 및 크레딧 모델

### 2.1 요금제

| 플랜 | 월 가격 | 일일 크레딧 | 월 크레딧 | 기능 |
|---|---|---|---|---|
| **Free** | ₩0 | 10회 | — | 기본 AI 도구 3개, 히스토리 30일 보관 |
| **Pro** | ₩19,900 | 무제한 | — | 전체 AI 도구, 히스토리 무제한, 우선 처리, 고급 모델 선택 |

### 2.2 크레딧 소모 규칙

| AI 기능 | 크레딧 소모 |
|---|---|
| 블로그 글 생성 | 3 크레딧 |
| 마케팅 카피 생성 | 2 크레딧 |
| 이메일 초안 생성 | 2 크레딧 |
| 텍스트 요약 | 1 크레딧 |
| 키워드 추출 | 1 크레딧 |
| 톤 분석 | 1 크레딧 |
| 번역 (500자 이하) | 1 크레딧 |
| 번역 (500자 초과) | 2 크레딧 |

### 2.3 크레딧 리셋

- Free 플랜: 매일 자정(KST) 10 크레딧으로 리셋 (누적 불가)
- Pro 플랜: 크레딧 무제한 (소모 추적은 하되 차단하지 않음)

---

## 3. 페이지 구성 및 기능 요구사항

### 3.1 랜딩 페이지 (/)

**Hero**

- 제품 포지셔닝 문구: "AI로 콘텐츠를 더 빠르게, 더 좋게"
- 부제: 기능 요약 1~2줄
- CTA: "무료로 시작하기" + "데모 보기"
- Hero 이미지/애니메이션: AI 생성 인터페이스 목업

**인터랙티브 데모 섹션**

- 입력 예시 → AI 생성 결과를 실시간 타이핑 효과로 시연 (실제 API 호출 아닌 사전 생성 텍스트)
- 도구 탭 전환: 블로그 / 마케팅 / 요약

**기능 소개**

- 3개 핵심 도구 카드: 콘텐츠 생성, 콘텐츠 분석, 번역
- 각 카드: 아이콘 + 제목 + 설명 + 스크린샷

**요금제 미리보기**

- Free/Pro 2컬럼 비교

**CTA 배너**

### 3.2 앱 홈 (/app)

- 상단: 환영 메시지 + 잔여 크레딧 표시 (Free) 또는 Pro 배지
- AI 도구 카드 그리드 (3개):
  - 콘텐츠 생성: 아이콘 + "블로그, 마케팅, 이메일 자동 생성"
  - 콘텐츠 분석: 아이콘 + "요약, 키워드, 톤 분석"
  - 번역: 아이콘 + "한↔영 전문 번역"
- 최근 생성 기록 5개 (빠른 접근)
- 사이드바: 도구 목록, 히스토리, 즐겨찾기, 설정

### 3.3 콘텐츠 생성 (/app/generate)

**도구 유형 선택 탭**

- 블로그 글 / 마케팅 카피 / 이메일 초안

**블로그 글 생성**

- 입력: 주제 (필수), 키워드 (선택, 최대 5개), 톤 선택 (전문적/친근한/설득적), 길이 (짧은/중간/긴)
- 생성 버튼 → AI 스트리밍 응답 (타이핑 효과)
- 결과: Markdown 렌더링 + 복사 버튼 + 즐겨찾기 버튼 + 재생성 버튼
- 하단: 사용된 크레딧 표시

**마케팅 카피 생성**

- 입력: 제품/서비스명 (필수), 타겟 고객 (선택), 채널 (SNS/이메일/광고/웹사이트), 핵심 메시지 (선택)
- 결과: 3~5개 카피 변형 생성 → 각각 복사/즐겨찾기 가능

**이메일 초안 생성**

- 입력: 목적 (비즈니스 제안/팔로업/감사/공지), 수신자 관계 (상사/동료/고객/파트너), 핵심 내용 (필수)
- 결과: 이메일 제목 + 본문

### 3.4 콘텐츠 분석 (/app/analyze)

**도구 유형 선택 탭**

- 텍스트 요약 / 키워드 추출 / 톤 분석

**텍스트 요약**

- 입력: 텍스트 붙여넣기 (최대 5,000자) 또는 URL 입력
- 요약 길이: 1줄 / 3줄 / 단락
- 결과: 요약문 + 원문 대비 압축률 표시

**키워드 추출**

- 입력: 텍스트 붙여넣기
- 결과: 키워드 목록 (빈도순) + 관련도 점수 + 태그 클라우드 시각화

**톤 분석**

- 입력: 텍스트 붙여넣기
- 결과: 톤 분류 (전문적/친근/격식/캐주얼) + 감정 분석 (긍정/중립/부정) + 개선 제안

### 3.5 번역 (/app/translate)

- 소스 언어 / 타겟 언어 전환 (한국어 ↔ 영어)
- 입력: 텍스트 (최대 3,000자)
- 톤 옵션: 격식체 / 비격식체
- 결과: 번역문 + 복사 버튼
- 스트리밍으로 결과 표시

### 3.6 히스토리 (/app/history)

- 생성 기록 목록: 도구 유형 배지, 입력 요약, 결과 미리보기 (1줄), 생성일, 크레딧 소모
- 필터: 도구 유형별, 날짜 범위
- 정렬: 최신순 / 오래된순
- 클릭 시 상세 보기 (전체 입력 + 결과)
- 삭제 가능
- Free 플랜: 30일 보관 후 자동 삭제 표시

### 3.7 즐겨찾기 (/app/favorites)

- 즐겨찾기한 결과 목록 (히스토리와 유사 UI)
- 즐겨찾기 해제
- 무제한 보관 (플랜 무관)

### 3.8 설정 (/app/settings)

- 프로필: 이름, 이메일 (읽기 전용), 아바타
- 기본 설정: 기본 톤, 기본 언어 페어
- 알림: 크레딧 부족 알림 ON/OFF
- 구독: 현재 플랜 + 업그레이드/다운그레이드 링크

### 3.9 결제 (/app/billing)

- 현재 구독: 플랜, 다음 결제일, 금액
- Pro 업그레이드: Toss Payments 결제 플로우 (P4와 동일 패턴)
- 결제 내역
- 구독 취소

### 3.10 공통 컴포넌트

**앱 사이드바**

- 로고
- 도구 목록: 콘텐츠 생성, 콘텐츠 분석, 번역
- 히스토리, 즐겨찾기
- 설정, 결제
- 하단: 크레딧 잔여량 바 (Free) 또는 Pro 배지 + 로그아웃

**Header (랜딩)**

- 로고 + 기능, 요금제 링크 + 로그인 / 시작하기 CTA

---

## 4. AI 기능 상세 명세

### 4.1 사용 모델

| 용도 | 모델 | 선정 사유 |
|---|---|---|
| 기본 (Free) | gpt-4o-mini | 빠르고 저렴. 약 $0.15/100만 토큰 |
| 고급 (Pro 선택 가능) | gpt-4o | 높은 품질. Pro 사용자 옵션 |

### 4.2 시스템 프롬프트

| AI 도구 | 시스템 프롬프트 핵심 |
|---|---|
| 블로그 생성 | "한국어 SEO 최적화 블로그 작가. 서론-본론-결론 구조, H2/H3 소제목 포함" |
| 마케팅 카피 | "한국어 마케팅 카피라이터. 설득력 있는 문구, A/B 테스트용 변형 3~5개" |
| 이메일 | "비즈니스 이메일 작성 전문가. 한국어 존칭 및 격식 준수" |
| 요약 | "텍스트 분석 전문가. 핵심 내용 간결하게 요약" |
| 키워드 | "SEO 분석가. JSON 형식으로 키워드+빈도+관련도 반환" |
| 톤 분석 | "언어 분석가. 톤, 감정, 개선점을 JSON 형식으로 반환" |
| 번역 | "한↔영 전문 번역가. 자연스러운 현지화, 문맥에 맞는 어조 유지" |

### 4.3 입력 검증

| 항목 | 제한 |
|---|---|
| 텍스트 입력 최대 | 5,000자 (생성), 5,000자 (분석), 3,000자 (번역) |
| 키워드 | 최대 5개, 각 20자 이내 |
| 요청 빈도 | 분당 10회 (서버 사이드 rate limit) |

### 4.4 에러 처리

| 상황 | 처리 |
|---|---|
| 크레딧 부족 | "크레딧이 부족합니다. 내일 리셋되거나 Pro로 업그레이드하세요" + 업그레이드 CTA |
| API 오류 | "일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요" + 크레딧 미차감 |
| Rate limit | "요청이 너무 많습니다. 잠시 후 다시 시도해주세요" |
| 입력 초과 | 실시간 글자 수 카운터로 사전 방지 |

---

## 5. 크레딧 시스템 설계

### 5.1 크레딧 검증 플로우

1. 클라이언트: AI 생성 요청
2. 서버 (API Route): 사용자 인증 확인
3. 서버: 현재 크레딧 조회 (profiles 테이블)
4. 서버: 요청 도구 유형에 따른 필요 크레딧 확인
5. 크레딧 충분 → AI 생성 실행 → 크레딧 차감 → 히스토리 저장 → 스트리밍 응답
6. 크레딧 부족 → 429 응답 + 크레딧 부족 메시지

### 5.2 크레딧 차감 타이밍

- AI 응답 생성 **시작 시** 차감 (스트리밍 중단되더라도 차감)
- API 오류 시 크레딧 **복구** (Supabase RPC 트랜잭션)

### 5.3 크레딧 리셋

- Supabase Edge Function 또는 pg_cron으로 매일 자정(KST) Free 사용자 크레딧 리셋
- 데모 환경에서는 수동 리셋 버튼 (설정 페이지) 또는 클라이언트에서 시뮬레이션

---

## 6. 비기능 요구사항 (NFR)

| 항목 | 목표 | 측정/검증 방법 |
|---|---|---|
| **Lighthouse 성능** | 90점 이상 (랜딩) | Chrome DevTools Lighthouse |
| **반응형** | 360px ~ 1920px | 앱 페이지 포함 전 구간 |
| **AI 응답 시작** | 2초 이내 (첫 토큰) | 네트워크 탭에서 TTFB 측정 |
| **스트리밍** | 끊김 없는 타이핑 효과 | Vercel AI SDK 스트리밍 |
| **크레딧 정확성** | 차감/리셋 오차 없음 | 생성 → 크레딧 확인 → 10회 소진 확인 |
| **히스토리 보관** | Free 30일, Pro 무제한 | 보관 기간 만료 표시 |
| **다크 모드** | OS 설정 연동 + 수동 토글 | 전 프로젝트 공통 |
| **Rate limit** | 분당 10회 | 연속 요청 시 429 반환 |

---

## 7. 기술 스택 선정

| 영역 | 기술 | 선정 사유 |
|---|---|---|
| **프레임워크** | Next.js 14+ (App Router) | 전 프로젝트 공통 |
| **언어** | TypeScript | 전 프로젝트 공통 |
| **스타일링** | Tailwind CSS | 전 프로젝트 공통 |
| **UI 컴포넌트** | shadcn/ui + Lucide React | 전 프로젝트 공통 |
| **DB / 백엔드** | Supabase (PostgreSQL) | Auth, RLS, Storage |
| **AI** | OpenAI API (gpt-4o-mini / gpt-4o) | 가장 범용적인 LLM API |
| **AI SDK** | Vercel AI SDK (`ai` + `@ai-sdk/openai`) | Next.js와 완벽 통합. 스트리밍 추상화 |
| **결제** | Toss Payments | P4와 동일 패턴 재활용 |
| **상태 관리** | Zustand | 크레딧 카운트, 생성 상태 |
| **배포** | Vercel | 전 프로젝트 공통 |

### 7.1 P4와 달라진 점

| 항목 | P4 | P5 |
|---|---|---|
| 핵심 기능 | 칸반보드 + 멀티 테넌트 | AI 생성/분석 + 스트리밍 |
| AI | 없음 | OpenAI API + Vercel AI SDK |
| 과금 모델 | 워크스페이스 구독 | 크레딧 기반 사용량 관리 |
| 실시간 | 보드 동기화 | 스트리밍 응답 (SSE) |
| 데이터 | 멀티 테넌트 (workspace_id) | 개인 사용자 (user_id) |

---

## 8. 인프라 구성 및 배포

### 8.1 인프라 구성도

| 구성 요소 | 설명 |
|---|---|
| **소스 코드 저장소** | GitHub (Public Repository) |
| **빌드 & 배포** | Vercel |
| **CDN** | Vercel Edge Network |
| **DB** | Supabase PostgreSQL (P4와 프로젝트 공유) |
| **인증** | Supabase Auth (이메일 + 소셜) |
| **파일 저장** | Supabase Storage (avatars) |
| **AI API** | OpenAI API (gpt-4o-mini 기본) |
| **AI 스트리밍** | Vercel AI SDK (Server → Client SSE 스트리밍) |
| **결제** | Toss Payments (테스트 모드) |
| **도메인** | contentai-demo.vercel.app (무료) |

### 8.2 환경변수

| 변수명 | 용도 | 설정 위치 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Vercel + .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | Vercel + .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 키 | Vercel |
| `OPENAI_API_KEY` | OpenAI API 키 | Vercel |
| `TOSS_CLIENT_KEY` | Toss 클라이언트 키 (테스트) | Vercel + .env.local |
| `TOSS_SECRET_KEY` | Toss 시크릿 키 (테스트) | Vercel |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL | Vercel |

### 8.3 비용

| 항목 | 요금제 | 월 비용 | 비고 |
|---|---|---|---|
| Vercel 호스팅 | Hobby (Free) | $0 | |
| Supabase | Free | $0 | P4와 프로젝트 공유 |
| OpenAI API | Pay-as-you-go | ~$5 | gpt-4o-mini 기준. 데모 사용량 |
| Toss Payments | 테스트 모드 | $0 | |
| **총합** | | **~$5/월** | OpenAI API만 유료 |

---

## 9. 폴더 구조 및 파일 컨벤션

| 경로 | 역할 |
|---|---|
| `src/app/(marketing)/` | 랜딩, 요금제 (비인증) |
| `src/app/(auth)/auth/` | 로그인, 회원가입 |
| `src/app/(app)/app/` | 앱 메인 (인증 필요) |
| `src/app/(app)/app/layout.tsx` | 앱 레이아웃 (사이드바 + 크레딧 표시) |
| `src/app/(app)/app/generate/page.tsx` | 콘텐츠 생성 |
| `src/app/(app)/app/analyze/page.tsx` | 콘텐츠 분석 |
| `src/app/(app)/app/translate/page.tsx` | 번역 |
| `src/app/(app)/app/history/page.tsx` | 히스토리 |
| `src/app/(app)/app/favorites/page.tsx` | 즐겨찾기 |
| `src/app/(app)/app/settings/page.tsx` | 설정 |
| `src/app/(app)/app/billing/page.tsx` | 결제 |
| `src/app/api/generate/route.ts` | AI 생성 API (스트리밍) |
| `src/app/api/analyze/route.ts` | AI 분석 API (스트리밍) |
| `src/app/api/translate/route.ts` | AI 번역 API (스트리밍) |
| `src/app/api/credits/route.ts` | 크레딧 조회/리셋 API |
| `src/app/api/payments/` | 결제 API Routes |
| `src/components/ai/` | AIGenerator, AIAnalyzer, AITranslator, StreamingOutput |
| `src/components/history/` | HistoryList, HistoryItem, HistoryDetail |
| `src/components/credits/` | CreditBar, CreditAlert, UpgradePrompt |
| `src/components/billing/` | PricingTable, SubscriptionStatus |
| `src/components/ui/` | shadcn/ui 컴포넌트 |
| `src/hooks/` | useCredits, useAIGenerate |
| `src/stores/` | credits.ts (크레딧 상태), generation.ts (생성 상태) |
| `src/lib/supabase/` | client.ts, server.ts, middleware.ts |
| `src/lib/ai/` | prompts.ts (시스템 프롬프트), config.ts (모델 설정) |
| `src/types/` | database.ts, ai.ts (AI 관련 타입) |

---

## 10. Supabase 스키마 설계

### 10.1 테이블 목록

| 테이블 | 역할 | RLS 핵심 조건 |
|---|---|---|
| `profiles` | 사용자 프로필 + 크레딧 | 본인만 읽기/수정 |
| `generation_history` | AI 생성 기록 | 본인만 |
| `favorites` | 즐겨찾기 | 본인만 |
| `subscriptions` | 구독 정보 | 본인만 |

### 10.2 profiles 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, FK→auth.users | |
| `name` | TEXT | | 표시 이름 |
| `avatar_url` | TEXT | | 아바타 |
| `plan` | TEXT | DEFAULT 'free' | 'free' / 'pro' |
| `credits` | INT | DEFAULT 10 | 잔여 크레딧 (Free) |
| `credits_reset_at` | TIMESTAMPTZ | | 마지막 크레딧 리셋 시각 |
| `default_tone` | TEXT | DEFAULT 'professional' | 기본 톤 설정 |
| `total_generations` | INT | DEFAULT 0 | 누적 생성 횟수 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 10.3 generation_history 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `user_id` | UUID | FK→profiles, NOT NULL | |
| `tool_type` | TEXT | NOT NULL | 'blog' / 'marketing' / 'email' / 'summary' / 'keywords' / 'tone' / 'translate' |
| `input_params` | JSONB | NOT NULL | 입력 파라미터 전체 (주제, 톤, 길이 등) |
| `input_text` | TEXT | | 원문 텍스트 (분석/번역용) |
| `output_text` | TEXT | NOT NULL | 생성 결과 |
| `model_used` | TEXT | NOT NULL | 사용된 모델 (gpt-4o-mini 등) |
| `credits_used` | INT | NOT NULL | 소모된 크레딧 |
| `tokens_used` | INT | | 사용된 토큰 수 |
| `is_favorite` | BOOLEAN | DEFAULT false | 즐겨찾기 여부 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `expires_at` | TIMESTAMPTZ | | Free 플랜 만료일 (생성일 + 30일) |

### 10.4 subscriptions 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `user_id` | UUID | FK→profiles, UNIQUE | |
| `toss_customer_key` | TEXT | | |
| `toss_billing_key` | TEXT | | |
| `plan` | TEXT | NOT NULL | 'pro' |
| `status` | TEXT | DEFAULT 'active' | 'active' / 'canceled' / 'past_due' |
| `current_period_end` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 10.5 DB 함수 (RPC)

| 함수명 | 용도 |
|---|---|
| `check_and_decrement_credits(user_id, amount)` | 크레딧 확인 + 차감 (원자적 트랜잭션). 부족 시 에러 |
| `restore_credits(user_id, amount)` | API 오류 시 크레딧 복구 |
| `reset_daily_credits()` | Free 사용자 일일 크레딧 리셋 (pg_cron 또는 Edge Function) |
| `cleanup_expired_history()` | Free 사용자 30일 지난 히스토리 삭제 |

### 10.6 인덱스

| 인덱스 | 대상 | 용도 |
|---|---|---|
| `history_user_idx` | generation_history(user_id, created_at DESC) | 사용자별 히스토리 |
| `history_favorite_idx` | generation_history(user_id, is_favorite) WHERE is_favorite = true | 즐겨찾기 조회 |
| `history_tool_idx` | generation_history(user_id, tool_type) | 도구별 필터 |

---

## 11. AI 스트리밍 구현 전략

### 11.1 Vercel AI SDK 활용

- `streamText()`: 서버에서 OpenAI API 호출 → SSE 스트리밍 응답 생성
- `useCompletion()` 또는 `useChat()`: 클라이언트에서 스트리밍 수신 + 상태 관리
- 자동 타이핑 효과: SDK가 토큰 단위로 텍스트를 점진적으로 업데이트

### 11.2 API Route 패턴

```
POST /api/generate
  ↓ 인증 확인 (Supabase Auth)
  ↓ 크레딧 확인 + 차감 (RPC)
  ↓ 시스템 프롬프트 + 사용자 입력 조합
  ↓ streamText() → OpenAI API 호출
  ↓ SSE 스트리밍 응답 반환
  ↓ (스트리밍 완료 후) 히스토리 저장
```

### 11.3 스트리밍 완료 후 처리

- `onFinish` 콜백에서 전체 텍스트 확보 → generation_history 테이블에 저장
- 토큰 사용량 기록
- 에러 발생 시 크레딧 복구

### 11.4 분석 도구 (키워드, 톤) 응답 형식

- 키워드 추출, 톤 분석은 JSON 형식 응답 필요
- 시스템 프롬프트에서 JSON 출력 지시
- 스트리밍 완료 후 JSON 파싱 → 구조화된 UI 렌더링
- 파싱 실패 시 원문 텍스트 표시 + 재시도 안내

---

## 12. 개발 일정 (2주)

### Week 1: 인프라 + AI 코어

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 1** | 프로젝트 초기화, Supabase 스키마 실행, OpenAI API 키 설정, Vercel 최초 배포 | DB + API 키 연결 확인 |
| **Day 2** | 랜딩 페이지 + 요금제 페이지 | 마케팅 페이지 완성 |
| **Day 3** | 인증 (로그인/회원가입) + 앱 레이아웃 (사이드바 + 크레딧 표시) | 로그인 → 앱 홈 + 크레딧 10 표시 |
| **Day 4** | 콘텐츠 생성 — 블로그 글 (스트리밍 응답) | 주제 입력 → AI 스트리밍 결과 표시 |
| **Day 5** | 콘텐츠 생성 — 마케팅 카피 + 이메일 초안 | 3개 생성 도구 모두 작동 |

### Week 2: 분석 + 크레딧 + 폴리싱

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 6** | 콘텐츠 분석 (요약, 키워드, 톤) | 3개 분석 도구 작동 |
| **Day 7** | 번역 도구 + 크레딧 시스템 (차감 + 부족 처리) | 번역 + 크레딧 10회 소진 시 차단 |
| **Day 8** | 히스토리 + 즐겨찾기 | 생성 결과 저장 → 히스토리 목록 → 즐겨찾기 |
| **Day 9** | Toss Payments Pro 구독 + 크레딧 무제한 전환 | 결제 → Pro 전환 → 무제한 확인 |
| **Day 10** | 설정 + Rate limit + 에러 처리 | 설정 페이지 + 분당 10회 제한 |
| **Day 11~12** | 반응형 QA, 다크모드 QA, 랜딩 데모 섹션 | 전 구간 반응형 + 랜딩 인터랙티브 데모 |
| **Day 13~14** | Lighthouse 최적화, 스크린샷, README | Lighthouse 90+ (랜딩) |

---

## 13. 완료 기준 (Definition of Done)

### 필수 완료 조건

1. Vercel에 배포되어 공개 URL에서 접근 가능
2. GitHub Public Repository에 소스 코드 공개 + README
3. AI 콘텐츠 생성 3종 (블로그, 마케팅, 이메일) 스트리밍 응답 정상
4. AI 콘텐츠 분석 3종 (요약, 키워드, 톤) 정상 작동
5. AI 번역 (한↔영) 스트리밍 정상
6. 크레딧 시스템: Free 10회/일 차감 + 부족 시 차단 + 결과 표시
7. 생성 히스토리 저장 + 목록 조회 정상
8. 즐겨찾기 추가/해제 정상
9. Toss Payments Pro 구독 플로우 정상 (테스트 환경)
10. 랜딩 페이지 Lighthouse 90점 이상

### 권장 완료 조건

- 랜딩 인터랙티브 데모 (사전 생성 텍스트 타이핑 효과)
- Rate limit (분당 10회) 적용
- 히스토리 도구 유형별 필터
- Free 30일 히스토리 만료 표시
- 다크/라이트 모드 전환
- P1 포트폴리오 사이트에 케이스 스터디 작성
- 디바이스 목업 스크린샷 (데스크톱 + 모바일 각 3~5장)
- 30~60초 데모 영상 (AI 스트리밍 + 크레딧 소진 + Pro 업그레이드)
