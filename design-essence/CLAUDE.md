# Design Essence Extractor & Generator

Design token extraction, normalization, and code generation pipeline for portfolio-demos.

---

## System Overview

The pipeline follows a **dual-path** approach for every design source:

```
URL / Screenshot
       │
       ├─ PATH 1 (optional): npx dembrandt <url> --dtcg
       │       └─► tokens/extracted/<domain>/dembrandt.json
       │
       └─ PATH 2 (always): Playwright MCP + Claude analysis
               └─► tokens/extracted/<domain>/essence.json   ← raw design data
               └─► briefs/<domain>/brief.json               ← layout/interaction/brand
               └─► tokens/extracted/<domain>/screenshots/   ← visual reference

                        │
                        ▼
              scripts/normalize-tokens.js
                        │
          ┌─────────────┴──────────────┐
          ▼                            ▼
  tokens/primitive/           tokens/semantic/
  colors.json                 colors.json
  typography.json             typography.json
  spacing.json                spacing.json
          │
          ▼
  scripts/build-tokens.js  (Style Dictionary v5)
          │
  ┌───────┼────────┐
  ▼       ▼        ▼
css/    scss/     ts/
vars    vars      vars
```

---

## Available Commands

| Command | Description |
|---|---|
| `/extract <url>` | Extract design essence from a URL (dual-path: dembrandt + Playwright/Claude) |
| `/generate <domain> <project>` | Generate framework code from tokens + brief |
| `/preview <domain>` | Display token + brief summary for a domain |

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

Aliases that reference primitives via `{token.path}` syntax. Written under `semantic.*` namespace to avoid CSS variable name collisions.

| File | Token namespace | Example key |
|---|---|---|
| `colors.json` | `semantic.color.*` | `semantic.color.surface.default → {color.bg-main}` |
| `typography.json` | `semantic.font.*` | `semantic.font.family.display → {font.family.heading}` |

**v1 scope**: Primitive + Semantic only. No component-level tokens in v1.

### Token reference table

```
Primitive                          Semantic alias
─────────────────────────────────────────────────────────────────
color.primary                      semantic.color.brand.primary
color.accent                       semantic.color.brand.accent
color.bg-main                      semantic.color.surface.default
color.bg-alt                       semantic.color.surface.alt
color.text-body                    semantic.color.text.default
color.text-heading                 semantic.color.text.heading
color.text-muted                   semantic.color.text.muted
font.family.heading                semantic.font.family.display
```

---

## Tailwind v4 @theme Integration

In Tailwind v4, register tokens via `@theme` in `globals.css` — **not** via `tailwind.config.ts`.

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

Then import the generated CSS:

```css
@import "../../../design-essence/build/css/variables.css";
```

---

## brief.json Schema

```jsonc
{
  "meta": {
    "name": "string",           // human-readable site name
    "source_url": "string",     // origin URL
    "captured_date": "string",  // ISO date
    "tags": ["string"]          // descriptive tags
  },
  "layout": {
    "pattern": "string",        // e.g. "hero-first", "sidebar-nav"
    "sections": [
      {
        "name": "string",
        "height_ratio": "string",
        "content_alignment": "string"
      }
    ],
    "max_width": "string",
    "whitespace_density": "string",  // "compact" | "comfortable" | "spacious"
    "section_flow": "string",
    "sticky_elements": ["string"],
    "breakpoint_strategy": "string"
  },
  "interaction": {
    "scroll_effects": [
      { "type": "string", "trigger": "string", "duration": "string" }
    ],
    "hover_patterns": {
      "buttons": "string",
      "cards": "string"
    },
    "transition_defaults": "string",
    "focus_style": "string"
  },
  "brand_voice": {
    "tone": "string",           // e.g. "authoritative", "friendly"
    "formality": "string",      // "formal" | "casual" | "neutral"
    "copy_patterns": ["string"],
    "imagery_style": "string"
  }
}
```

---

## Code Generation Rules

When generating framework code from tokens:

1. **Never hardcode design values.** Always use CSS custom properties:
   ```tsx
   // WRONG
   <div style={{ color: '#1B3A6B' }}>
   // RIGHT
   <div style={{ color: 'var(--color-primary)' }}>
   ```

2. **Use Tailwind utility classes** that map to `@theme` tokens when generating Tailwind projects.

3. **Respect layout.sections order** from brief.json when scaffolding page structure.

4. **Apply brand_voice** when generating placeholder copy — match tone and formality.

5. **Output path**: `design-essence/output/<project>/` — never overwrite source files.

---

## Auto-rebuild Hook

Writing to `tokens/primitive/` or `tokens/semantic/` automatically triggers `build-tokens.js` via a PostToolUse hook in `.claude/settings.json`. The rebuilt CSS is available immediately at `build/css/variables.css`.

---

## Current Design Essence

<!-- Update this section after each /extract run -->

| Domain | Extracted | Brief | Tokens Built |
|---|---|---|---|
| `president-go-kr` | ✅ | ✅ | ✅ |

