# P7. n8n 고객 문의 자동화 시스템

> 요구사항 명세서 및 인프라 구성 가이드
> 위시켓 웹개발 포트폴리오 프로젝트 시리즈
> 버전 1.0 | 2026년 3월

---

## 목차

1. 프로젝트 개요
2. 시스템 아키텍처
3. n8n 워크플로우 설계
4. 페이지 구성 및 기능 요구사항
5. 비기능 요구사항 (NFR)
6. 기술 스택 선정
7. 인프라 구성 및 배포
8. 폴더 구조 및 파일 컨벤션
9. Google Sheets 데이터 스키마
10. 개발 일정 (3일)
11. 완료 기준 (Definition of Done)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | n8n 고객 문의 자동화 시스템 (위시켓 포트폴리오용) |
| **목적** | n8n을 직접 구축하고 실무 자동화 워크플로우를 설계할 수 있는 역량을 시연한다. 고객 문의 접수 → AI 분류 → 멀티채널 알림 → 데이터 저장 → 자동 응답의 전체 파이프라인을 구현한다. |
| **기간** | 3일 (~23시간) |
| **타겟 사용자** | 위시켓 클라이언트 (업무 자동화 니즈가 있는 스타트업, 중소기업), n8n 도입을 검토하는 기업 |
| **핵심 성공 지표** | n8n 워크플로우 3개 정상 동작, 문의 폼 → 워크플로우 트리거 → Slack 알림 + Google Sheets 저장 + 자동 응답 이메일 전송 확인 |

### 1.1 배경

한국 스타트업과 중소기업에서 고객 문의를 슬랙·이메일·스프레드시트로 수동 처리하는 경우가 많다. n8n 같은 워크플로우 자동화 도구를 도입하면 문의 접수부터 분류, 알림, 기록까지 전 과정을 자동화할 수 있다. 이 프로젝트는 n8n을 Docker로 직접 구축하고, 실무에서 바로 적용 가능한 3가지 자동화 워크플로우를 설계·구현하여 **"이 개발자에게 자동화를 맡기면 되겠다"** 는 확신을 주는 포트폴리오 데모다.

### 1.2 프로젝트 구성 요소

이 프로젝트는 두 개의 독립된 서비스로 구성된다:

| 구성 요소 | 역할 | 배포 위치 |
|---|---|---|
| **n8n 인스턴스** | 워크플로우 엔진 (웹훅 수신, AI 분류, 알림, 데이터 저장) | Render (Docker) |
| **Next.js 프론트엔드** | 문의 접수 폼 + 처리 현황 대시보드 + 프로젝트 소개 | Vercel |

**핵심은 n8n 워크플로우 자체**이며, Next.js는 문의 진입점과 시연 UI를 제공하는 가벼운 프론트엔드다.

### 1.3 사이트맵

| URL 경로 | 페이지명 | 역할 |
|---|---|---|
| `/` | 랜딩 페이지 | 프로젝트 소개 + 워크플로우 설명 + 문의하기 CTA |
| `/inquiry` | 문의 접수 | 문의 폼 (이름, 이메일, 카테고리, 메시지) |
| `/inquiry/status/[ticketId]` | 상태 조회 | 문의 처리 상태 타임라인 |
| `/dashboard` | 문의 현황 | 통계 카드 + 최근 문의 테이블 (읽기 전용, 시연용) |

---

## 2. 시스템 아키텍처

### 2.1 전체 흐름도

