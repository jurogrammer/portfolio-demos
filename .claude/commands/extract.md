---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Extract design essence from a URL into DTCG tokens + brief
argument-hint: <url>
---

## Design Essence Extraction v3

Target URL: $ARGUMENTS

---

### PATH 1 — Dembrandt Accelerator (optional)
Try rapid token extraction:
```bash
cd /Users/user/Projects/portfolio-demos/design-essence && npx dembrandt $ARGUMENTS --dtcg --save-output 2>/dev/null
```
If succeeds, save output to `design-essence/tokens/extracted/<domain>/dembrandt.json`.
If fails, skip — Claude extraction covers this.

---

### PATH 2 — Full Claude Analysis (always runs)

#### Step 1: Page-Level Capture
1. Navigate to $ARGUMENTS via browser MCP
2. Wait for full load (3s minimum — Wix/SPA 사이트는 더 오래 기다릴 것)
3. Take full-page screenshot → `design-essence/tokens/extracted/<domain>/screenshots/full-page.png`
4. Get page snapshot for structural analysis

#### Step 2: Section Segmentation
1. Run JavaScript to identify all top-level sections:
```javascript
Array.from(document.querySelectorAll('header, nav:not(header nav), [role="banner"], main > section, main > div, main > article, [role="main"] > section, [role="main"] > div, footer, [role="contentinfo"]'))
  .filter(el => el.offsetHeight > 50)
  .map((el, i) => ({
    index: i,
    tag: el.tagName.toLowerCase(),
    className: el.className,
    id: el.id,
    bounds: el.getBoundingClientRect(),
    childCount: el.children.length
  }))
```

**Wix/SPA 사이트 대응**: 위 쿼리로 1~2개만 나오면, 아래 순서로 드릴다운:
```javascript
// 1) Wix: .wixui-section
// 2) 일반 SPA: [data-section], [class*="section"], [class*="Section"]
// 3) 최후: body > div의 직계 자식 중 height > 200px 인 것들
```

2. For each identified section, create `design-essence/tokens/extracted/<domain>/sections/S{XX}-{name}/`:
   - **screenshot.png**: 해당 섹션으로 스크롤 → 브라우저 스크린샷 캡처
   - **snapshot.html**: `element.outerHTML` 추출
   - **computed.css**: 섹션 래퍼의 computed styles 추출

---

#### Step 3: ★ 내부 요소 분해 (Inner Element Decomposition) — v3 신규

**이 단계가 가장 중요합니다.** 섹션 래퍼의 CSS는 대부분 의미 없습니다 (특히 Wix/빌더 사이트).
실제 디자인은 **내부 요소**에 있습니다.

각 섹션에 대해, 아래 JavaScript로 **핵심 시각 요소**를 식별하고 스타일을 추출합니다:

```javascript
function extractInnerElements(sectionEl) {
  const elements = [];

  // 1) 반복 패턴 감지 (카드, 리스트 아이템 등)
  //    - 같은 부모 아래 같은 태그/클래스가 2개 이상이면 = 반복 패턴
  const findRepeatingPatterns = (parent) => {
    const childMap = new Map();
    Array.from(parent.children).forEach(child => {
      const key = child.tagName + '.' + (child.className?.split(' ')[0] || '');
      if (!childMap.has(key)) childMap.set(key, []);
      childMap.get(key).push(child);
    });
    return [...childMap.entries()].filter(([, items]) => items.length >= 2);
  };

  // 2) 반복 패턴의 첫 번째 아이템에서 스타일 추출
  const patterns = findRepeatingPatterns(sectionEl);
  // 깊이 2~3까지 탐색
  if (patterns.length === 0) {
    Array.from(sectionEl.children).forEach(child => {
      const subPatterns = findRepeatingPatterns(child);
      patterns.push(...subPatterns);
    });
  }

  patterns.forEach(([key, items]) => {
    const el = items[0]; // 대표 아이템
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    elements.push({
      type: 'repeating_item',
      count: items.length,
      selector: key,
      bounds: { width: Math.round(r.width), height: Math.round(r.height) },
      styles: {
        display: s.display, flexDirection: s.flexDirection,
        gap: s.gap, padding: s.padding, margin: s.margin,
        background: s.background?.substring(0, 200),
        backgroundColor: s.backgroundColor,
        backgroundImage: s.backgroundImage?.substring(0, 200),
        borderRadius: s.borderRadius, boxShadow: s.boxShadow,
        border: s.border, overflow: s.overflow,
        width: s.width, maxWidth: s.maxWidth,
      }
    });
  });

  // 3) 단일 요소: 큰 이미지, CTA 버튼, 제목
  sectionEl.querySelectorAll('h1,h2,h3').forEach(el => {
    const s = getComputedStyle(el);
    elements.push({
      type: 'heading',
      text: el.textContent.trim().substring(0, 50),
      styles: {
        fontSize: s.fontSize, fontWeight: s.fontWeight,
        fontFamily: s.fontFamily?.substring(0, 80),
        color: s.color, letterSpacing: s.letterSpacing,
        textAlign: s.textAlign, lineHeight: s.lineHeight,
        fontStyle: s.fontStyle,
      }
    });
  });

  // 4) 컨테이너/래퍼 레이아웃 (실제 flex/grid parent)
  sectionEl.querySelectorAll('[style*="display"], [class]').forEach(el => {
    const s = getComputedStyle(el);
    if ((s.display === 'flex' || s.display === 'grid') && el.children.length >= 2) {
      const r = el.getBoundingClientRect();
      if (r.width > 200 && r.height > 50) {
        elements.push({
          type: 'layout_container',
          childCount: el.children.length,
          bounds: { width: Math.round(r.width), height: Math.round(r.height) },
          styles: {
            display: s.display, flexDirection: s.flexDirection,
            flexWrap: s.flexWrap, justifyContent: s.justifyContent,
            alignItems: s.alignItems, gap: s.gap,
            gridTemplateColumns: s.gridTemplateColumns,
            maxWidth: s.maxWidth, padding: s.padding,
          }
        });
      }
    }
  });

  return elements;
}
```

