# Design Essence Extractor & Generator for Claude Code

**A complete, implementable system architecture that lets a backend developer extract the visual DNA from any website and re-apply it when building new sites — all from the Claude Code CLI.** The system chains three phases (Extract → Store → Generate) using Claude Code sub-agents, MCP servers for browser automation, the W3C Design Tokens standard for storage, and Style Dictionary for multi-framework output. Every component below is production-ready: specific package names, file paths, configuration JSON, and working code snippets are included.

---

## How the three phases fit together

The workflow operates as a pipeline orchestrated entirely within Claude Code. Phase 1 navigates to a target URL via a headless browser MCP server, runs JavaScript extraction scripts in-page, and captures screenshots. Phase 2 normalizes the raw data into **W3C DTCG 2025.10** design tokens stored as JSON, then builds framework-specific outputs with Style Dictionary v5. Phase 3 accepts a new project brief, loads the stored tokens into Claude's context via CLAUDE.md, and generates code targeting Next.js+Tailwind, Vue, or plain HTML/CSS.

The entire system lives inside a single project directory and is triggered through custom Claude Code slash commands (`/extract` and `/generate`). Sub-agents handle parallel extraction tasks — one for colors/typography, one for layout/spacing, one for components/animations — while hooks automate post-extraction token building. Here is the complete project structure:

```
design-essence/
├── .claude/
│   ├── settings.json              # Hooks configuration
│   ├── agents/
│   │   ├── color-typography.md    # Sub-agent: color + font extraction
│   │   ├── layout-spacing.md      # Sub-agent: grid + spacing extraction
│   │   └── component-scanner.md   # Sub-agent: component + animation extraction
│   └── commands/
│       ├── extract.md             # /extract <url> command
│       ├── generate.md            # /generate <framework> command
│       └── preview.md             # /preview — show stored tokens summary
├── .mcp.json                      # MCP server configuration (project-scoped)
├── CLAUDE.md                      # Persistent design context + instructions
├── scripts/
│   ├── extract-colors.js          # Browser-injected color extraction
│   ├── extract-typography.js      # Browser-injected font extraction
│   ├── extract-layout.js          # Browser-injected layout analysis
│   ├── extract-animations.js      # Browser-injected animation detection
│   ├── extract-components.js      # Component pattern detection
│   ├── normalize-tokens.js        # Raw data → DTCG JSON conversion
│   └── build-tokens.js            # Style Dictionary build script
├── tokens/
│   ├── extracted/                 # Raw extraction output (per-URL)
│   │   └── <domain>/
│   │       ├── raw-colors.json
│   │       ├── raw-typography.json
│   │       ├── raw-layout.json
│   │       ├── raw-animations.json
│   │       ├── raw-components.json
│   │       └── screenshot.png
│   ├── primitive/                 # Layer 1: raw values
│   │   ├── colors.json
│   │   ├── typography.json
│   │   ├── spacing.json
│   │   ├── radius.json
│   │   ├── shadows.json
│   │   └── motion.json
│   ├── semantic/                  # Layer 2: purpose-driven aliases
│   │   ├── colors.json
│   │   ├── typography.json
│   │   └── spacing.json
│   └── component/                 # Layer 3: component-specific
│       ├── button.json
│       ├── card.json
│       ├── navbar.json
│       └── footer.json
├── build/                         # Generated output (per-framework)
│   ├── css/variables.css
│   ├── tailwind/preset.js
│   ├── scss/_variables.scss
│   └── js/tokens.js
├── templates/                     # Code generation templates
│   ├── nextjs/
│   ├── vue/
│   └── html/
├── sd.config.js                   # Style Dictionary configuration
└── package.json
```

---

## MCP servers that power browser automation

Three MCP servers form the extraction backbone. The `.mcp.json` file at the project root configures all of them as project-scoped servers shared via version control:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

**`@playwright/mcp`** (Microsoft, actively maintained, **27.1k GitHub stars**) is the primary browser automation server. It provides **26 tools** including `browser_navigate`, `browser_take_screenshot`, `browser_snapshot` (accessibility tree), `browser_click`, `browser_hover`, `browser_console_messages`, and `browser_network_requests`. Unlike the archived Puppeteer MCP server (`@modelcontextprotocol/server-puppeteer`, deprecated May 2025), Playwright MCP uses accessibility tree snapshots rather than pixel-based screenshots, making it more deterministic for DOM analysis. The `--headless` flag runs Chrome without a visible window. For sites with aggressive bot protection, add `--browser firefox` since Firefox handles Cloudflare better.