```
┌──────────────────┐     POST /api/inquiry      ┌──────────────────┐
│   Next.js App    │ ──────────────────────────▶ │  Next.js API     │
│   (Vercel)       │                             │  Route Handler   │
│                  │ ◀────── ticketId ────────── │  (프록시)         │
└──────────────────┘                             └────────┬─────────┘
                                                          │
                                                 POST /webhook/inquiry
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│  n8n 인스턴스 (Render / Docker)                                      │
│                                                                     │
│  ┌─────────────┐   ┌──────────┐   ┌────────────┐   ┌────────────┐ │
│  │  Webhook     │──▶│  OpenAI  │──▶│  Switch     │──▶│  Slack     │ │
│  │  트리거      │   │  AI 분류  │   │  카테고리별  │   │  채널 알림  │ │
│  └─────────────┘   └──────────┘   │  분기       │   └────────────┘ │
│                                    └──────┬─────┘                   │
│                                           │                         │
│                              ┌────────────┼────────────┐            │
│                              ▼            ▼            ▼            │
│                       ┌───────────┐ ┌──────────┐ ┌──────────────┐  │
│                       │ Google    │ │ Resend   │ │ Respond to   │  │
│                       │ Sheets    │ │ 자동응답  │ │ Webhook      │  │
│                       │ 로그 저장  │ │ 이메일    │ │ (ticketId)   │  │
│                       └───────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 데이터 흐름

1. 사용자가 Next.js 문의 폼 제출
2. Next.js API Route가 n8n 웹훅 URL로 데이터 프록시 (n8n URL 클라이언트 미노출)
3. n8n 워크플로우 A 실행:
   - OpenAI로 문의 카테고리/긴급도 자동 분류
   - 카테고리별 Slack 채널에 알림
   - Google Sheets에 문의 로그 저장
   - Resend로 고객에게 자동 접수 확인 이메일
   - ticketId 생성 후 Webhook 응답으로 반환
4. Next.js가 ticketId를 받아 상태 조회 페이지로 리다이렉트
5. 상태 조회 페이지에서 Google Sheets의 해당 문의 상태를 직접 읽어 표시

---

## 3. n8n 워크플로우 설계

### 3.1 워크플로우 A: 고객 문의 자동 처리 (메인)

**트리거**: Webhook (`POST /webhook/inquiry`)

**입력 데이터**:
```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "category": "기술문의",
  "message": "API 연동 관련 문의드립니다...",
  "timestamp": "2026-03-26T10:30:00+09:00"
}
```

**노드 흐름**:

| # | 노드 | 타입 | 설명 |
|---|---|---|---|
| 1 | Webhook | Trigger | `POST /webhook/inquiry` 수신 |
| 2 | Set: 데이터 정리 | Set | ticketId 생성 (`TK-{timestamp}-{random}`), 기본값 설정 |
| 3 | IF: 유효성 검증 | IF | 이름, 이메일, 메시지 필수 필드 확인 |
| 4 | OpenAI: AI 분류 | OpenAI | 문의 내용으로 카테고리(기술문의/견적요청/일반문의) + 긴급도(높음/보통/낮음) JSON 반환 |
| 5 | Switch: 카테고리별 분기 | Switch | AI 분류 결과에 따라 3개 분기 |
| 6a | Slack: #tech-support | Slack | 기술문의 → 기술지원 채널 알림 |
| 6b | Slack: #sales + Email | Slack + Resend | 견적요청 → 영업 채널 + 영업팀 이메일 |
| 6c | Slack: #general | Slack | 일반문의 → 일반 채널 알림 |
| 7 | Google Sheets: 로그 저장 | Google Sheets | "Inquiries" 시트에 문의 데이터 + AI 분류 결과 추가 |
| 8 | Resend: 접수 확인 이메일 | HTTP Request | 고객에게 자동 접수 확인 이메일 발송 |
| 9 | Respond to Webhook | Respond | `{ success: true, ticketId: "TK-..." }` 반환 |

**OpenAI 프롬프트 (노드 4)**:
```
다음 고객 문의를 분석하여 JSON으로 응답해주세요.

문의 내용: {{$json.message}}

응답 형식:
{
  "category": "기술문의" | "견적요청" | "일반문의",
  "urgency": "높음" | "보통" | "낮음",
  "summary": "한 줄 요약"
}
```

**Slack 메시지 포맷 (노드 6)**:
```
📩 새 고객 문의 접수

• 티켓: {{ticketId}}
• 이름: {{name}}
• 카테고리: {{ai_category}}
• 긴급도: {{ai_urgency}}
• 요약: {{ai_summary}}

