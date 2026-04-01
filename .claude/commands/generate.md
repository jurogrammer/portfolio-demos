---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Generate a website using stored design essence
argument-hint: <framework> <description>
---

## Design-Driven Code Generation

Framework: first word of "$ARGUMENTS" (nextjs | html | react | wordpress)
Description: everything after the first word

### Prerequisites
Read the most recent brief from design-essence/briefs/*/brief.json
Read design-essence/build/css/variables.css for CSS custom properties
Read design-essence/tokens/semantic/ for semantic token names

### Generation Rules
1. NEVER hardcode color, spacing, font, or shadow values — always use var(--*)
2. Layout follows brief.json layout.sections order and patterns
3. Copy tone matches brief.json brand_voice (tone, perspective, headline patterns)
4. Interactions match brief.json interaction patterns
5. For **nextjs**: App Router + Tailwind v4. Import variables.css, use @theme { --color-*: var(--color-*); } in globals.css. NO tailwind.config.ts.
6. For **html**: Single-file HTML + inline CSS using var(--*) + vanilla JS
7. For **react**: JSX + Tailwind + design-tokens.css import
8. For **wordpress**: Theme with style.css + functions.php + templates/

### Output
Create complete project in design-essence/output/<project-slug>/
