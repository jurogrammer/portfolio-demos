---
name: capture-essence
description: 웹페이지 URL에서 디자인 에센스(레이아웃, 컬러, 타이포, 컴포넌트 패턴)를 추출하여 구조화된 파일로 저장
user_invocable: true
---

# Capture Essence

웹페이지의 디자인 에센스를 캡처하여 `website-builder/essences/` 에 저장합니다.

## 사용법

```
/capture-essence https://example.com
```

선택적으로 slug과 태그를 지정할 수 있습니다:
```
/capture-essence https://example.com --slug modern-saas --tags saas,landing,dark
```

## 실행 절차

### Step 1: 준비
- args에서 URL을 추출한다
- slug이 지정되지 않았으면 URL의 도메인에서 자동 생성한다
- `website-builder/essences/<slug>/` 디렉토리를 생성한다
- `website-builder/essences/<slug>/screenshots/` 디렉토리를 생성한다

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

### Step 2: Chrome MCP로 페이지 분석

**2a. 페이지 접속 & 전체 스크린샷**
- `tabs_context_mcp` (createIfEmpty: true) 로 탭 확인
- `tabs_create_mcp` 로 새 탭 생성
- `navigate` 로 URL 접속
- `computer` (action: wait, duration: 3) 로 로딩 대기
- `computer` (action: screenshot, save_to_disk: true) 로 전체 스크린샷 → screenshots/full-page.png 에 저장

**2b. 페이지 구조 파악**
- `read_page` (filter: all) 로 accessibility tree 읽기 → 전체 섹션 구조 파악
- `get_page_text` 로 텍스트 콘텐츠 추출

**2c. 스타일 추출 (JavaScript)**
- `javascript_tool` 로 다음 정보를 추출:

```javascript
// 컬러 팔레트 추출
(function() {
  const elements = document.querySelectorAll('*');
  const colors = new Set();
  const bgColors = new Set();
  const fonts = new Set();
  const fontSizes = new Map();

  elements.forEach(el => {
    const style = getComputedStyle(el);
    if (style.color && style.color !== 'rgba(0, 0, 0, 0)') colors.add(style.color);
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') bgColors.add(style.backgroundColor);
    if (style.fontFamily) fonts.add(style.fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
    const tag = el.tagName;
    if (['H1','H2','H3','H4','H5','H6','P','A','SPAN','BUTTON'].includes(tag)) {
      fontSizes.set(tag + ':' + style.fontSize + ':' + style.fontWeight, {
        tag, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight, fontFamily: style.fontFamily.split(',')[0].trim()
      });
    }
  });

  return JSON.stringify({
    textColors: [...colors].slice(0, 10),
    bgColors: [...bgColors].slice(0, 10),
    fonts: [...fonts].slice(0, 5),
    typography: [...fontSizes.values()].slice(0, 15)
  }, null, 2);
})()
```

```javascript
// 레이아웃 & 간격 추출
(function() {
  const body = document.body;
  const bodyStyle = getComputedStyle(body);
  const sections = document.querySelectorAll('section, [class*="section"], main > div, header, footer, nav');
  const sectionInfo = [];

  sections.forEach((s, i) => {
    const style = getComputedStyle(s);
    const rect = s.getBoundingClientRect();
    sectionInfo.push({
      index: i,
      tag: s.tagName,
      className: s.className?.toString().slice(0, 80) || '',
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      padding: style.padding,
      margin: style.margin,
      display: style.display,
      maxWidth: style.maxWidth
    });
  });

  const container = document.querySelector('[class*="container"], [class*="wrapper"], main');
  const containerStyle = container ? getComputedStyle(container) : null;

  return JSON.stringify({
    bodyBg: bodyStyle.backgroundColor,
    containerMaxWidth: containerStyle?.maxWidth || 'none',
    sections: sectionInfo.slice(0, 20)
  }, null, 2);
})()
```

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

**2d. 주요 섹션 스크린샷**
- accessibility tree를 기반으로 주요 섹션(nav, hero, features, footer 등)을 식별
- 각 섹션의 위치를 파악하여 `computer` (action: zoom, region: [...]) 로 섹션별 스크린샷 캡처
- 각각 screenshots/ 에 저장 (nav.png, hero.png, features.png, footer.png 등)

