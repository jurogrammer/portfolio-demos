# Design Essence Extractor & Generator — 시스템 설계서

## 개요

기업 웹페이지의 URL을 입력받아 **디자인 에센스**를 분석·추출하고, 선택된 에센스를 기반으로 **전혀 다른 기업의 웹페이지**를 생성하는 2단계 워크플로우.

---

## Phase 1: 에센스 추출 (Extraction)

### 1-1. 입력

사용자가 분석 대상 URL을 전달하면, 다음 두 가지 경로로 원본 데이터를 수집한다.

| 수집 방법 | 목적 | 도구 |
|-----------|------|------|
| **HTML/CSS 파싱** | 구조, 컬러값, 폰트, 클래스명 추출 | `web_fetch` → HTML 소스 분석 |
| **시각적 캡처** | 레이아웃 비율, 여백, 전체 무드 확인 | Claude in Chrome 스크린샷 |

> **핵심 원칙**: HTML 파싱만으로는 "느낌"을 못 잡고, 스크린샷만으로는 정확한 수치를 못 잡는다. 두 방법을 병행해야 에센스의 정밀도가 올라간다.

### 1-2. 에센스 카테고리 (4개)

각 카테고리별로 추출하는 항목과 구조화 방식을 정의한다.

#### A. 레이아웃 / 구조

```json
{
  "layout": {
    "pattern": "hero-first / bento-grid / editorial-scroll / split-panel",
    "sections": [
      { "name": "hero", "height_ratio": "100vh", "content_alignment": "center" },
      { "name": "features", "grid": "3-column", "gap": "24px" },
      { "name": "testimonials", "pattern": "horizontal-carousel" },
      { "name": "cta", "style": "full-width-banner" }
    ],
    "max_width": "1200px",
    "whitespace_density": "generous | balanced | compact",
    "section_flow": "vertical-stack | alternating-sides | z-pattern",
    "sticky_elements": ["navbar"],
    "breakpoint_strategy": "desktop-first | mobile-first"
  }
}
```

**추출 방법**:
- HTML에서 `<section>`, `<main>`, 주요 `<div>` 계층 파악
- CSS의 `display`, `grid-template`, `flex-direction`, `max-width` 값 수집
- 스크린샷에서 섹션 간 비율과 여백 패턴 시각 확인

#### B. 컬러 팔레트 / 타이포그래피

```json
{
  "color": {
    "primary": "#0A0A0A",
    "secondary": "#6B5CE7",
    "accent": "#FF6B35",
    "background": { "main": "#FFFFFF", "alt": "#F8F8F6" },
    "text": { "heading": "#1A1A1A", "body": "#4A4A4A", "muted": "#9B9B9B" },
    "gradients": ["linear-gradient(135deg, #6B5CE7, #FF6B35)"],
    "mood": "dark-professional | warm-friendly | cool-minimal | vibrant-playful"
  },
  "typography": {
    "heading_font": { "family": "Instrument Serif", "source": "google-fonts" },
    "body_font": { "family": "Satoshi", "source": "custom" },
    "scale": {
      "h1": "clamp(2.5rem, 5vw, 4.5rem)",
      "h2": "clamp(1.8rem, 3vw, 3rem)",
      "body": "1rem / 1.6"
    },
    "weight_usage": { "bold": "700-800 headings only", "regular": "400 body" },
    "special": "all-caps-nav | serif-italic-accent | monospace-data"
  }
}
```

**추출 방법**:
- CSS 변수 (`--color-*`, `--font-*`) 또는 인라인 스타일에서 직접 추출
- `@font-face` 또는 Google Fonts link에서 폰트 정보 수집
- 스크린샷에서 전체 컬러 톤과 대비 비율 시각 확인

#### C. 인터랙션 / 애니메이션

```json
{
  "interaction": {
    "scroll_effects": [
      { "type": "fade-in-up", "trigger": "viewport-enter", "duration": "0.6s" },
      { "type": "parallax", "element": "hero-background", "speed": "0.5" },
      { "type": "sticky-transform", "element": "product-card" }
    ],
    "hover_patterns": {
      "buttons": "scale(1.02) + shadow-lift",
      "cards": "border-glow | image-zoom | overlay-reveal",
      "nav_links": "underline-slide | color-shift"
    },
    "page_transitions": "none | fade | slide-up | morph",
    "loading_style": "skeleton | spinner | progressive-blur",
    "micro_interactions": ["cursor-follow", "magnetic-buttons", "text-split-reveal"],
    "animation_library": "css-only | framer-motion | gsap | anime.js"
  }
}
```

