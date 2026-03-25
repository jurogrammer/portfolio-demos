# Design Essence System — 최종 플랜 (합의 완료)

## Context

**문제**: p2-techvision(기업 홈페이지)에 design-essence-system.md의 에센스 추출/생성 도구를 웹앱 기능으로 잘못 구현. p2 요구사항에 없는 19개 파일이 추가됨.

**올바른 방향**: design-essence-system.md는 **Claude Code 스킬 워크플로우** 명세서. `.claude/skills/`에 `capture-essence`와 `build-site` 스킬이 이미 정의되어 있으나, 명세서 대비 기능이 부족.

**합의된 수정사항** (Planner + Architect + Critic 일치):

| # | 갭 | 수정 |
|---|-----|------|
| 1 | `web_fetch` 이중 소스 추출 없음 | capture-essence에 web_fetch 사전 단계 추가 |
| 2 | `essence.json` 구조화 출력 없음 | essence.md + essence.json 이중 출력 |
| 3 | build-site AI 생성 지시가 모호함 | 기존 구체적 매핑 규칙 유지 + 포맷별 확장 |
| 4 | 삭제 전 의존성 검사 없음 | Part 1에 grep 검사 단계 추가 |
| 5 | 선택적 에센스 필터링 | v2로 연기 (합의) |

---

## Part 1: p2-techvision 정리

### Step 0: 삭제 전 의존성 검사

```bash
cd p2-techvision
grep -r "from.*essence\|import.*essence" src/ --include="*.ts" --include="*.tsx" | grep -v "src/types/essence\|src/lib/essence\|src/components/public/essence\|src/app/api/essence\|src/app/\[locale\]/(public)/essence"
```

예상: Header.tsx, Footer.tsx, ko.json, en.json만 참조. 그 외 파일이 나오면 추가 대응 필요.

### Step 1: 파일 삭제 (19개)

```
src/types/essence.ts
src/lib/essence/parser.ts
src/lib/essence/extractor.ts
src/lib/essence/generator.ts
src/app/api/essence/extract/route.ts
src/app/api/essence/generate/route.ts
src/app/[locale]/(public)/essence/page.tsx
src/components/public/essence/EssencePageClient.tsx
src/components/public/essence/EssenceUrlInput.tsx
src/components/public/essence/EssenceReportView.tsx
src/components/public/essence/ColorPalette.tsx
src/components/public/essence/LayoutDiagram.tsx
src/components/public/essence/InteractionPatterns.tsx
src/components/public/essence/BrandVoiceTags.tsx
src/components/public/essence/GenerationFlow.tsx
src/components/public/essence/EssenceSelector.tsx
src/components/public/essence/CompanyInfoForm.tsx
src/components/public/essence/TechStackPicker.tsx
src/components/public/essence/GeneratedCodeViewer.tsx
```

빈 디렉토리도 삭제: `essence/` 하위 전체

### Step 2: 복원 (4개 파일)

| 파일 | 변경 |
|------|------|
| `src/components/public/Header.tsx` | 에센스 navItem 제거 (line ~43) |
| `src/components/public/Footer.tsx` | 에센스 링크 제거 |
| `src/dictionaries/ko.json` | `nav.essence` + `essence` 섹션 제거 |
| `src/dictionaries/en.json` | `nav.essence` + `essence` 섹션 제거 |

### Step 3: 빌드 검증

```bash
pnpm tsc --noEmit && pnpm build
```

빌드 출력에서 `/api/essence/*` 라우트가 없어야 함.

---

## Part 2: capture-essence 스킬 개선

파일: `.claude/skills/capture-essence/SKILL.md`

### 변경 1: web_fetch 이중 소스 추출 추가 (새 Step 1.5)

명세서 핵심 원칙: "HTML 파싱만으로는 느낌을 못 잡고, 스크린샷만으로는 정확한 수치를 못 잡는다. 두 방법을 병행해야 에센스의 정밀도가 올라간다."

기존 Step 1 (준비) 뒤, Step 2 (Chrome MCP) 전에 삽입:

