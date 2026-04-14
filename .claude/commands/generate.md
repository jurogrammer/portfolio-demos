---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Generate a website using stored design essence
argument-hint: <domain> <project-name>
---

## Design-Driven Code Generation v3

Arguments: $ARGUMENTS
- First word = domain (matches `design-essence/tokens/extracted/<domain>/`)
- Second word = project name (output directory name)
- Optional third word = framework (default: nextjs)

Supported frameworks: nextjs | html | react | wordpress

---

### Prerequisites — Load All Context

1. Read `design-essence/tokens/extracted/<domain>/section-map.json`
2. Read `design-essence/tokens/extracted/<domain>/content-map.json` if exists (from `/map`)
3. Read `design-essence/build/css/variables.css`
4. Read `design-essence/briefs/<domain>/brief.json`

---

### CRITICAL: Anti-Genericization Rules

## 이 규칙은 절대 위반 불가합니다.

### DO NOT (절대 하지 마시오):
- 원본에 카드 UI가 없으면 → 카드로 감싸지 마시오 (둥근 모서리 + 흰 배경 + 그림자 = 카드)
- 원본에 `border-radius: 0`이면 → `rounded-*` 추가하지 마시오
- 원본에 `box-shadow: none`이면 → `shadow-*` 추가하지 마시오
- 원본이 `background: transparent` 또는 이미지 위 오버레이면 → 흰색/회색 배경 넣지 마시오
- 원본이 full-bleed (width: 100vw) 이미지면 → `max-width` 컨테이너로 감싸지 마시오
- "더 보기 좋게", "현대적으로", "일반적인 웹 디자인" 이라는 이유로 → 절대 변형하지 마시오
- shadcn/ui 기본 스타일(둥근 카드, 그림자) → 원본과 다르면 사용하지 마시오
- **원본에 카드 UI가 있는데** → full-bleed 리본으로 바꾸지 마시오 (역방향 일반화도 금지)

### MUST (반드시 하시오):
- `screenshot.png` 을 **먼저 보고** 레이아웃 구조를 파악한 후 코드 작성
- `inner-elements.json` 값을 코드에 **그대로** 반영
- `snapshot.html` DOM 구조를 참고하여 동일한 계층 유지
- 의심스러우면 → 원본 그대로 (less is more)

---

### ★ 섹션별 생성 프로세스 (Screenshot-First Workflow) — v3 핵심 변경

**이전 v2**: computed.css 읽기 → 코드 생성 → "정신적 검증"
**v3**: screenshot.png 보기 → 시각 분석 → inner-elements.json 반영 → 코드 생성

