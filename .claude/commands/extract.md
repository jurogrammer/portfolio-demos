---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Extract design essence from a URL into DTCG tokens + brief
argument-hint: <url>
---

## Design Essence Extraction

Target URL: $ARGUMENTS

### PATH 1 — Dembrandt Accelerator (optional)
Try rapid token extraction:
```bash
cd /Users/user/Projects/portfolio-demos/design-essence && npx dembrandt $ARGUMENTS --dtcg --save-output 2>/dev/null
```
If succeeds, save output to `design-essence/tokens/extracted/<domain>/dembrandt.json`.
If fails, skip — Claude extraction covers this.

### PATH 2 — Full Claude Analysis (always runs)
1. Navigate to $ARGUMENTS via Playwright MCP (browser_navigate)
2. Take full-page screenshot (browser_take_screenshot), save to `design-essence/tokens/extracted/<domain>/screenshots/`
3. Get page snapshot (browser_snapshot) for structural analysis
4. Extract computed styles via browser_evaluate:
   - Colors: all CSS custom properties + computed background/text colors
   - Typography: font families, sizes, weights, line-heights
   - Spacing: max-width, padding, gap values
5. Analyze HTML structure: sections, headings, CTAs, navigation
6. Produce `design-essence/tokens/extracted/<domain>/essence.json` with full essence schema:
   - meta (name, source_url, captured_date, tags)
   - color (primary, secondary, accent, background, text, gradients, mood)
   - typography (heading_font, body_font, accent_font, scale, weight_usage, special)
   - layout (pattern, sections[], max_width, whitespace_density, section_flow, sticky_elements)
   - interaction (scroll_effects, hover_patterns, page_transitions, loading_style, micro_interactions)
   - brand_voice (tone, perspective, headline_pattern, cta_style, copy_density, social_proof_style, unique_vocabulary)
7. Create `design-essence/briefs/<domain>/brief.json` from layout, interaction, brand_voice sections

### POST-PROCESSING
1. Run: `cd /Users/user/Projects/portfolio-demos/design-essence && node scripts/normalize-tokens.js tokens/extracted/<domain>/`
2. Run: `cd /Users/user/Projects/portfolio-demos/design-essence && node scripts/build-tokens.js`
3. Report extraction summary: # colors, fonts, spacing values, sections, interaction patterns, brand voice tone