**`mcp-server-fetch`** (official Anthropic server) provides a lightweight `fetch` tool that retrieves any URL as markdown or raw HTML. This is faster than launching a full browser for grabbing stylesheets, and its `raw` parameter returns unprocessed HTML including `<style>` tags and `<link>` references — useful for extracting CSS source before it's computed.

**Why not the Puppeteer MCP?** The `@modelcontextprotocol/server-puppeteer` package was archived on May 29, 2025. It still functions via `npx`, and its `puppeteer_evaluate` tool for running arbitrary JavaScript in-page is powerful. However, `@playwright/mcp` is the sanctioned replacement with broader tool coverage. If you need `puppeteer_evaluate`-style JavaScript execution (critical for `getComputedStyle()` extraction), use the community fork `@executeautomation/playwright-mcp-server` which adds `browser_execute_javascript` alongside Playwright's standard tools.

For Figma-based workflows, add the official Figma MCP server as an HTTP transport: `claude mcp add --transport http figma https://mcp.figma.com/mcp`. Its `get_variable_defs` tool extracts design tokens directly from Figma files and `get_design_context` returns structured React+Tailwind code from any selection.

---

## Sub-agent architecture for parallel extraction

Claude Code sub-agents are specialized Claude instances spawned via the **Task tool**, each running in an isolated context window with defined tool access. Sub-agents cannot spawn other sub-agents (preventing infinite nesting), but the main session can dispatch multiple agents in parallel for independent tasks. Custom sub-agents are defined as markdown files with YAML frontmatter in `.claude/agents/`.

### The three extraction sub-agents

**`.claude/agents/color-typography.md`** — handles colors and fonts:

```markdown
---
name: color-typography-extractor
description: Extracts color palette and typography tokens from a target website
tools: Read, Bash, Glob, Grep
model: sonnet
---

You are a design token extraction specialist focused on colors and typography.

## Your Task
Given a URL, use the Playwright MCP tools to navigate to the page, then run the
extraction scripts to collect all color and typography data.

## Extraction Process
1. Read `scripts/extract-colors.js` and `scripts/extract-typography.js`
2. Use Bash to run the scripts against the target URL via Node.js
3. Parse the output and save raw JSON to `tokens/extracted/<domain>/`
4. Identify the color hierarchy: primary (most frequent non-neutral),
   secondary (second most frequent), accent (high saturation, low frequency),
   and neutrals (near-zero saturation grays)
5. Identify the typographic scale: heading sizes, body text, font families,
   weight distribution, and the scale ratio (h1/body size)

## Output Format
Return a structured JSON summary with confidence scores for each identified token.
Flag any ambiguous classifications for human review.
```

**`.claude/agents/layout-spacing.md`** — handles grid systems and spacing:

```markdown
---
name: layout-spacing-extractor
description: Extracts layout patterns, grid systems, spacing scale, and breakpoints
tools: Read, Bash, Glob, Grep
model: sonnet
---

You are a CSS layout analysis specialist.

## Your Task
Extract all layout-related design information from the target URL.

## Extraction Process
1. Read `scripts/extract-layout.js`
2. Run extraction to identify:
   - Grid systems (12-column, flexbox patterns, CSS Grid usage)
   - Spacing scale (all unique margin/padding/gap values, ranked by frequency)
   - Breakpoints (from @media rules in stylesheets)
   - Container max-widths and content area dimensions
   - Border radius values and their frequency
3. Detect the spacing base unit (most common divisor — typically 4px or 8px)
4. Map raw pixel values to a rem-based scale

## Output Format
Save raw layout data to `tokens/extracted/<domain>/raw-layout.json`.
Include the detected grid system type and spacing base unit.
```

**`.claude/agents/component-scanner.md`** — handles components and animations:

