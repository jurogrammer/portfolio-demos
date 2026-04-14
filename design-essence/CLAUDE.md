# Design Essence Extractor & Generator v3

Design token extraction, content mapping, code generation, and self-correction pipeline.

---

## System Overview (v3)

v3 fixes critical issues from v2: **inner element decomposition**, **screenshot-first generation**, and **structural verification**.

### v2 → v3 변경 이유
v2는 섹션 래퍼의 computed.css만 추출했으나, 실제 디자인은 내부 요소(카드, 그리드, 버튼)에 있음.
결과적으로 card-grid ↔ full-bleed, 배경 이미지 ↔ 솔리드 그라디언트 등 구조적 오류가 빈번했음.

### v3 핵심 추가사항
1. **Extract**: `inner-elements.json` — 섹션 내부의 반복 요소, 레이아웃 컨테이너, 제목 스타일 추출
2. **Generate**: Screenshot-First Workflow — 스크린샷 관찰 → 시각 분석 텍스트 작성 → 코드 생성
3. **Verify**: 구조적 편차 체크리스트 — "비슷해 보인다" 금지, CSS 속성 수준에서 1:1 비교

```
Phase 1: EXTRACT              Phase 2: MAP               Phase 3: GENERATE           Phase 4: VERIFY
─────────────────            ──────────────              ────────────────            ──────────────

URL                          content.md                  section-map.json            dev server start
 │                            (user provides)            + content-map.json           │
 ├─ full-page screenshot      │                          + variables.css              ├─ screenshot generated
 ├─ DOM snapshot              ├─ AI auto-maps to         + per-section:               ├─ compare vs original
 ├─ section segmentation      │  section slots             - screenshot.png             (section-by-section)
 │   ├─ S01-header/           ├─ handles mismatch          - computed.css             │
 │   │   ├─ screenshot.png    │  (omit/merge/split)        - snapshot.html            ├─ score < 80?
 │   │   ├─ snapshot.html     │                            │                          │   ├─ identify deviations
 │   │   ├─ computed.css      └─► content-map.json         ├─ per-section generate    │   ├─ fix code
 │   │   └─ metadata.json                                  │  (screenshot as ref)     │   └─ re-verify (max 3x)
 │   ├─ S02-hero/                                          ├─ anti-generic rules      │
 │   └─ ...                                                └─► complete project       └─► verification-report
 ├─ essence.json                                                                          + final screenshot
 ├─ brief.json
 └─ section-map.json
     + content-template.md
```

---

## Available Commands

| Command | Phase | Description |
|---|---|---|
| `/extract <url>` | 1 | Extract design essence with section-level snapshots + auto-generate content template |
| `/map <domain>` | 2 | Map user content (content.md) to design sections → content-map.json |
| `/generate <domain> <project>` | 3 | Generate code section-by-section with anti-genericization rules |
| `/verify <project>` | 4 | Screenshot comparison + auto-correction loop (max 3 iterations) |
| `/preview <domain>` | — | Display token + brief summary |

### End-to-End Workflow

```
1. /extract https://example.com          → section-map + content-template.md
2. (사용자가 content-template.md 편집)     → content.md
3. /map example-com                       → content-map.json
4. /generate example-com my-project       → Next.js 프로젝트
5. /verify my-project                     → 자가 수정 → 최종 리포트
```

---

## Token Architecture

### Primitive tokens (`tokens/primitive/`)

Raw design values — no references, concrete values only.

| File | Token namespace | Example key |
|---|---|---|
| `colors.json` | `color.*` | `color.primary`, `color.bg-main`, `color.text-heading` |
| `typography.json` | `font.*` | `font.family.heading`, `font.size.h1`, `font.weight.bold` |
| `spacing.json` | `spacing.*` | `spacing.container-max` |

### Semantic tokens (`tokens/semantic/`)

Aliases that reference primitives via `{token.path}` syntax.

| File | Token namespace | Example |
|---|---|---|
| `colors.json` | `semantic.color.*` | `semantic.color.surface.default → {color.bg-main}` |
| `typography.json` | `semantic.font.*` | `semantic.font.family.display → {font.family.heading}` |

**v2 scope**: Primitive + Semantic only. No component-level tokens.

---

## Section-Level Extraction (v3)

Each extracted domain now includes per-section data with **inner element decomposition**:

```
tokens/extracted/<domain>/
├── essence.json                    ← full design data
├── section-map.json                ← section registry with content_slots + layout_type
├── content-template.md             ← auto-generated fill-in template
├── screenshots/full-page.png
└── sections/
    ├── S01-header/
    │   ├── screenshot.png          ← section visual reference
    │   ├── snapshot.html           ← section outerHTML
    │   ├── computed.css            ← section wrapper computed styles
    │   ├── inner-elements.json     ← ★ v3: 내부 요소 스타일 (카드, 그리드, 버튼 등)
    │   └── metadata.json           ← bounds, content slots
    └── S02-hero/
        └── ...
```

### inner-elements.json (v3 신규)
섹션 래퍼가 아닌 **실제 시각 요소**의 CSS를 추출:
- `repeating_item`: 반복 카드/아이템의 border-radius, background, boxShadow, size
- `layout_container`: flex/grid parent의 display, gap, maxWidth, gridTemplateColumns
- `heading`: 제목의 fontFamily, fontSize, fontWeight, letterSpacing

### section-map.json Schema