원문: {{message}}
```

### 3.2 워크플로우 B: 일일 문의 요약 리포트

**트리거**: Schedule (매일 09:00 KST) + Webhook (`POST /webhook/daily-report`, 수동 트리거용)

**노드 흐름**:

| # | 노드 | 타입 | 설명 |
|---|---|---|---|
| 1 | Schedule / Webhook | Trigger | 매일 09:00 또는 수동 트리거 |
| 2 | Google Sheets: 읽기 | Google Sheets | "Inquiries" 시트에서 전일 문의 데이터 조회 |
| 3 | Function: 통계 집계 | Function | 카테고리별 건수, 긴급도별 건수, 미응답 건수, 평균 처리 상태 집계 |
| 4 | HTML: 리포트 생성 | HTML | 통계 데이터를 HTML 테이블 + 요약으로 변환 |
| 5 | Resend: 리포트 이메일 | HTTP Request | 관리자에게 일일 리포트 HTML 이메일 발송 |
| 6 | Slack: 리포트 포스팅 | Slack | #daily-report 채널에 요약 메시지 + 주요 수치 |

**리포트 내용**:
- 전일 접수 건수 (카테고리별)
- 긴급 문의 건수
- 미응답 문의 건수
- 카테고리별 비율 차트 (텍스트 기반)

### 3.3 워크플로우 C: 미응답 문의 에스컬레이션

**트리거**: Schedule (매 2시간)

**노드 흐름**:

| # | 노드 | 타입 | 설명 |
|---|---|---|---|
| 1 | Schedule | Trigger | 매 2시간 실행 |
| 2 | Google Sheets: 조회 | Google Sheets | status='접수됨' AND 24시간 경과된 문의 필터 |
| 3 | IF: 미응답 건 존재 | IF | 결과 행이 0보다 큰지 확인 |
| 4 | Slack: 긴급 알림 | Slack | @channel 멘션으로 미응답 문의 목록 전송 |
| 5 | Google Sheets: 상태 변경 | Google Sheets | status를 '에스컬레이션'으로 업데이트 |

### 3.4 워크플로우 파일 관리

각 워크플로우를 n8n에서 JSON으로 export하여 `workflows/` 디렉토리에 버전 관리:
- `workflows/inquiry-automation.json` — 워크플로우 A
- `workflows/daily-report.json` — 워크플로우 B
- `workflows/escalation-alert.json` — 워크플로우 C

**주의**: export된 JSON에는 credential 이름/ID만 포함되며 민감 데이터(API 키, 토큰)는 포함되지 않음. 대상 환경에서 같은 이름의 credential을 먼저 설정해야 import 후 정상 동작.

### 3.5 n8n 필수 Credential 설정

| Credential 이름 | 타입 | 용도 |
|---|---|---|
| `OpenAI API` | OpenAI | 문의 AI 분류 (워크플로우 A) |
| `Slack OAuth` | Slack | 채널 알림 (워크플로우 A, B, C) |
| `Google Sheets Service Account` | Google Sheets | 문의 로그 저장/조회 (워크플로우 A, B, C) |
| `Resend API` | HTTP Header Auth | 자동 응답 이메일 (워크플로우 A, B) |

---

## 4. 페이지 구성 및 기능 요구사항

> Next.js 프론트엔드는 n8n 시연을 위한 가벼운 UI다. 복잡한 기능보다 깔끔한 UX에 집중.

### 4.1 랜딩 페이지 (/)

**히어로 섹션**

- 제목: "n8n 기반 고객 문의 자동화 시스템"
- 부제: 문의 접수 → AI 분류 → 알림 → 기록을 한 번에 자동화
- "문의하기" CTA 버튼 → `/inquiry`
- "현황 보기" 버튼 → `/dashboard`

**워크플로우 소개 섹션**

- 3개 카드: 각 워크플로우(A, B, C)의 이름, 설명, 주요 노드 아이콘
- 시각적 흐름 표현 (Lucide 아이콘 + 화살표)

**기술 스택 섹션**

- 사용된 기술 뱃지 (n8n, Next.js, OpenAI, Slack, Google Sheets, Resend, Docker)

### 4.2 문의 접수 (/inquiry)

**문의 폼**

- 필드: 이름(Input), 이메일(Input), 카테고리(Select: 기술문의/견적요청/일반문의), 메시지(Textarea)
- 폼 검증: 이름 필수, 이메일 형식 확인, 메시지 10자 이상
- 제출 버튼: 로딩 상태 표시 (spinner)
- Server Action으로 `/api/inquiry` 호출 → n8n 웹훅 프록시
- 성공 시: ticketId와 함께 `/inquiry/status/[ticketId]`로 리다이렉트
- 실패 시: Sonner 토스트로 에러 메시지

### 4.3 상태 조회 (/inquiry/status/[ticketId])

**상태 타임라인**

- ticketId로 Google Sheets에서 해당 문의 조회 (Server Action)
- 상태 단계 시각화: 접수됨 → 분류완료 → 처리중 → 완료
- 각 단계별 타임스탬프 표시
- 문의 상세 정보: 이름, 카테고리, AI 분류 결과, 메시지
- 수동 새로고침 버튼

### 4.4 문의 현황 대시보드 (/dashboard)

**읽기 전용** — 포트폴리오 시연 시 데이터가 어떻게 관리되는지 보여주는 용도

**통계 카드 4개**

- 오늘 접수 건수
- 처리완료 건수
- 미응답 건수
- 평균 처리 시간 (접수 → 완료)

**최근 문의 테이블**

- 컬럼: 티켓ID, 이름, 카테고리, 긴급도, 상태, 접수일시
- 최근 20건 표시
- 상태별 Badge 색상: 접수됨(파랑), 분류완료(노랑), 처리중(주황), 완료(초록), 에스컬레이션(빨강)
- Google Sheets에서 직접 읽기 (Server Action + `googleapis`)

### 4.5 공통 컴포넌트

**Header**

- 로고 + 프로젝트명
- 네비게이션: 홈, 문의하기, 현황
- 모바일: 햄버거 메뉴 (Sheet 컴포넌트)

**Footer**

- GitHub 링크, 기술 스택, "Powered by n8n" 텍스트

---

## 5. 비기능 요구사항 (NFR)

| 항목 | 목표 | 측정/검증 방법 |
|---|---|---|
| **빌드 성공** | `pnpm build` 에러 없이 완료 | CI/Vercel 빌드 로그 확인 |
| **웹훅 응답 속도** | 문의 폼 제출 → ticketId 반환 < 5초 | n8n 웹훅 응답 시간 측정 (AI 분류 포함) |
| **반응형** | 360px ~ 1920px 대응 | Chrome DevTools 디바이스 모드 |
| **다크 모드** | OS 설정 연동 + 수동 토글 | prefers-color-scheme + CSS 변수 |
| **에러 처리** | n8n 연결 실패 시 사용자 친화적 메시지 | n8n 다운타임 시 폴백 메시지 표시 |
| **보안** | n8n URL 클라이언트 미노출 | API Route를 통한 프록시만 허용 |
| **접근성** | 시맨틱 HTML, 키보드 네비게이션 | shadcn/ui 기본 접근성 활용 |
| **번들 사이즈** | First Load JS < 120KB | next build 출력 확인 |

---

## 6. 기술 스택 선정

| 영역 | 기술 | 선정 사유 |
|---|---|---|
| **워크플로우 엔진** | n8n (self-hosted) | 오픈소스, 200+ 통합 노드, 웹훅 트리거, 시각적 워크플로우 편집기 |
| **AI 분류** | OpenAI API (n8n 내장 노드) | n8n OpenAI 노드로 코드 없이 연동. 신규 계정 $5 무료 크레딧 |
| **알림** | Slack API (n8n 내장 노드) | 실제 슬랙 워크스페이스 사용. 채널별 분기 알림 시연 |
| **데이터 저장** | Google Sheets API (n8n 내장 노드 + Next.js googleapis) | n8n에서 저장, Next.js에서 읽기. DB 없이 시트로 관리 |
| **이메일** | Resend API | 자동 응답 이메일. n8n에서 HTTP Request 노드로 호출 |
| **프레임워크** | Next.js 16 (App Router) | P1~P6과 동일 스택. Server Actions로 n8n 웹훅 프록시 |
| **언어** | TypeScript | 타입 안전한 폼 검증 및 API 통신 |
| **스타일링** | Tailwind CSS v4 | 유틸리티 퍼스트, 빠른 UI 구축 |
| **UI 컴포넌트** | shadcn/ui v4 + Lucide React | Input, Select, Card, Badge, Table 등 |
| **컨테이너** | Docker + Docker Compose | n8n 로컬 개발 + Render 배포 |
| **배포 (n8n)** | Render (무료 Docker 호스팅) | Docker 이미지 직접 배포, 무료 티어 |
| **배포 (Next.js)** | Vercel (Hobby) | 모노레포 Root Directory 설정으로 독립 배포 |
| **패키지 매니저** | pnpm | P1~P6과 동일 |

### 6.1 선택하지 않은 기술과 사유

| 후보 기술 | 선택 기술 | 제외 사유 |
|---|---|---|
| Zapier / Make | n8n (self-hosted) | 프로젝트 목적이 "직접 구축" 역량 시연. SaaS 도구는 구축 능력을 증명하지 못함 |
| n8n Cloud | n8n self-hosted (Docker) | 직접 Docker로 구축하여 DevOps 역량 시연. 무료 배포 가능 |
| Supabase / PostgreSQL | Google Sheets | 시연 목적상 시트가 데이터를 시각적으로 확인하기 쉬움. 별도 DB 비용 없음 |
| Railway | Render | Railway는 무료 티어 폐지($5/월 최소). Render는 무료 750시간/월 |
| Oracle Cloud Always Free | Render | Oracle은 항상 가동(콜드스타트 없음)이나 VM 관리 복잡. 포트폴리오 데모에는 Render가 셋업 간편 |
| Anthropic Claude API | OpenAI API | n8n에 OpenAI 내장 노드가 있어 설정이 간편. Claude는 HTTP Request 노드로 수동 연동 필요 |
| React Query / SWR | Server Actions + revalidatePath | 대시보드가 읽기 전용이므로 서버 컴포넌트 + 수동 새로고침으로 충분 |

---

## 7. 인프라 구성 및 배포

### 7.1 인프라 구성도

| 구성 요소 | 설명 |
|---|---|
| **소스 코드 저장소** | GitHub (기존 portfolio-demos 모노레포) |
| **Next.js 빌드 & 배포** | Vercel (Root Directory: `p7-n8n-automation`) |
| **n8n 인스턴스** | Render (Docker 런타임, `n8nio/n8n` 이미지) |
| **워크플로우 JSON** | GitHub 저장소 내 `workflows/` 디렉토리 |
| **데이터 저장** | Google Spreadsheet (Sheets API v4) |
| **AI 분류** | OpenAI API (n8n OpenAI 노드) |
| **알림** | Slack API (n8n Slack 노드) |
| **이메일** | Resend API (n8n HTTP Request 노드) |

### 7.2 로컬 개발 환경

**Docker Compose로 n8n 실행**:
```yaml
# docker/docker-compose.yml
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_ENCRYPTION_KEY=dev-encryption-key-change-in-prod
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Asia/Seoul
    volumes:
      - ./n8n_data:/home/node/.n8n
    restart: unless-stopped