```markdown
---
name: component-scanner
description: Identifies UI component patterns and animation/interaction styles
tools: Read, Bash, Glob, Grep
model: sonnet
---

You are a UI component pattern analyst.

## Your Task
Scan the target page for reusable component patterns and interaction styles.

## Component Detection
Identify these patterns by analyzing DOM structure and computed styles:
- Navigation bars (nav elements, header patterns)
- Buttons (all variants: primary, secondary, outline, ghost)
- Cards (content containers with shadows/borders/radius)
- Forms and input fields
- Footers
- Hero sections
- Feature grids

## Animation Detection
1. Read `scripts/extract-animations.js`
2. Extract CSS transitions (property, duration, timing function)
3. Extract CSS animations (@keyframes definitions)
4. Parse stylesheet :hover rules for hover effects
5. Detect scroll-triggered animations (intersection observer patterns)

## Output Format
For each component, output its structural pattern, applied tokens, and variants.
For animations, output the transition/animation shorthand and any keyframe definitions.
```

### Orchestration flow

The main Claude Code session orchestrates extraction by dispatching all three sub-agents after the Playwright MCP navigates to the target URL and captures a screenshot. The Task tool invocations look like:

```xml
<invoke name="Task">
  <parameter name="description">Extract colors and typography from https://example.com</parameter>
  <parameter name="prompt">Navigate to https://example.com using Playwright MCP.
  Run scripts/extract-colors.js and scripts/extract-typography.js.
  Save results to tokens/extracted/example.com/</parameter>
  <parameter name="run_in_background">true</parameter>
</invoke>
```

Setting `run_in_background` to `true` lets the main session continue dispatching the layout and component agents without waiting. Results merge when all three complete.

---

## Custom slash commands that trigger each phase

Claude Code supports custom commands as markdown files in `.claude/commands/`. The filename becomes the command name, and `$ARGUMENTS` captures user input.

### `/extract` command

**`.claude/commands/extract.md`:**

```markdown
---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Extract design essence from a URL into design tokens
argument-hint: <url>
---

## Design Essence Extraction

Target URL: $ARGUMENTS

### Step 1: Capture
Use the Playwright MCP to:
1. Navigate to $ARGUMENTS
2. Take a full-page screenshot, save to tokens/extracted/<domain>/screenshot.png
3. Get an accessibility snapshot for structural analysis

### Step 2: Extract (Parallel Sub-Agents)
Dispatch three sub-agents simultaneously:
1. **color-typography-extractor**: Run scripts/extract-colors.js and
   scripts/extract-typography.js via Bash
2. **layout-spacing-extractor**: Run scripts/extract-layout.js via Bash
3. **component-scanner**: Run scripts/extract-animations.js and
   scripts/extract-components.js via Bash

### Step 3: Normalize
After all agents complete, run:
```bash
node scripts/normalize-tokens.js tokens/extracted/<domain>/
```
This converts raw extraction data into W3C DTCG format in tokens/primitive/,
tokens/semantic/, and tokens/component/.

### Step 4: Build
Run Style Dictionary to generate framework outputs:
```bash
node scripts/build-tokens.js
```

### Step 5: Update CLAUDE.md
Append a "## Current Design Essence" section to CLAUDE.md with a summary of
the extracted tokens, so future sessions have persistent context.

Report the extraction results: number of colors, fonts, spacing values,
components detected, and any items flagged for human review.
```

### `/generate` command

**`.claude/commands/generate.md`:**

```markdown
---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Generate a new website using stored design essence
argument-hint: <framework> <description>
---

## Design-Driven Code Generation

Framework: The first word of "$ARGUMENTS"
Project description: Everything after the first word of "$ARGUMENTS"

### Prerequisites
Read CLAUDE.md for the current design essence context.
Read build/css/variables.css for all available CSS custom properties.
Read tokens/semantic/ for the semantic token mappings.
Read tokens/component/ for component-level token patterns.

### Generation Rules
1. NEVER hardcode color, spacing, font, or shadow values — always use
   CSS custom properties from the design tokens
2. For **nextjs**: Generate Next.js App Router + Tailwind v4 using the
   generated tailwind preset at build/tailwind/preset.js
3. For **vue**: Generate Vue 3 + Composition API with CSS variables
   imported from build/css/variables.css
4. For **html**: Generate semantic HTML5 + CSS using custom properties
5. Match the component patterns extracted in tokens/component/
6. Apply the animation/transition patterns from tokens/component/

### Output Structure
Create a complete, runnable project in output/<framework>/ with:
- All pages and components
- Design token CSS imported globally
- README with setup instructions
- Package.json with correct dependencies
```