```json
{
  "domain": "string",
  "source_url": "string",
  "total_sections": "number",
  "viewport": { "width": 1440, "height": 900 },
  "sections": [{
    "id": "S01",
    "name": "header",
    "selector": "header.site-header",
    "bounds": { "top": 0, "left": 0, "width": 1440, "height": 80 },
    "content_slots": [
      { "role": "logo", "type": "image|text|text_list", "count": 1, "sample": "..." }
    ],
    "files": {
      "screenshot": "sections/S01-header/screenshot.png",
      "html": "sections/S01-header/snapshot.html",
      "css": "sections/S01-header/computed.css"
    }
  }]
}
```

---

## Content Mapping (v2 New)

### content-map.json Schema

```json
{
  "domain": "string",
  "project": "string",
  "mappings": [{
    "section_id": "S01",
    "section_name": "header",
    "mapping_type": "direct|omit|merge|split",
    "slots": {
      "logo": { "value": "My Brand", "type": "text", "placeholder": false }
    }
  }],
  "unmapped_sections": ["S05"],
  "stats": { "total_sections": 8, "mapped": 6, "omitted": 1, "placeholder": 1 }
}
```

---

## Anti-Genericization Rules (v3)

When generating code, these rules MUST be followed:

### DO NOT:
- Add card wrappers (rounded corners + white bg + shadow) unless original has them
- Add `border-radius` when original shows `0`
- Add `box-shadow` when original shows `none`
- Replace `background: transparent` or image overlays with solid white/gray
- Contain full-bleed images in `max-width` containers
- "Improve" or "modernize" the original design in any way
- **Remove card UI when original has it** (역방향 일반화도 금지)
- **Replace background images with solid gradients** (배경 이미지 → 솔리드 변환 금지)
- **Change serif → sans-serif or vice versa** (폰트 계열 변경 금지)

### MUST:
- ★ View `screenshot.png` FIRST, write visual analysis BEFORE coding
- Use `inner-elements.json` values as hard constraints for inner element styles
- Use `computed.css` for section wrapper styles
- Maintain `snapshot.html` DOM structure
- When in doubt, keep the original as-is

### 흔한 AI 실수 방지 체크리스트:
| 원본 | AI가 자주 하는 실수 | 올바른 처리 |
|---|---|---|
| 카드 사이 gap + border-radius | full-bleed 리본으로 변환 | gap + border-radius 유지 |
| 배경 이미지 + 오버레이 | 솔리드 그라디언트만 | 이미지 + CSS overlay |
| 영문 세리프(명조) 폰트 | 산세리프(고딕)로 대체 | serif 폰트 적용 |
| max-width 컨테이너 | width: 100% full-bleed | max-width 유지 |

---

## Self-Correction Loop (v3)

The `/verify` command implements **구조적 편차 체크리스트** (자기 채점 금지):

1. Start dev server
2. For each section: 원본 스크린샷 + 생성물 스크린샷 캡처
3. **구조적 편차 체크리스트** 작성 (8개 항목, CSS 속성 수준 1:1 비교):
   - Layout Type (full-bleed vs contained vs card-grid)
   - Gap, Border Radius, Background 처리
   - Container 너비, Typography (serif/sans-serif)
   - Vertical Rhythm, Depth (shadow)
4. 체크리스트 기반 점수 산정 (Layout Type 불일치 = 즉시 0점)
5. Auto-fix (max 3 iterations) using inner-elements.json as reference
6. Output `verification/report.json` with checklist results

Pass threshold: **70/100** (구조적 비교가 더 엄격하므로 하향)

### 즉시 실패 조건:
- Layout Type 완전 불일치 (card-grid → full-bleed)
- 원본에 카드 UI가 있는데 생성물에 없음 (또는 반대)
- 원본이 contained인데 생성물이 full-bleed (또는 반대)

---

## Tailwind v4 @theme Integration

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: var(--color-primary);
  --color-accent: var(--color-accent);
  --color-bg-main: var(--color-bg-main);
  --color-text-heading: var(--color-text-heading);
  --color-text-body: var(--color-text-body);
  --font-heading: var(--font-family-heading);
  --font-body: var(--font-family-body);
}
```

Import generated CSS:
```css
@import "../../../design-essence/build/css/variables.css";
```

---

## Code Generation Rules

1. **Never hardcode design values.** Use CSS custom properties (`var(--*)`).
2. **Use Tailwind utility classes** mapped to `@theme` tokens.
3. **Respect section order** from section-map.json.
4. **Apply brand_voice** from brief.json for placeholder copy.
5. **Output path**: `design-essence/output/<project>/`

---

## brief.json Schema

```jsonc
{
  "meta": { "name": "string", "source_url": "string", "captured_date": "string" },
  "layout": {
    "pattern": "string",
    "sections": [{ "name": "string", "height_ratio": "string", "content_alignment": "string" }],
    "max_width": "string",
    "whitespace_density": "compact|comfortable|spacious"
  },
  "interaction": {
    "scroll_effects": [{ "type": "string", "trigger": "string" }],
    "hover_patterns": { "buttons": "string", "cards": "string" },
    "transition_defaults": "string"
  },
  "brand_voice": {
    "tone": "string",
    "formality": "formal|casual|neutral",
    "copy_patterns": ["string"],
    "imagery_style": "string"
  }
}
```

---

## Auto-rebuild Hook

Writing to `tokens/primitive/` or `tokens/semantic/` triggers `build-tokens.js` via PostToolUse hook. CSS is immediately available at `build/css/variables.css`.

---

## Current Design Essences

| Domain | Extracted | Sections | Inner Elements | Brief | Tokens Built |
|---|---|---|---|---|---|
| `president-go-kr` | v1 | - | - | v1 | v1 |
| `hyesung-or-kr` | v2 | 10 | 미완 (v3 필요) | v2 | v2 |