```markdown
### Step 1.5: web_fetch로 HTML 소스 분석

Chrome MCP 분석 전에 원본 HTML/CSS를 직접 파싱하여 정확한 수치를 확보한다.

**1.5a. HTML 소스 가져오기**
- `web_fetch` 로 URL의 HTML 소스를 가져온다
- 응답이 실패하면 이 단계를 건너뛰고 Step 2 Chrome MCP만으로 진행한다 (graceful degradation)

**1.5b. `<head>` 분석**
- Google Fonts `<link>` 태그에서 폰트 패밀리와 weight 추출
- `<link rel="stylesheet">` 에서 외부 CSS 파일 URL 목록 추출
- `<meta>` 태그에서 title, description, og:image 추출
- `<script src>` 에서 라이브러리 감지 (gsap, framer-motion, aos, anime.js, swiper 등)

**1.5c. `<style>` 블록 분석**
- CSS 커스텀 프로퍼티 추출 (`:root { --color-primary: #...; }` 등)
- `@font-face` 선언에서 커스텀 폰트 정보 추출
- `@keyframes` 애니메이션 이름과 속성 추출
- 주요 선택자의 `transition`, `animation` 속성 수집

**1.5d. 구조적 마크업 분석**
- `<nav>`, `<header>`, `<main>`, `<section>`, `<footer>` 계층 구조 파악
- 주요 `<div>`의 class 네이밍 패턴 분석 (BEM, Tailwind, CSS Modules 등)
- `<h1>`~`<h6>` 텍스트 콘텐츠 수집 (브랜드 톤 분석용)
- CTA 버튼 텍스트 수집 (`<button>`, `<a>` with class*="btn" 등)
```

### 변경 2: 인터랙션 추출 강화 (Step 2c 확장)

기존 Step 2c의 JS 코드 블록 뒤에 세 번째 코드 블록 추가:

```javascript
// 인터랙션 & 애니메이션 추출
(function() {
  const animations = [];
  const transitions = [];

  try {
    [...document.styleSheets].forEach(sheet => {
      try {
        [...sheet.cssRules].forEach(rule => {
          if (rule instanceof CSSKeyframesRule) animations.push(rule.name);
          if (rule.style?.transition && rule.style.transition !== 'all 0s ease 0s')
            transitions.push({ selector: rule.selectorText, transition: rule.style.transition });
          if (rule.style?.animation) animations.push(rule.style.animation);
        });
      } catch(e) { /* cross-origin stylesheet */ }
    });
  } catch(e) {}

  return JSON.stringify({
    keyframeAnimations: [...new Set(animations)].slice(0, 10),
    transitions: transitions.slice(0, 10),
    hasScrollAnimations: !!document.querySelector('[class*="animate"], [class*="fade"], [data-aos], [data-scroll]'),
    hasParallax: !!document.querySelector('[class*="parallax"], [data-parallax], [data-rellax]'),
    hasSmoothScroll: getComputedStyle(document.documentElement).scrollBehavior === 'smooth'
  }, null, 2);
})()
```

### 변경 3: 브랜드 톤/카피 분석 추가 (새 Step 2e)

```markdown
**2e. 브랜드 톤 & 카피 분석**
- Step 2b의 `get_page_text` 결과 + Step 1.5d의 헤드라인/CTA 텍스트를 종합하여:
  - 헤드라인(H1~H3) 문장 구조 패턴 분류 (imperative / question / bold-statement / metaphor)
  - CTA 버튼 텍스트의 톤 분류 (urgent / inviting / confident)
  - 전체 텍스트 시점 분석 (we / you / third-person)
  - 반복 키워드 추출 (3회 이상 등장하는 핵심 단어)
  - 카피 밀도 판단: 섹션당 평균 텍스트 양 기준 (minimal / balanced / copy-heavy)
  - 소셜 프루프 유형 감지 (로고 그리드, 인용문, 수치 카운터, 케이스 스터디 카드)
```

### 변경 4: essence.json 구조화 출력 추가 (Step 3 확장)

기존 Step 3에서 `essence.md` 생성 후, 같은 데이터를 JSON으로도 저장:

```markdown
### Step 3b: essence.json 생성

추출한 데이터를 명세서 스키마에 맞게 구조화하여 `website-builder/essences/<slug>/essence.json` 에 저장한다.

**JSON 스키마:**
```json
{
  "meta": {
    "name": "<사이트 이름>",
    "source_url": "<URL>",
    "captured_date": "<YYYY-MM-DD>",
    "tags": ["tag1", "tag2"]
  },
  "layout": {
    "pattern": "hero-first",
    "sections": [{ "name": "hero", "height_ratio": "100vh", "content_alignment": "center" }],
    "max_width": "1200px",
    "whitespace_density": "generous",
    "section_flow": "vertical-stack",
    "sticky_elements": ["navbar"],
    "breakpoint_strategy": "mobile-first"
  },
  "color": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": { "main": "#hex", "alt": "#hex" },
    "text": { "heading": "#hex", "body": "#hex", "muted": "#hex" },
    "gradients": ["linear-gradient(...)"],
    "mood": "cool-minimal"
  },
  "typography": {
    "heading_font": { "family": "Font Name", "source": "google-fonts", "url": "https://fonts.googleapis.com/..." },
    "body_font": { "family": "Font Name", "source": "system" },
    "scale": { "h1": "clamp(...)", "h2": "clamp(...)", "body": "1rem / 1.6" },
    "weight_usage": { "bold": "700", "regular": "400" },
    "special": "all-caps-nav"
  },
  "interaction": {
    "scroll_effects": [{ "type": "fade-in-up", "trigger": "viewport-enter", "duration": "0.6s" }],
    "hover_patterns": { "buttons": "scale(1.02) + shadow-lift", "cards": "border-glow", "nav_links": "underline-slide" },
    "page_transitions": "none",
    "loading_style": "skeleton",
    "micro_interactions": [],
    "animation_library": "css-only"
  },
  "brand_voice": {
    "tone": "authoritative",
    "perspective": "we",
    "headline_pattern": { "structure": "bold-statement", "length": "short-punchy", "examples": ["Build. Ship. Scale."] },
    "cta_style": { "primary": "Get started", "tone": "confident", "visual": "filled-button" },
    "copy_density": "minimal",
    "social_proof_style": "logos",
    "unique_vocabulary": ["keyword1", "keyword2"]
  }
}
```

essence.md는 사람이 읽는 리포트, essence.json은 build-site가 프로그래매틱하게 로드하는 데이터.
```

### essence.md 스키마에 브랜드 톤 섹션 추가

기존 `essence.md` 스키마 끝에 추가:

```markdown
## 브랜드 톤 & 카피
- 전체 톤: (authoritative / conversational / playful / provocative / poetic)
- 시점: (we / you / third-person)
- 헤드라인 패턴: 구조, 길이, 예시
- CTA 스타일: 텍스트, 톤, 시각적 유형 (filled/ghost/text-link)
- 카피 밀도: (minimal / balanced / copy-heavy)
- 소셜 프루프: (logos / quotes / metrics / case-study-cards)
- 핵심 키워드: [word1, word2, ...]
```

---

## Part 3: build-site 스킬 개선

파일: `.claude/skills/build-site/SKILL.md`

### 핵심 원칙: 구체적 매핑 규칙 유지 + 포맷별 확장

Architect/Critic 합의: "Claude에게 '종합적으로 해석하라'고 지시하면 예측 불가능한 결과. 기존 구체적 매핑 규칙을 유지하고, 포맷별로 확장한다."

### 변경 1: Step 1에서 essence.json 로드 추가

```markdown
### Step 1: 입력 확인 & 에센스 로드

- `website-builder/essences/<slug>/essence.json` 을 읽어 구조화된 에센스 데이터를 로드한다
- `website-builder/essences/<slug>/essence.md` 를 읽어 정성적 컨텍스트로 활용한다
- `website-builder/essences/<slug>/screenshots/` 의 스크린샷들을 시각적 레퍼런스로 활용한다
- essence.json이 없으면 essence.md만으로 진행한다 (하위 호환)
```

### 변경 2: --format 플래그 추가

```markdown
## 사용법

/build-site <essence-slug> <project-slug> [--format html|react|nextjs|wordpress] "요구사항"

기본값: --format html
```

### 변경 3: 기존 Step 3 유지 + 포맷별 구체적 생성 지시 추가

**기존 Step 3a/3b/3c는 HTML 포맷의 기본 규칙으로 그대로 유지.**

포맷별 추가 Step:

```markdown
### Step 3-HTML (기본, 기존과 동일)

3a. CSS 생성 (styles.css)
- essence.json의 color → CSS custom properties (:root { --primary: #...; })
- essence.json의 typography → font-face import + heading/body 스타일
- essence.json의 layout → container max-width, section padding
- essence.json의 interaction → transition, hover, animation keyframes
- CSS reset/normalize 포함

3b. HTML 생성 (index.html)
- essence.json의 layout.sections 순서대로 섹션 구성
- semantic HTML5 (nav, main, section, footer)
- essence.json의 brand_voice를 참고하여 카피 작성 (톤, 시점, 헤드라인 패턴 반영)
- Google Fonts CDN 링크 포함
- OG/SEO 메타태그

3c. JavaScript 생성 (script.js)
- 모바일 메뉴 토글
- 스크롤 기반 네비게이션 스타일 변경
- essence.json의 interaction.scroll_effects 구현 (IntersectionObserver 기반)
- vanilla JS, 외부 라이브러리 없음

### Step 3-React (--format react)

3a. design-tokens.css 생성
- essence.json의 color/typography → CSS custom properties
- CSS reset 포함

3b. 컴포넌트 생성 (src/components/)
- essence.json의 layout.sections 각각을 JSX 컴포넌트로 생성
- 예: Hero.jsx, Features.jsx, Testimonials.jsx, Footer.jsx
- Tailwind CSS 클래스 사용 (에센스 값 매핑)
- 각 컴포넌트에 에센스의 interaction.hover_patterns 적용

3c. App.jsx + index.jsx
- 섹션 컴포넌트를 layout.sections 순서대로 조합
- brand_voice 기반 카피 삽입

3d. animations.css
- essence.json의 interaction.scroll_effects → CSS @keyframes
- Framer Motion 사용 시 해당 import 추가

3e. package.json
- react, react-dom, tailwindcss 의존성

### Step 3-NextJS (--format nextjs)

3a. globals.css + design-tokens.ts
- CSS custom properties + TypeScript 상수로 에센스 값 export

3b. app/layout.tsx
- Google Fonts (next/font) 설정
- 글로벌 스타일 import

3c. app/page.tsx
- 섹션 컴포넌트 조합 (Server Component)

3d. components/sections/*.tsx
- 각 섹션을 TypeScript React 컴포넌트로 생성
- Tailwind CSS + 에센스 컬러/타이포 매핑

3e. tailwind.config.ts
- essence.json의 color → theme.extend.colors
- essence.json의 typography → theme.extend.fontFamily

### Step 3-WordPress (--format wordpress)

3a. style.css
- WordPress 테마 헤더 주석 + 에센스 기반 스타일

3b. functions.php
- Google Fonts enqueue
- 커스텀 메뉴 등록
- 에센스의 커스텀 CSS 변수 출력

3c. templates/ (front-page.php, header.php, footer.php)
- essence.json의 layout.sections 구조 반영
- WordPress 함수 (the_title, the_content, wp_nav_menu 등) 사용
- brand_voice 기반 카피 삽입

3d. assets/css/custom.css + assets/js/interactions.js
- 추가 스타일과 인터랙션
```

### 변경 4: 브랜드 톤 기반 카피 생성 지침 추가

```markdown
### 카피 생성 규칙 (모든 포맷 공통)

essence.json의 brand_voice를 참고하여 클라이언트 맥락에 맞는 카피를 생성한다:
- **톤**: brand_voice.tone에 맞게 (authoritative → 전문적, conversational → 친근한)
- **시점**: brand_voice.perspective에 맞게 (we → "우리는...", you → "당신의...")
- **헤드라인**: brand_voice.headline_pattern.structure 패턴 따르기
- **CTA**: brand_voice.cta_style 참고하여 버튼 텍스트 작성
- **밀도**: brand_voice.copy_density에 맞게 (minimal → 핵심만, copy-heavy → 상세 설명)
- **저작권 주의**: 원본 사이트의 텍스트를 복사하지 않음. 패턴만 참고.
```

### 에센스 비종속성 원칙

생성된 코드는:
- essence.json을 런타임에 참조하지 않음
- CSS 변수/디자인 토큰으로 값이 하드코딩됨
- 에센스 없이도 독립적으로 동작
- 이후 수정/보완 시 에센스 재참조 불필요

---

## Part 4: website-builder 디렉토리 초기화

```
website-builder/
├── essences/
│   └── essence_index.md
├── projects/
│   └── .gitkeep
└── README.md
```

---

## 실행 순서

| # | 작업 | 범위 |
|---|------|------|
| 1 | p2-techvision 의존성 검사 (grep) | 확인만 |
| 2 | 에센스 파일 19개 삭제 + 디렉토리 정리 | 삭제 |
| 3 | Header, Footer, ko.json, en.json 복원 | 4개 편집 |
| 4 | p2-techvision 빌드 검증 | tsc + build |
| 5 | website-builder/ 디렉토리 초기화 | 3개 생성 |
| 6 | capture-essence SKILL.md 개선 | 1개 편집 |
| 7 | build-site SKILL.md 개선 | 1개 편집 |

---

## Verification

1. **p2-techvision 복원**
   - `grep -r "essence" src/ --include="*.ts" --include="*.tsx"` → 결과 없음
   - `pnpm tsc --noEmit` → 오류 없음
   - `pnpm build` → 성공, essence 라우트 없음

2. **capture-essence 스킬**
   - SKILL.md에 Step 1.5 (web_fetch) 존재 확인
   - SKILL.md에 Step 2e (브랜드 톤) 존재 확인
   - SKILL.md에 Step 3b (essence.json 출력) 존재 확인
   - 에센스 카테고리 4개 모두 커버: 레이아웃, 컬러/타이포, 인터랙션, 브랜드 톤

3. **build-site 스킬**
   - SKILL.md에 --format 플래그 존재 확인
   - 4개 포맷별 구체적 생성 Step 존재: HTML, React, Next.js, WordPress
   - Step 1에서 essence.json 로드 존재 확인
   - 카피 생성 규칙 존재 확인

4. **website-builder 구조**
   - `website-builder/essences/essence_index.md` 존재
   - `website-builder/projects/.gitkeep` 존재
   - `website-builder/README.md` 존재