### `/preview` command

**`.claude/commands/preview.md`:**

```markdown
---
allowed-tools: Read, Glob
description: Preview the currently stored design essence
---

Read and summarize the current design tokens:
1. Read tokens/primitive/colors.json — show the color palette
2. Read tokens/primitive/typography.json — show the type scale
3. Read tokens/primitive/spacing.json — show the spacing scale
4. Read tokens/semantic/colors.json — show semantic mappings
5. Count component tokens in tokens/component/
6. Report the source URL from tokens/extracted/*/

Format as a visual summary with color swatches (hex codes), font stack,
and spacing scale.
```

---

## Hooks that automate the build pipeline

Claude Code hooks are deterministic shell commands that fire at specific lifecycle points, configured in `.claude/settings.json`. Unlike CLAUDE.md instructions (advisory), **hooks always execute**.

**`.claude/settings.json`:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'if [[ \"$TOOL_INPUT\" == *\"tokens/primitive\"* ]] || [[ \"$TOOL_INPUT\" == *\"tokens/semantic\"* ]]; then node scripts/build-tokens.js 2>&1; fi'",
            "timeout": 30000
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'if [ -f tokens/primitive/colors.json ]; then echo \"Design tokens available. Run /preview to see them.\"; fi'"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"Design Essence Extractor ready. Commands: /extract <url>, /generate <framework> <description>, /preview\"'"
          }
        ]
      }
    ]
  }
}
```

The **PostToolUse** hook watches for writes to the token directories. Whenever Claude saves a token JSON file, it automatically triggers Style Dictionary to rebuild all framework outputs — CSS variables, Tailwind preset, SCSS, and JS modules regenerate without manual intervention. The **SessionStart** hook provides an orientation message so the developer immediately knows the available commands. The **Stop** hook reminds about token availability after any interaction completes.

---

## The extraction scripts that run inside the browser

These Node.js scripts are executed by sub-agents via `Bash` tool calls. Each script uses Playwright (installed as a project dependency) to launch a headless browser, navigate to the target URL, and run `page.evaluate()` to extract computed styles from the live DOM.

### Color extraction (`scripts/extract-colors.js`)

```javascript
import { chromium } from 'playwright';
import chroma from 'chroma-js';

const url = process.argv[2];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });

const rawColors = await page.evaluate(() => {
  const colorProps = ['color', 'backgroundColor', 'borderColor',
    'borderTopColor', 'outlineColor', 'textDecorationColor'];
  const colorMap = {};
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    colorProps.forEach(prop => {
      const val = cs[prop];
      if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent') {
        colorMap[val] = (colorMap[val] || 0) + 1;
      }
    });
  });
  // Also extract CSS custom properties from :root
  const vars = {};
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === ':root') {
          for (const prop of rule.style) {
            if (prop.startsWith('--') && prop.includes('color')) {
              vars[prop] = getComputedStyle(document.documentElement)
                .getPropertyValue(prop).trim();
            }
          }
        }
      }
    } catch(e) {} // CORS blocks cross-origin sheets
  }
  return { computed: colorMap, cssVariables: vars };
});

// Normalize and classify with chroma-js
const classified = Object.entries(rawColors.computed)
  .map(([color, count]) => {
    const c = chroma(color);
    return {
      hex: c.hex(), hsl: c.hsl(), count,
      saturation: c.get('hsl.s'), lightness: c.get('hsl.l'),
      isNeutral: c.get('hsl.s') < 0.1
    };
  })
  .sort((a, b) => b.count - a.count);

// Cluster by deltaE (perceptual similarity < 5 = same color)
const clusters = [];
for (const color of classified) {
  const existing = clusters.find(c =>
    chroma.deltaE(c[0].hex, color.hex) < 5);
  if (existing) existing.push(color);
  else clusters.push([color]);
}

const result = {
  palette: clusters.map(c => ({
    hex: c[0].hex, frequency: c.reduce((s, x) => s + x.count, 0),
    isNeutral: c[0].isNeutral
  })).sort((a, b) => b.frequency - a.frequency),
  cssVariables: rawColors.cssVariables
};