**2e. 브랜드 톤 & 카피 분석**
- Step 2b의 `get_page_text` 결과 + Step 1.5d의 헤드라인/CTA 텍스트를 종합하여:
  - 헤드라인(H1~H3) 문장 구조 패턴 분류 (imperative / question / bold-statement / metaphor)
  - CTA 버튼 텍스트의 톤 분류 (urgent / inviting / confident)
  - 전체 텍스트 시점 분석 (we / you / third-person)
  - 반복 키워드 추출 (3회 이상 등장하는 핵심 단어)
  - 카피 밀도 판단: 섹션당 평균 텍스트 양 기준 (minimal / balanced / copy-heavy)
  - 소셜 프루프 유형 감지 (로고 그리드, 인용문, 수치 카운터, 케이스 스터디 카드)

### Step 3: 에센스 문서 생성

추출한 데이터를 종합하여 `website-builder/essences/<slug>/essence.md` 파일을 생성한다.

**파일 스키마:**

```markdown
---
name: <사이트 이름 또는 스타일 설명>
source_url: <원본 URL>
captured_date: <YYYY-MM-DD>
tags: [tag1, tag2, tag3]
---

## 전체 인상
한 문장 요약 + 분위기/톤 설명 (스크린샷 기반 주관적 평가)

## 레이아웃 구조
- 전체 구성: (예: nav → hero → features grid → testimonials → CTA → footer)
- 컨테이너 최대 너비: (추출된 max-width)
- 섹션 간 간격: (추출된 padding/margin 패턴)
- 그리드 시스템: CSS Grid / Flexbox (추출된 display 속성 기반)

## 컬러 팔레트
| 역할 | 값 | 용도 |
|------|-----|------|
| Primary | #hex | 용도 설명 |
| Background | #hex | 메인 배경 |
| ... | ... | ... |

## 타이포그래피
| 요소 | 폰트 | 사이즈 | 굵기 | 행간 |
|------|-------|--------|------|------|
| H1 | ... | ...px | ... | ... |
| ... | ... | ... | ... | ... |

## 컴포넌트 패턴

### Navigation
- 유형, 로고 위치, 메뉴 스타일, 모바일 대응

### Hero 섹션
- 레이아웃 구성, CTA 배치

### 카드/Feature
- 그리드 구성, 카드 스타일

### Footer
- 컬럼 수, 소셜 링크 배치

## 인터랙션 & 애니메이션
- 관찰된 hover/scroll/transition 효과

## 반응형 전략
- 브레이크포인트, 모바일 변화 요약

## 특이사항 & 디자인 언어
- 이 사이트를 특별하게 만드는 디테일

## 브랜드 톤 & 카피
- 전체 톤: (authoritative / conversational / playful / provocative / poetic)
- 시점: (we / you / third-person)
- 헤드라인 패턴: 구조, 길이, 예시
- CTA 스타일: 텍스트, 톤, 시각적 유형 (filled/ghost/text-link)
- 카피 밀도: (minimal / balanced / copy-heavy)
- 소셜 프루프: (logos / quotes / metrics / case-study-cards)
- 핵심 키워드: [word1, word2, ...]
```

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

### Step 4: 인덱스 업데이트

`website-builder/essences/essence_index.md` 의 테이블에 새 행을 추가한다:

```
| <slug> | <name> | <tags> | <source_url> | <date> |
```

### Step 5: 완료 보고

- 저장된 파일 경로 안내
- 에센스 요약 출력 (전체 인상 + 컬러 팔레트 + 주요 컴포넌트)
- 사용한 탭을 정리 (tabs_close_mcp)

## 주의사항
- 로그인이 필요한 페이지는 캡처할 수 없다 — 공개 페이지만 가능
- SPA(Single Page Application)는 초기 로딩 후 충분히 대기해야 한다
- 스크린샷 파일은 git에 포함되므로 용량에 주의한다
- 추출된 폰트가 Google Fonts에 있는지 확인하여 essence.md에 CDN 링크를 기록한다