**추출 방법**:
- CSS에서 `transition`, `animation`, `@keyframes` 정의 수집
- JS에서 IntersectionObserver, scroll 이벤트 핸들러 패턴 확인
- 스크린샷 + 실제 조작으로 인터랙션 패턴 관찰 (Claude in Chrome)

#### D. 브랜드 톤앤매너 / 카피 스타일

```json
{
  "brand_voice": {
    "tone": "authoritative | conversational | playful | provocative | poetic",
    "perspective": "we (company) | you (reader) | third-person",
    "headline_pattern": {
      "structure": "verb-first-imperative | question | bold-statement | metaphor",
      "length": "short-punchy (3-5 words) | medium (6-10) | long-descriptive (10+)",
      "examples_pattern": ["Build. Ship. Scale.", "What if X could Y?"]
    },
    "cta_style": {
      "primary": "Get started | Start free trial | Book a demo",
      "tone": "urgent | inviting | confident",
      "visual": "filled-button | ghost-button | text-link-with-arrow"
    },
    "copy_density": "minimal (hero + bullets) | balanced | copy-heavy (editorial)",
    "social_proof_style": "logos | quotes | metrics | case-study-cards",
    "unique_vocabulary": ["keywords or branded terms the site uses repeatedly"]
  }
}
```

**추출 방법**:
- 텍스트 콘텐츠 전체를 분석하여 문장 구조, 어조, 반복 패턴 추출
- CTA 버튼 텍스트와 배치 위치 수집
- 히어로 섹션 카피의 문장 구조 패턴화

### 1-3. 에센스 리포트 출력

추출된 에센스를 **두 가지 형태**로 출력한다.

1. **구조화된 JSON** — 이후 생성 단계에서 프로그래매틱하게 사용
2. **시각 리포트** — 사용자가 직관적으로 에센스를 확인하고 선택할 수 있는 인터랙티브 카드

시각 리포트 예시 구성:
- 컬러 팔레트 스와치 (실제 색상 미리보기)
- 레이아웃 와이어프레임 (섹션 구조 다이어그램)
- 타이포그래피 샘플 (실제 폰트 렌더링)
- 인터랙션 패턴 설명 카드
- 톤앤매너 키워드 태그 클라우드

---

## Phase 2: 웹페이지 생성 (Generation)

### 2-1. 입력

사용자로부터 3가지 정보를 받는다:

| 항목 | 설명 | 예시 |
|------|------|------|
| **선택된 에센스** | Phase 1 리포트에서 원하는 카테고리 선택 | "레이아웃 + 컬러만" |
| **새 기업 정보** | 생성할 웹페이지의 대상 기업 | 이름, 산업, 핵심 메시지 |
| **기술 스택** | 출력 형태 | HTML / React / WordPress / Next.js |

### 2-2. 기술 스택별 출력 전략

#### HTML (단일 파일)

```
output/
  index.html          ← HTML + CSS + JS 올인원
```

**적합한 경우**: 빠른 프로토타이핑, 포트폴리오 데모, 클라이언트 프레젠테이션
**장점**: 별도 빌드 없이 바로 열 수 있음
**구현 방식**: 인라인 `<style>` + `<script>`, CDN 기반 외부 라이브러리

#### React (JSX 컴포넌트)

```
output/
  src/
    components/
      Hero.jsx
      Features.jsx
      Testimonials.jsx
      Footer.jsx
    styles/
      design-tokens.css   ← 에센스 컬러/타이포 변수
      animations.css      ← 에센스 인터랙션 패턴
    App.jsx
    index.jsx
  package.json
```

**적합한 경우**: 실제 프로덕션 프로젝트, 컴포넌트 재사용
**장점**: 에센스를 design-tokens으로 분리 → 다른 프로젝트에 이식 가능
**구현 방식**: Tailwind CSS + Framer Motion 권장

#### WordPress

```
output/
  theme/
    style.css             ← 에센스 기반 테마 스타일
    functions.php         ← 커스텀 기능
    templates/
      front-page.php
      header.php
      footer.php
    assets/
      css/custom.css
      js/interactions.js
```

**적합한 경우**: 비개발자 클라이언트, CMS 기반 운영
**장점**: 관리자 패널에서 콘텐츠 수정 가능
**구현 방식**: FSE (Full Site Editing) 또는 Classic Theme

#### Next.js