```

**로컬 개발 흐름**:
1. `cd p7-n8n-automation/docker && docker compose up -d`
2. `http://localhost:5678` 접속 → 초기 계정 생성
3. n8n UI에서 credential 설정 (OpenAI, Slack, Google Sheets, Resend)
4. `workflows/*.json` 파일 import → 워크플로우 활성화
5. `cd .. && pnpm dev` → Next.js 개발 서버 (localhost:3000)
6. 문의 폼 제출 → n8n 실행 확인

### 7.3 프로덕션 배포

**n8n → Render 배포**:

1. Render Dashboard에서 "New Web Service" 생성
2. Docker 런타임 선택, 이미지: `n8nio/n8n`
3. 환경변수 설정:

| 변수명 | 용도 |
|---|---|
| `N8N_ENCRYPTION_KEY` | 크레덴셜 암호화 키 (프로덕션용 강력한 문자열) |
| `N8N_HOST` | `0.0.0.0` |
| `N8N_PORT` | Render가 할당하는 포트 (보통 `$PORT`) |
| `N8N_PROTOCOL` | `https` |
| `WEBHOOK_URL` | `https://{service-name}.onrender.com/` |
| `GENERIC_TIMEZONE` | `Asia/Seoul` |

4. 디스크 추가: Render Free Disk → `/home/node/.n8n` (SQLite 영속성)
5. 배포 후 n8n UI 접속 → credential 설정 → 워크플로우 import + 활성화

