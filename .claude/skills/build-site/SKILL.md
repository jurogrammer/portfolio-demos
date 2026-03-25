---
name: build-site
description: 저장된 디자인 에센스를 기반으로 웹사이트를 생성하고 Preview 서버로 검증 (html/react/nextjs/wordpress 포맷 지원)
user_invocable: true
---

# Build Site

저장된 에센스를 기반으로 클라이언트용 웹사이트를 생성합니다.

## 사용법

```
/build-site <essence-slug> <project-slug> [--format html|react|nextjs|wordpress] "요구사항"
```

기본값: --format html

예시:
```
/build-site modern-saas acme-landing
/build-site modern-saas acme-landing --format react "회사 소개 랜딩페이지"
/build-site modern-saas acme-landing --format nextjs "SaaS 랜딩페이지, 섹션: hero, 기능, 가격, 문의"
```

클라이언트 요구사항을 함께 전달할 수도 있습니다:
```
/build-site modern-saas acme-landing "회사 소개 랜딩페이지, 섹션: hero, 서비스 소개, 팀, 문의"
```

## 실행 절차

### Step 1: 입력 확인 & 에센스 로드

- args에서 essence-slug, project-slug, --format 플래그, 추가 요구사항을 파싱한다
- `website-builder/essences/<essence-slug>/essence.json` 을 읽어 구조화된 에센스 데이터를 로드한다
- `website-builder/essences/<essence-slug>/essence.md` 를 읽어 정성적 컨텍스트로 활용한다
- `website-builder/essences/<essence-slug>/screenshots/` 의 스크린샷들을 시각적 레퍼런스로 활용한다
- essence.json이 없으면 essence.md만으로 진행한다 (하위 호환)
- 에센스가 없으면 `website-builder/essences/essence_index.md`에서 사용 가능한 에센스 목록을 보여주고 선택을 요청한다

### Step 2: 프로젝트 설정

- `website-builder/projects/<project-slug>/` 디렉토리를 생성한다
- `website-builder/projects/<project-slug>/site/` 디렉토리를 생성한다
- `website-builder/projects/<project-slug>/site/assets/` 디렉토리를 생성한다
- 사용자가 추가 요구사항을 전달한 경우, `brief.md` 에 기록한다
- 추가 요구사항이 없으면 사용자에게 AskUserQuestion으로 다음을 질문한다:
  - 사이트 목적 (랜딩페이지, 포트폴리오, 회사소개 등)
  - 필요한 섹션들
  - 텍스트 콘텐츠 (회사명, 슬로건, 서비스 목록 등)
  - 이미지 요구사항 (플레이스홀더 사용 vs 실제 이미지 제공)

### Step 3: 사이트 코드 생성

에센스의 각 항목을 코드로 변환한다. --format 플래그에 따라 해당 섹션을 실행한다.

### Step 3-HTML (기본, --format html)

**3a. CSS 생성 (`styles.css`)**
- essence.json의 color → CSS custom properties (`:root { --primary: #...; }`)
- essence.json의 typography → font-face import + heading/body 스타일
- essence.json의 layout → container max-width, section padding
- essence.json의 interaction → transition, hover, animation keyframes
- CSS reset/normalize 포함