각 섹션별 결과를 `sections/S{XX}-{name}/inner-elements.json`에 저장합니다.

**inner-elements.json 스키마:**
```json
{
  "section_id": "S02",
  "section_name": "quick-links",
  "inner_elements": [
    {
      "type": "layout_container",
      "childCount": 4,
      "bounds": { "width": 1200, "height": 220 },
      "styles": {
        "display": "flex",
        "gap": "20px",
        "maxWidth": "1200px",
        "padding": "0 40px"
      }
    },
    {
      "type": "repeating_item",
      "count": 4,
      "selector": "div.card",
      "bounds": { "width": 270, "height": 200 },
      "styles": {
        "borderRadius": "12px",
        "backgroundImage": "url(...)",
        "boxShadow": "0 2px 8px rgba(0,0,0,0.1)",
        "overflow": "hidden"
      }
    },
    {
      "type": "heading",
      "text": "주일예배",
      "styles": {
        "fontSize": "28px",
        "fontWeight": "700",
        "fontFamily": "Avenir Heavy",
        "color": "rgb(255, 255, 255)",
        "letterSpacing": "0.02em"
      }
    }
  ]
}
```

---

#### Step 4: Generate section-map.json
Create `design-essence/tokens/extracted/<domain>/section-map.json`:
```json
{
  "domain": "<domain>",
  "source_url": "<url>",
  "captured_date": "<ISO date>",
  "total_sections": "<N>",
  "viewport": { "width": 1440, "height": 900 },
  "sections": [
    {
      "id": "S01",
      "name": "<descriptive-name>",
      "selector": "<CSS selector used>",
      "bounds": { "top": "<px>", "left": "<px>", "width": "<px>", "height": "<px>" },
      "layout_type": "full-bleed | contained | grid | flex-row | flex-col | stacked",
      "content_slots": [
        { "role": "<role>", "type": "text|image|text_list", "count": "<N if list>", "sample": "<original text>" }
      ],
      "files": {
        "screenshot": "sections/S01-<name>/screenshot.png",
        "html": "sections/S01-<name>/snapshot.html",
        "css": "sections/S01-<name>/computed.css",
        "inner_elements": "sections/S01-<name>/inner-elements.json"
      }
    }
  ]
}
```

**layout_type 필드 (v3 신규)**:
- `full-bleed`: 카드/컨테이너 없이 전체 너비 채움
- `contained`: max-width 컨테이너 안에 콘텐츠 배치
- `grid`: CSS Grid로 반복 아이템 배치
- `flex-row`: 가로 Flex로 아이템 나열
- `flex-col`: 세로 Flex 스택
- `card-grid`: 카드 UI (border-radius + shadow + bg)가 있는 그리드

---

#### Step 5: Generate content-template.md
Auto-generate `design-essence/tokens/extracted/<domain>/content-template.md` from section-map.

For each section, include section ID, name, each content_slot as fill-in field, sample text in comments.

---

#### Step 6: Full Essence Extraction
1. Extract computed styles via JavaScript:
   - Colors: all CSS custom properties + computed background/text colors
   - Typography: font families, sizes, weights, line-heights
   - Spacing: max-width, padding, gap values
2. Produce `design-essence/tokens/extracted/<domain>/essence.json` with schema:
   - meta, color, typography, layout, interaction, brand_voice
3. Create `design-essence/briefs/<domain>/brief.json`

---

### POST-PROCESSING
1. Run: `cd /Users/user/Projects/portfolio-demos/design-essence && node scripts/normalize-tokens.js tokens/extracted/<domain>/`
2. Run: `cd /Users/user/Projects/portfolio-demos/design-essence && node scripts/build-tokens.js`
3. Report extraction summary:
   - # colors, fonts, spacing values
   - # sections extracted with section names
   - # inner elements extracted per section
   - "다음 단계: content-template.md를 채우고 `/map <domain>` 실행"