**Next.js → Vercel 배포**:

1. Vercel Dashboard에서 프로젝트 생성, Root Directory: `p7-n8n-automation`
2. 환경변수 설정 (아래 7.4 참조)
3. `git push` → 자동 빌드/배포

### 7.4 환경변수

**Next.js (Vercel)**:

| 변수명 | 용도 | 설정 위치 |
|---|---|---|
| `N8N_WEBHOOK_URL` | n8n 웹훅 베이스 URL (예: `https://xxx.onrender.com`) | Vercel Environment Variables |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account 이메일 | Vercel Environment Variables |
| `GOOGLE_PRIVATE_KEY_BASE64` | Service Account 프라이빗 키 (base64) | Vercel Environment Variables |
| `GOOGLE_SPREADSHEET_ID` | 문의 로그 스프레드시트 ID | Vercel Environment Variables |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL | Vercel Environment Variables |

**n8n (Render)**: n8n UI 내 credential로 관리 (환경변수 아님)

| Credential | 값 |
|---|---|
| OpenAI API Key | OpenAI 대시보드에서 발급 |
| Slack Bot Token | Slack App에서 발급 (OAuth & Permissions → Bot Token) |
| Google Sheets Service Account JSON | Google Cloud에서 다운로드한 키 파일 |
| Resend API Key | Resend 대시보드에서 발급 |

