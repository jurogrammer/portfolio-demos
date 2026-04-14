---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Map user content to extracted design sections
argument-hint: <domain>
---

## Content Mapping

Domain: $ARGUMENTS (matches `design-essence/tokens/extracted/<domain>/`)

---

### Step 1: Load References

1. Read `design-essence/tokens/extracted/<domain>/section-map.json`
2. Read `design-essence/tokens/extracted/<domain>/content-template.md`
3. Check if user has a custom content file:
   - `design-essence/tokens/extracted/<domain>/content.md` (user-provided)
   - If not found, use `content-template.md` and inform user to fill it first

---

### Step 2: Parse User Content

Parse the content markdown file:
- Each `## S{XX}: {name}` heading = section mapping
- Each `- **{role}**: {value}` = slot value
- Sections with `[삭제]`, `[skip]`, or `[omit]` = mapping_type: "omit"
- Empty slot values or `[placeholder]` = use AI-generated placeholder matching brand_voice

---

### Step 3: Generate Mappings

For each section in section-map.json:

1. **Has matching content** → `mapping_type: "direct"`
   - Map each slot value from content file
   - Validate type compatibility (text → text, image → image path)

2. **No content, user marked skip** → `mapping_type: "omit"`
   - Section will be excluded from generation

3. **No content, not marked skip** → `mapping_type: "direct"` with placeholders
   - Generate placeholder content matching `brief.json` brand_voice
   - Mark slots as `"placeholder": true`

4. **Extra content sections not in original** → add to `extra_content[]`
   - These need manual placement decision

---

### Step 4: Output content-map.json

Write to `design-essence/tokens/extracted/<domain>/content-map.json`:

```json
{
  "domain": "<domain>",
  "source_content": "content.md",
  "mapped_date": "<ISO date>",
  "mappings": [
    {
      "section_id": "S01",
      "section_name": "header",
      "mapping_type": "direct|omit|merge|split",
      "slots": {
        "<role>": {
          "value": "<user content>",
          "type": "text|image|text_list",
          "placeholder": false
        }
      }
    }
  ],
  "unmapped_sections": ["S05-schedule"],
  "extra_content": [
    {
      "name": "extra-section-name",
      "content": "...",
      "suggested_placement": "after S03"
    }
  ],
  "stats": {
    "total_sections": 8,
    "mapped": 6,
    "omitted": 1,
    "placeholder": 1
  }
}
```

---

### Step 5: Report

Output summary:
- 매핑된 섹션: N개 (목록)
- 생략된 섹션: N개 (목록)
- 플레이스홀더 사용: N개 (목록)
- 추가 콘텐츠: N개 (배치 제안 포함)

안내: "다음 단계: `/generate <domain> <project-name>` 으로 코드 생성"