```
output/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    sections/
      Hero.tsx
      Features.tsx
    ui/
      Button.tsx
      Card.tsx
  lib/
    design-tokens.ts      ← 에센스 JSON → TypeScript 상수
    animations.ts         ← Framer Motion variants
  tailwind.config.ts      ← 에센스 컬러/폰트 자동 매핑
```

**적합한 경우**: 풀스택 프로덕션, SEO 중시, 확장성 필요
**장점**: SSR/SSG, 이미지 최적화, 타입 안전성
**구현 방식**: App Router + Tailwind + Framer Motion

### 2-3. 에센스 적용 매핑

선택된 에센스가 코드에 어떻게 매핑되는지:

| 에센스 카테고리 | 코드 매핑 대상 |
|----------------|---------------|
| **레이아웃/구조** | 섹션 순서, grid/flex 설정, max-width, 여백 비율 |
| **컬러/타이포** | CSS 변수, Tailwind config, font-face 선언 |
| **인터랙션/애니메이션** | transition/animation CSS, JS 이벤트 핸들러, 라이브러리 설정 |
| **톤앤매너** | 플레이스홀더 카피 생성, CTA 텍스트 스타일, 콘텐츠 밀도 |

### 2-4. 생성 프로세스

```
1. 에센스 JSON 로드
2. 새 기업 정보 수집 (이름, 산업, 핵심 메시지, 로고 등)
3. 선택된 에센스 카테고리만 필터링
4. 기술 스택에 맞는 템플릿 구조 생성
5. 에센스 값을 코드에 매핑
   - 레이아웃 → 섹션 컴포넌트 구조
   - 컬러/타이포 → design tokens / CSS 변수
   - 인터랙션 → animation 코드
   - 톤앤매너 → 플레이스홀더 카피 자동 생성
6. 새 기업 콘텐츠로 카피 교체
7. 최종 코드 생성 및 파일 출력
```

---

## 사용 시나리오 예시

### 시나리오: Stripe 스타일로 한국 핀테크 스타트업 웹페이지 만들기

**Step 1**: "https://stripe.com 분석해줘"
→ 에센스 리포트 생성:
- 레이아웃: hero-first, 코드 데모 중심, 3단 feature grid
- 컬러: 다크 배경 (#0A2540) + 보라 그라데이션 accent
- 인터랙션: 스크롤 기반 코드 하이라이팅, 글로우 효과
- 톤: 기술적이면서 자신감 있는 카피, "Start with X" 패턴

**Step 2**: "컬러랑 인터랙션 에센스로 '페이링크' 라는 핀테크 회사 웹페이지 만들어줘. React로."
→ Stripe의 다크 테마 + 글로우 인터랙션을 적용한 "페이링크" 웹페이지 React 코드 생성

---

## 프롬프트 워크플로우 (Claude 대화 흐름)

### 대화 1: 분석 요청

```
사용자: "https://linear.app 이 사이트 디자인 에센스 분석해줘"

Claude:
  1. web_fetch로 HTML/CSS 소스 수집
  2. (가능하면) Claude in Chrome으로 스크린샷 캡처
  3. 4개 카테고리별 에센스 추출
  4. 구조화된 JSON + 시각 리포트 카드 출력
  5. "어떤 에센스를 적용할지, 어떤 기업의 웹페이지를 만들지 알려주세요" 안내
```

### 대화 2: 생성 요청

```
사용자: "레이아웃이랑 인터랙션 에센스로 '클라우드브릿지'라는
         B2B SaaS 회사 랜딩페이지 만들어줘. Next.js로."

Claude:
  1. Phase 1 에센스 JSON에서 layout + interaction 필터링
  2. 새 기업 정보 확인 (이름, 산업, 핵심 가치)
  3. Next.js App Router 구조로 코드 생성
  4. 에센스 레이아웃 패턴 적용
  5. 에센스 인터랙션 패턴 적용
  6. 새 기업에 맞는 카피 자동 생성
  7. 파일 출력 + 다운로드 제공
```

---

## 확장 가능성

- **에센스 라이브러리**: 여러 사이트의 에센스를 저장해두고 믹스매치
- **에센스 비교**: 두 사이트의 에센스를 나란히 비교하는 리포트
- **에센스 블렌딩**: "Stripe의 레이아웃 + Notion의 컬러 + Linear의 인터랙션"처럼 여러 사이트 에센스를 조합
- **스킬화**: 이 워크플로우 자체를 Claude 커스텀 스킬로 등록하여 반복 사용 가능