### 7.5 Render 무료 티어 제한 및 대응

| 제한 | 내용 | 대응 |
|---|---|---|
| **슬립** | 15분 비활성 시 인스턴스 슬립 | UptimeRobot(무료)으로 5분 간격 ping |
| **콜드스타트** | 슬립 후 첫 요청 시 15~30초 지연 | 문의 폼에 "처리 중" 로딩 UI 표시 |
| **시간 제한** | 월 750시간 무료 (1개 서비스 24/7 충분) | 1개 서비스만 운영 |
| **디스크** | 무료 디스크 제공 (제한적) | SQLite + 워크플로우 영속 저장 |

### 7.6 비용

| 항목 | 요금제 | 월 비용 | 비고 |
|---|---|---|---|
| Vercel 호스팅 | Hobby (Free) | $0 | Next.js 배포 |
| Render (n8n) | Free | $0 | 750시간/월, Docker |
| Google Cloud | Free Tier | $0 | Sheets API 무료 한도 |
| OpenAI | Free Credits | $0 | 신규 계정 $5 크레딧 (수백 건 분류 가능) |
| Slack | Free Plan | $0 | 무료 워크스페이스 |
| Resend | Free Tier | $0 | 100통/일 |
| UptimeRobot | Free | $0 | 5분 간격 ping (50개 모니터 무료) |
| **총합** | | **$0/월** | |

---

## 8. 폴더 구조 및 파일 컨벤션

