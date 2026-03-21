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

**2d. 주요 섹션 스크린샷**
- accessibility tree를 기반으로 주요 섹션(nav, hero, features, footer 등)을 식별
- 각 섹션의 위치를 파악하여 `computer` (action: zoom, region: [...]) 로 섹션별 스크린샷 캡처
- 각각 screenshots/ 에 저장 (nav.png, hero.png, features.png, footer.png 등)

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
```

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