**3b. HTML 생성 (`index.html`)**
- essence.json의 layout.sections 순서대로 섹션 구성
- semantic HTML5 태그 사용 (nav, main, section, footer)
- essence.json의 brand_voice를 참고하여 카피 작성 (톤, 시점, 헤드라인 패턴 반영)
- 클라이언트 콘텐츠를 해당 위치에 삽입
- 이미지: 클라이언트 제공 이미지가 없으면 placeholder 사용 (https://placehold.co/)
- Google Fonts CDN 링크 포함
- Open Graph / SEO 기본 메타태그 포함
- favicon 플레이스홀더

**3c. JavaScript 생성 (`script.js`)**
- 모바일 햄버거 메뉴 토글
- 스크롤 기반 네비게이션 스타일 변경
- essence.json의 interaction.scroll_effects 구현 (IntersectionObserver 기반)
- vanilla JS, 외부 라이브러리 없음

### Step 3-React (--format react)

**3a. design-tokens.css 생성**
- essence.json의 color/typography → CSS custom properties
- CSS reset 포함

**3b. 컴포넌트 생성 (`src/components/`)**
- essence.json의 layout.sections 각각을 JSX 컴포넌트로 생성
- 예: Hero.jsx, Features.jsx, Testimonials.jsx, Footer.jsx
- Tailwind CSS 클래스 사용 (에센스 값 매핑)
- 각 컴포넌트에 에센스의 interaction.hover_patterns 적용

**3c. App.jsx + index.jsx**
- 섹션 컴포넌트를 layout.sections 순서대로 조합
- brand_voice 기반 카피 삽입

**3d. animations.css**
- essence.json의 interaction.scroll_effects → CSS @keyframes
- Framer Motion 사용 시 해당 import 추가

**3e. package.json**
- react, react-dom, tailwindcss 의존성

### Step 3-NextJS (--format nextjs)

**3a. globals.css + design-tokens.ts**
- CSS custom properties + TypeScript 상수로 에센스 값 export

**3b. app/layout.tsx**
- Google Fonts (next/font) 설정
- 글로벌 스타일 import

**3c. app/page.tsx**
- 섹션 컴포넌트 조합 (Server Component)

**3d. components/sections/*.tsx**
- 각 섹션을 TypeScript React 컴포넌트로 생성
- Tailwind CSS + 에센스 컬러/타이포 매핑

**3e. tailwind.config.ts**
- essence.json의 color → theme.extend.colors
- essence.json의 typography → theme.extend.fontFamily

### Step 3-WordPress (--format wordpress)

**3a. style.css**
- WordPress 테마 헤더 주석 + 에센스 기반 스타일

**3b. functions.php**
- Google Fonts enqueue
- 커스텀 메뉴 등록
- 에센스의 커스텀 CSS 변수 출력

**3c. templates/ (front-page.php, header.php, footer.php)**
- essence.json의 layout.sections 구조 반영
- WordPress 함수 (the_title, the_content, wp_nav_menu 등) 사용
- brand_voice 기반 카피 삽입

**3d. assets/css/custom.css + assets/js/interactions.js**
- 추가 스타일과 인터랙션

### 카피 생성 규칙 (모든 포맷 공통)

essence.json의 brand_voice를 참고하여 클라이언트 맥락에 맞는 카피를 생성한다:
- **톤**: brand_voice.tone에 맞게 (authoritative → 전문적, conversational → 친근한)
- **시점**: brand_voice.perspective에 맞게 (we → "우리는...", you → "당신의...")
- **헤드라인**: brand_voice.headline_pattern.structure 패턴 따르기
- **CTA**: brand_voice.cta_style 참고하여 버튼 텍스트 작성
- **밀도**: brand_voice.copy_density에 맞게 (minimal → 핵심만, copy-heavy → 상세 설명)
- **저작권 주의**: 원본 사이트의 텍스트를 복사하지 않음. 패턴만 참고.

### 에센스 비종속성 원칙

생성된 코드는:
- essence.json을 런타임에 참조하지 않음
- CSS 변수/디자인 토큰으로 값이 하드코딩됨
- 에센스 없이도 독립적으로 동작
- 이후 수정/보완 시 에센스 재참조 불필요

### Step 4: Preview 서버로 검증

**4a. 서버 시작**
- `preview_start` (name: "website-preview") 로 개발 서버 시작
- 서버가 시작되면 해당 프로젝트의 index.html을 preview로 확인

**4b. 시각적 검증**
- `preview_screenshot` 로 생성된 사이트 스크린샷 촬영
- 에센스의 스크린샷과 비교하여 차이점 식별
- `preview_inspect` 로 주요 요소의 CSS 속성이 에센스와 일치하는지 확인:
  - 컬러 값
  - 폰트 사이즈/굵기
  - 간격 (padding/margin)
  - border-radius

**4c. 반응형 검증**
- `preview_resize` (preset: mobile) → 모바일 스크린샷
- `preview_resize` (preset: tablet) → 태블릿 스크린샷
- `preview_resize` (preset: desktop) → 데스크톱 복원

**4d. 수정 반복**
- 차이점이 발견되면 CSS/HTML을 수정하고 다시 검증
- 사용자에게 스크린샷을 보여주고 피드백 요청
- 피드백 반영 후 재검증

### Step 5: 최종 산출물

- 모든 검증이 완료되면 사용자에게 최종 확인 요청
- 산출물 구조 안내:

```
website-builder/projects/<project-slug>/site/
├── index.html          ← 메인 페이지
├── styles.css          ← 스타일시트
├── script.js           ← 인터랙션
└── assets/             ← 이미지/아이콘
```

- 배포 방법 안내:
  - **직접 호스팅**: 파일을 웹서버에 업로드
  - **Netlify**: `site/` 폴더를 drag & drop
  - **Vercel**: `vercel` CLI로 배포
  - **Cafe24 등**: FTP로 업로드
  - **GitHub Pages**: repo에 push

## 산출물 품질 기준

- [ ] 에센스의 컬러 팔레트가 정확히 반영됨
- [ ] 에센스의 타이포그래피가 반영됨 (폰트, 사이즈, 굵기)
- [ ] 에센스의 레이아웃 구조가 동일한 순서/비율로 구현됨
- [ ] 에센스의 컴포넌트 패턴이 시각적으로 유사함
- [ ] 반응형이 모바일/태블릿/데스크톱에서 정상 동작
- [ ] 외부 의존성 없이 정적 파일만으로 동작 (Google Fonts CDN 제외)
- [ ] semantic HTML + 접근성 기본 준수
- [ ] 페이지 로딩 속도 양호 (무거운 JS 프레임워크 없음)

## 주의사항
- 이미지는 반드시 클라이언트가 제공하거나 라이선스 프리 소스를 사용
- 에센스의 원본 사이트 텍스트/이미지를 그대로 복사하지 않음 (저작권)
- 생성된 코드에 원본 사이트 URL이나 브랜드명을 포함하지 않음
- multi-page 사이트는 추가 HTML 파일로 확장 가능 (about.html, contact.html 등)