```
p7-n8n-automation/
├── .env.example
├── components.json                     ← shadcn/ui v4 설정
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── docker/
│   ├── docker-compose.yml              ← 로컬 n8n 개발용
│   └── .gitignore                      ← n8n_data/ 제외
├── workflows/
│   ├── inquiry-automation.json         ← 워크플로우 A (문의 자동 처리)
│   ├── daily-report.json               ← 워크플로우 B (일일 리포트)
│   └── escalation-alert.json           ← 워크플로우 C (에스컬레이션)
└── src/
    ├── app/
    │   ├── layout.tsx                  ← Root layout (Geist 폰트, metadata, Toaster)
    │   ├── globals.css                 ← Tailwind v4 + shadcn imports
    │   ├── page.tsx                    ← 랜딩: 프로젝트 소개 + 워크플로우 설명
    │   ├── inquiry/
    │   │   ├── page.tsx                ← 문의 접수 폼
    │   │   ├── actions.ts              ← 문의 제출 Server Action
    │   │   └── status/
    │   │       └── [ticketId]/
    │   │           ├── page.tsx         ← 상태 조회 타임라인
    │   │           └── actions.ts       ← 상태 조회 Server Action
    │   ├── dashboard/
    │   │   ├── page.tsx                ← 문의 현황 (읽기 전용)
    │   │   └── actions.ts              ← 대시보드 데이터 Server Action
    │   └── api/
    │       └── inquiry/
    │           └── route.ts            ← n8n 웹훅 프록시 (POST)
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx              ← 상단 네비게이션
    │   │   └── Footer.tsx              ← 하단 정보
    │   ├── home/
    │   │   ├── Hero.tsx                ← 히어로 섹션
    │   │   ├── WorkflowCards.tsx       ← 워크플로우 3개 카드
    │   │   └── TechStack.tsx           ← 기술 스택 뱃지
    │   ├── inquiry/
    │   │   ├── InquiryForm.tsx         ← 문의 접수 폼 (client)
    │   │   └── StatusTimeline.tsx      ← 상태 타임라인 (client)
    │   ├── dashboard/
    │   │   ├── StatsCards.tsx          ← 통계 카드 4개
    │   │   └── InquiryTable.tsx        ← 최근 문의 테이블
    │   └── ui/                         ← shadcn/ui 컴포넌트
    ├── lib/
    │   ├── utils.ts                    ← cn() 유틸리티
    │   ├── constants.ts                ← 상태 맵, 카테고리 목록
    │   ├── n8n/
    │   │   └── webhook.ts              ← n8n 웹훅 호출 유틸 (서버 전용)
    │   └── google/
    │       ├── sheets.ts               ← Service Account 인증 클라이언트
    │       └── inquiries.ts            ← 문의 데이터 읽기 함수
    └── types/
        └── inquiry.ts                  ← Inquiry, InquiryStatus, ActionResult 타입
```

### 8.1 파일 네이밍 컨벤션

P1~P6과 동일:
- 컴포넌트: PascalCase (`InquiryForm.tsx`, `StatsCards.tsx`)
- 유틸리티: camelCase (`utils.ts`, `webhook.ts`)
- 페이지 파일: `page.tsx` (Next.js 컨벤션)
- 레이아웃: `layout.tsx` (Next.js 컨벤션)
- Server Actions: `actions.ts` (라우트 디렉토리와 같은 위치)
- n8n 워크플로우: kebab-case (`inquiry-automation.json`)

---

## 9. Google Sheets 데이터 스키마

### 9.1 "Inquiries" 시트 탭

| 컬럼 | 필드명 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| A | ticketId | string | Y | 자동 생성 (`TK-{timestamp}-{random}`) |
| B | 이름 | string | Y | 문의자 이름 |
| C | 이메일 | string | Y | 문의자 이메일 |
| D | 카테고리 (입력) | string | Y | 사용자가 선택한 카테고리 |
| E | 메시지 | string | Y | 문의 내용 |
| F | AI 분류 카테고리 | string | Y | OpenAI가 판단한 카테고리 |
| G | AI 긴급도 | string | Y | 높음/보통/낮음 |
| H | AI 요약 | string | Y | 한 줄 요약 |
| I | 상태 | string | Y | 접수됨/분류완료/처리중/완료/에스컬레이션 |
| J | 접수일시 | string | Y | ISO 8601 (YYYY-MM-DDTHH:mm:ss+09:00) |
| K | 처리완료일시 | string | N | 완료 시 기록 |
| L | 비고 | string | N | 관리자 메모 |

**Row 1**: 헤더 행

### 9.2 TypeScript 타입 정의