console.log(JSON.stringify(result, null, 2));
await browser.close();
```

The script collects every color from every element's computed styles, then uses **chroma-js** (13k+ GitHub stars) to normalize formats, cluster perceptually similar colors via **deltaE** (CIE2000 algorithm), and classify each cluster as neutral or chromatic. The highest-frequency non-neutral cluster becomes the primary color; the second becomes secondary; a low-frequency, high-saturation cluster becomes accent.

### Typography extraction follows the same pattern

It queries `getComputedStyle` for `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, and `letterSpacing` across all text elements (`h1`–`h6`, `p`, `span`, `a`, `button`, `label`, `li`), deduplicates by unique combination, and detects the **typographic scale ratio** by dividing h1 size by body size. The `detect-font` npm package can identify which font from a `font-family` stack the browser actually rendered.

### Layout extraction detects grid systems and spacing scales

The script identifies `display: grid` and `display: flex` elements, captures their `gridTemplateColumns`, `gap`, `flexDirection`, `justifyContent`, and `alignItems`. It extracts all unique margin, padding, and gap values, ranks them by frequency, and detects the **base unit** (greatest common divisor — typically **4px** or **8px**). Breakpoints are extracted by iterating `document.styleSheets` and collecting all `@media` rule thresholds.

### Animation extraction captures transitions and keyframes

It reads `transition`, `transitionDuration`, and `transitionTimingFunction` from all elements (filtering out the default `all 0s ease 0s`), extracts `@keyframes` rule definitions from stylesheets, and parses `:hover` selectors for hover effect patterns. Since hover states can't be read from `getComputedStyle` without triggering them, the script iterates stylesheet rules directly.

---

## The Dembrandt shortcut for rapid extraction

For a faster alternative to custom scripts, **Dembrandt** (`npm install -g dembrandt`, 1.5k GitHub stars) extracts a complete design system from any live URL in a single command. It uses Playwright with stealth mode internally and outputs **W3C DTCG-compliant JSON**:

```bash
npx dembrandt example.com --dtcg --save-output --dark-mode
```

This captures colors (semantic palette + CSS variables), typography (fonts, sizes, weights, Google Font sources), spacing patterns, border radii, shadows, and even the site logo. The `--dtcg` flag outputs tokens in the exact format the rest of the pipeline expects. For sites behind Cloudflare, `--browser=firefox` handles challenges better. The `/extract` command can use Dembrandt as the primary extraction engine and fall back to custom scripts when more granular control is needed.

---

## Design token storage in W3C DTCG format

Extracted data gets normalized into the **W3C Design Tokens Community Group specification v2025.10** — the first stable version of the standard, adopted by Figma, Adobe, Tokens Studio, and Style Dictionary. The format uses JSON with `$`-prefixed properties and a **three-layer architecture**:

**Layer 1 — Primitive tokens** (`tokens/primitive/colors.json`): raw values with no semantic meaning.

```json
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "color": {
    "$type": "color",
    "blue": {
      "500": { "$value": "#3b82f6", "$description": "Extracted primary hue" },
      "700": { "$value": "#1d4ed8", "$description": "Primary hue dark variant" }
    },
    "gray": {
      "50":  { "$value": "#f9fafb" },
      "100": { "$value": "#f3f4f6" },
      "900": { "$value": "#111827" }
    }
  },
  "spacing": {
    "$type": "dimension",
    "1": { "$value": "0.25rem" },
    "2": { "$value": "0.5rem" },
    "4": { "$value": "1rem" },
    "8": { "$value": "2rem" }
  }
}
```

**Layer 2 — Semantic tokens** (`tokens/semantic/colors.json`): purpose-driven aliases referencing primitives.

```json
{
  "color": {
    "text": {
      "primary":   { "$type": "color", "$value": "{color.gray.900}" },
      "secondary": { "$type": "color", "$value": "{color.gray.500}" },
      "inverse":   { "$type": "color", "$value": "{color.gray.50}" }
    },
    "background": {
      "primary": { "$type": "color", "$value": "{color.gray.50}" },
      "brand":   { "$type": "color", "$value": "{color.blue.500}" }
    },
    "interactive": {
      "default": { "$type": "color", "$value": "{color.blue.500}" },
      "hover":   { "$type": "color", "$value": "{color.blue.700}" }
    }
  }
}
```