```
For each section in section-map.json (순서대로):

  ──────────────────────────────────────────────
  PHASE A: 관찰 (Observe) — 코드 작성 전 필수
  ──────────────────────────────────────────────

  1. VIEW screenshot.png
     - 브라우저 MCP로 원본 사이트의 해당 섹션 스크롤 위치로 이동
     - 또는 저장된 screenshot.png 파일을 Read 도구로 확인
     - ★ 스크린샷을 실제로 "눈으로" 확인해야 합니다

  2. DESCRIBE what you see (시각 분석 작성 — 코드 전에 반드시)
     이 분석을 텍스트로 출력하시오:

     ```
     [S02 Quick Links 시각 분석]
     - 레이아웃: 4개의 독립 카드가 가로 배치, 카드 사이 ~20px 간격
     - 컨테이너: max-width 약 1200px, 좌우 여백 있음 (full-bleed 아님)
     - 카드 형태: border-radius ~12px, 배경에 우주/성운 텍스처 이미지
     - 배경 처리: 이미지 위에 대각선 빛 번짐 오버레이
     - 타이포: 상단 영문은 세리프(명조) 소문자 + letter-spacing, 중앙 한글은 볼드 산세리프
     - 색상: 각 카드가 보라/남색/틸/민트 계열로 다른 색감
     - 수직 리듬: 영문-한글-시간이 하나의 그룹으로 응집
     ```

     이 분석이 코드 생성의 **사양서** 역할을 합니다.
     분석 없이 코드를 짜면 AI 환각(hallucination)에 의존하게 됩니다.

  3. READ inner-elements.json
     - repeating_item → 실제 카드/아이템의 border-radius, background, shadow, size
     - layout_container → 실제 flex/grid 설정, gap, maxWidth
     - heading → 실제 font-family, size, weight, letterSpacing

  ──────────────────────────────────────────────
  PHASE B: 생성 (Generate)
  ──────────────────────────────────────────────

  4. GENERATE component
     - Phase A의 시각 분석 + inner-elements.json 기반으로 코드 작성
     - **검증 질문 (코드 작성 중 자문)**:
       a) "원본에서 이 요소들이 전체 너비를 채우나, 아니면 컨테이너 안에 있나?"
       b) "원본에서 카드 사이에 gap이 있나, 없나?"
       c) "원본에서 border-radius가 0인가, 있는가?"
       d) "원본에서 배경이 솔리드 색상인가, 이미지/그라디언트인가?"
       e) "원본에서 이 텍스트가 세리프인가, 산세리프인가?"

  5. READ content-map.json for this section's content slots
     - mapping_type == "omit" → skip this section
     - slot values → JSX에 매핑

  ──────────────────────────────────────────────
  PHASE C: 즉시 검증 (Verify-As-You-Go) — v3 신규
  ──────────────────────────────────────────────

  6. 매 2~3개 섹션 생성 후:
     - 개발 서버 시작 (아직 안 되어 있으면)
     - 생성된 화면 스크린샷 캡처
     - 원본 스크린샷과 나란히 비교
     - 구조적 차이 발견 시 즉시 수정 (나중에 /verify에서 고치려 하지 말 것)
```

---

### AI 환각 방지: 흔한 실수 체크리스트

코드 생성 시 아래 실수를 범하고 있지 않은지 **매 섹션마다** 확인:

| 원본 상태 | 흔한 AI 실수 | 올바른 처리 |
|---|---|---|
| 카드 사이에 gap 20px + border-radius 12px | gap: 0, border-radius: 0 → full-bleed 리본 | gap: 20px, border-radius: 12px |
| 카드에 배경 이미지 + 오버레이 | 솔리드 그라디언트만 사용 | 배경 이미지 + CSS overlay |
| 영문 소제목이 세리프(명조) 폰트 | 산세리프(고딕)로 대체 | serif 폰트 적용 |
| max-width 컨테이너 안에 카드 배치 | width: 100% full-bleed | max-width: 1200px + margin: 0 auto |
| 이미지가 없는 것이 아닌 배경 이미지 | `<Image>` 로 깨진 이미지 표시 | CSS background-image 또는 솔리드 대체 |
| 세로 여백이 작고 응집된 텍스트 그룹 | margin이 과다하여 분산 | 원본 비율에 맞는 compact한 여백 |

---

### Framework-Specific Rules

#### nextjs (default):
- App Router + Tailwind v4
- Import variables.css in globals.css
- Use `@theme { --color-*: var(--color-*); }` — NO tailwind.config.ts
- Each section = separate component in `src/components/sections/`
- page.tsx composes all section components
- Use `next/image` for images, `next/font` for fonts
- 배경 이미지가 없거나 로드 실패 시 → 솔리드 색상 fallback (깨진 이미지 아이콘 절대 노출 금지)

---

### Output Structure (nextjs)

```
design-essence/output/<project-name>/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       └── sections/
│           ├── Header.tsx      ← S01
│           ├── Hero.tsx        ← S02
│           └── ...
├── public/images/
├── package.json
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

---

### Post-Generation

1. 개발 서버 시작 → 전체 페이지 스크린샷 캡처
2. 원본 사이트와 나란히 비교 (최소한 hero + 첫 2개 섹션)
3. 명백한 구조 차이 있으면 즉시 수정
4. Report: 생성된 섹션 목록, 시각 분석 요약, omit된 섹션
5. 안내: "다음 단계: `/verify <project-name>` 으로 원본과 비교 검증"