```typescript
type InquiryCategory = '기술문의' | '견적요청' | '일반문의'
type InquiryUrgency = '높음' | '보통' | '낮음'
type InquiryStatus = '접수됨' | '분류완료' | '처리중' | '완료' | '에스컬레이션'

interface Inquiry {
  rowIndex: number
  ticketId: string
  name: string
  email: string
  categoryInput: InquiryCategory
  message: string
  aiCategory: InquiryCategory
  aiUrgency: InquiryUrgency
  aiSummary: string
  status: InquiryStatus
  createdAt: string
  completedAt: string | null
  notes: string
}

interface InquiryFormData {
  name: string
  email: string
  category: InquiryCategory
  message: string
}

interface DashboardStats {
  todayCount: number
  completedCount: number
  pendingCount: number
  avgProcessingHours: number
}

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

---

## 10. 개발 일정 (3일)

| 시간 | 작업 내용 | 완료 기준 |
|---|---|---|
| **0~1h** | 프로젝트 스캐폴딩 (Next.js, shadcn/ui, 설정 파일) | `pnpm dev` 기본 페이지 확인 |
| **1~2h** | Docker Compose + n8n 로컬 실행 | `localhost:5678` n8n UI 접속 확인 |
| **2~5h** | 워크플로우 A 구축 (웹훅 → AI 분류 → Slack → Sheets → 이메일 → 응답) | Postman으로 웹훅 호출 → 전체 파이프라인 동작 확인 |
| **5~7h** | 워크플로우 B, C 구축 (일일 리포트 + 에스컬레이션) | 수동 트리거로 동작 확인 |
| **7~8h** | 워크플로우 JSON export + git 저장 | `workflows/` 디렉토리에 3개 파일 |
| **8~10h** | Next.js: n8n 웹훅 프록시 + 문의 폼 구현 | 폼 제출 → n8n 트리거 → ticketId 반환 |
| **10~12h** | Next.js: 상태 조회 페이지 + Google Sheets 읽기 | ticketId로 상태 타임라인 표시 |
| **12~14h** | Next.js: 대시보드 (통계 카드 + 문의 테이블) | 실시간 데이터 표시 확인 |
| **14~17h** | Next.js: 랜딩 페이지 (히어로 + 워크플로우 카드 + 기술 스택) | 시각적으로 완성된 소개 페이지 |
| **17~19h** | 레이아웃 (Header, Footer) + 다크모드 + 반응형 QA | 360px~1920px 정상 |
| **19~21h** | Render n8n 배포 + Vercel 배포 + 환경변수 설정 | 프로덕션 환경에서 전체 흐름 동작 |
| **21~23h** | 버그 수정, 코드 정리, CLAUDE.md 업데이트 | `pnpm build` 성공, 배포 확인 |

---

## 11. 완료 기준 (Definition of Done)

### 필수 완료 조건

1. n8n 인스턴스가 Docker로 실행되고 웹훅이 정상 응답
2. 워크플로우 A: 문의 폼 제출 → AI 분류 → Slack 알림 + Google Sheets 저장 + 자동 응답 이메일
3. 워크플로우 B: 수동 트리거 → 일일 리포트 이메일 + Slack 포스팅
4. 워크플로우 C: 스케줄 트리거 → 미응답 문의 감지 → Slack 긴급 알림
5. 상태 조회 페이지에서 ticketId로 처리 현황 확인 가능
6. 대시보드에서 문의 통계 및 최근 문의 목록 표시
7. n8n URL이 클라이언트에 노출되지 않음 (API Route 프록시)
8. 모바일(360px) ~ 데스크톱(1920px) 반응형 정상 작동
9. `pnpm build` 에러 없이 성공
10. Vercel + Render 프로덕션 배포 완료
11. 워크플로우 JSON 파일이 `workflows/` 디렉토리에 저장
12. 루트 `CLAUDE.md`에 P7 섹션 추가

### 권장 완료 조건

- 다크/라이트 모드 전환 정상
- 랜딩 페이지에서 워크플로우 흐름을 시각적으로 이해 가능
- Sonner 토스트 알림 (성공/실패)
- UptimeRobot으로 n8n 인스턴스 모니터링 설정
- Skeleton 로딩 UI
- n8n 연결 실패 시 사용자 친화적 에러 메시지