**Layer 3 — Component tokens** (`tokens/component/button.json`): component-specific bindings.

```json
{
  "button": {
    "primary": {
      "background":       { "$type": "color", "$value": "{color.interactive.default}" },
      "background-hover": { "$type": "color", "$value": "{color.interactive.hover}" },
      "text":             { "$type": "color", "$value": "{color.text.inverse}" },
      "padding-y":        { "$type": "dimension", "$value": "{spacing.2}" },
      "padding-x":        { "$type": "dimension", "$value": "{spacing.4}" },
      "radius":           { "$type": "dimension", "$value": "{radius.md}" },
      "transition":       { "$type": "transition", "$value": {
        "duration": "150ms", "delay": "0ms",
        "timingFunction": [0.4, 0, 0.2, 1]
      }}
    }
  }
}
```

The alias syntax `{dot.path}` lets semantic tokens reference primitives and component tokens reference semantic tokens. Changing a primitive value cascades through all layers automatically.

---

## Style Dictionary v5 builds framework-specific outputs

**Style Dictionary v5.4.0** (actively maintained, moved from Amazon's `amzn/` org to its own `style-dictionary/` GitHub organization) transforms the DTCG JSON tokens into any target format. The `sd.config.js` at project root drives this:

```javascript
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['tokens/primitive/**/*.json', 'tokens/semantic/**/*.json',
           'tokens/component/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'build/tailwind/',
      files: [{
        destination: 'preset.js',
        format: 'javascript/module'
      }]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [{
        destination: '_variables.scss',
        format: 'scss/variables'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [
        { destination: 'tokens.js', format: 'javascript/module' },
        { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' }
      ]
    }
  }
});

await sd.buildAllPlatforms();
```

For **Tailwind v4** specifically, the generated CSS variables integrate natively via the `@theme` directive — no JavaScript config needed:

```css
@import "tailwindcss";
@import "../build/css/variables.css";

@theme {
  --color-primary: var(--color-interactive-default);
  --color-secondary: var(--color-interactive-hover);
  --spacing-sm: var(--spacing-2);
  --spacing-md: var(--spacing-4);
  --font-display: var(--font-family-heading);
}
```

The community package **`sd-tailwindcss-transformer`** can also generate a complete `tailwind.config.js` directly from Style Dictionary tokens if Tailwind v3 compatibility is needed.

---

## CLAUDE.md persists design context across sessions

The CLAUDE.md file at project root becomes Claude's persistent memory of the extracted design. After every `/extract` run, the system appends a structured summary:

```markdown
# Design Essence Extractor & Generator

## Project Overview
CLI workflow for extracting design tokens from websites and generating
new sites with the same visual DNA. Target user: Java/Spring Boot backend
developer building freelance portfolio sites.

## Available Commands
- `/extract <url>` — Extract design essence from any website
- `/generate <nextjs|vue|html> <description>` — Generate a new site
- `/preview` — Show current design tokens summary

## Current Design Essence
**Source**: https://example-portfolio.com (extracted 2026-03-29)

### Color Palette
- Primary: #3b82f6 (blue-500) — CTAs, links, interactive elements
- Secondary: #8b5cf6 (violet-500) — Accents, highlights
- Neutrals: #111827 → #f9fafb (11-step gray scale)
- Confidence: HIGH (42 unique colors clustered to 11 tokens)

### Typography
- Headings: Inter, 700 weight, scale ratio 2.5 (h1: 3rem → p: 1.125rem)
- Body: Inter, 400 weight, line-height 1.65
- Monospace: JetBrains Mono (code blocks)

### Spacing System
- Base unit: 4px (0.25rem)
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

### Component Patterns
- Buttons: rounded-lg, shadow-sm, 150ms ease transitions
- Cards: rounded-xl, shadow-md, p-6, border border-gray-100
- Navbar: sticky, backdrop-blur, h-16

## Code Generation Rules
1. NEVER hardcode values — always use CSS custom properties from build/css/
2. Reference tokens/semantic/ for color purpose, not tokens/primitive/
3. All transitions use the extracted timing: 150ms cubic-bezier(0.4,0,0.2,1)
4. Spacing follows the 4px base grid strictly
```

Claude Code loads CLAUDE.md at session start, so every `/generate` invocation has full context about the stored design without re-reading all token files. The `#` key during sessions lets you add ad-hoc instructions that get saved to CLAUDE.md automatically.

---

## How code generation maps tokens to templates

Phase 3 generation works through **LLM-driven code synthesis guided by design tokens**, not rigid template rendering. Claude reads the semantic and component token files, understands the design system's constraints, and generates framework-appropriate code that references CSS custom properties throughout.

The `templates/` directory contains starter scaffolds for each framework, not full component libraries. Each scaffold establishes the token import pattern:

**Next.js scaffold** (`templates/nextjs/app/layout.tsx`):
```tsx
import './globals.css'  // imports build/css/variables.css
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Vue scaffold** (`templates/vue/src/main.js`):
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import '../build/css/variables.css'

createApp(App).mount('#app')
```

**Plain HTML scaffold** (`templates/html/index.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="tokens.css">
  <style>
    body { font-family: var(--font-family-body); color: var(--color-text-primary);
           background: var(--color-background-primary); }
  </style>
</head>
```

When Claude generates components, it reads the component tokens to understand the exact patterns — a button's padding, radius, shadow, and transition are all specified as token references. The LLM applies these consistently across every generated component. The three-layer token architecture ensures that changing the source design only requires re-running `/extract` on a new URL; all references cascade automatically.

For maximum generation quality, the component tokens include **structural patterns** alongside visual tokens — a card's token file specifies not just its colors and shadows but also its layout pattern (flex column, gap between header/content/footer), its responsive behavior, and its hover interaction. This gives Claude enough context to generate structurally accurate components without seeing the original source code.

---

## Putting it all together: the complete workflow

A backend developer building their freelance portfolio would use the system like this:

**Session 1 — Extract from an inspiring site:**
```
$ claude
> /extract https://brittanychiang.com

Dispatching 3 extraction sub-agents...
✓ Color-typography agent: 8 colors, 3 font families, scale ratio 2.25
✓ Layout-spacing agent: 8px base grid, 5 breakpoints, CSS Grid + Flexbox
✓ Component-scanner agent: 6 components (navbar, hero, cards, timeline, footer, links)

Normalizing to DTCG tokens... ✓
Building framework outputs... ✓
  → build/css/variables.css (142 custom properties)
  → build/tailwind/preset.js
  → build/scss/_variables.scss
  → build/js/tokens.js

CLAUDE.md updated with design essence summary.
```

**Session 2 — Generate the portfolio:**
```
$ claude
> /generate nextjs A developer portfolio for a Java/Spring Boot backend engineer.
  Include: hero section with name and tagline, about section, skills grid showing
  Java/Spring/PostgreSQL/Docker, project cards with GitHub links, experience
  timeline, and contact form. Dark theme preferred.

Generating Next.js 14 + Tailwind v4 project using stored design essence...
Reading design tokens from brittanychiang.com extraction...
Creating output/nextjs/ with 8 components, 3 pages...
```

The generated code uses the exact color palette, typography scale, spacing rhythm, border radii, shadows, and transition timings from the extracted design — but applied to completely different content and layout. The developer gets a professional-looking portfolio that carries the design DNA of a site they admired, without copying it wholesale.

## Conclusion

This architecture solves a real problem for backend developers who can recognize good design but struggle to reproduce it. The key insight is that **design is systematic** — a site's visual quality comes from consistent application of a small set of tokens (typically under 150 values), and those tokens can be extracted programmatically. By storing them in the W3C DTCG standard and building with Style Dictionary, the system stays framework-agnostic. By persisting context in CLAUDE.md and automating builds through hooks, it works seamlessly across Claude Code sessions. The combination of Playwright MCP for browser automation, custom sub-agents for parallel extraction, and slash commands for workflow triggers creates a practical CLI tool rather than a theoretical framework. For rapid prototyping, Dembrandt can replace the custom extraction scripts entirely — `npx dembrandt <url> --dtcg --save-output` produces DTCG-compliant tokens in seconds that feed directly into the Style Dictionary pipeline.