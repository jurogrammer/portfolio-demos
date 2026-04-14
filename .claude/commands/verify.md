---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Verify generated site against original design with self-correction loop
argument-hint: <project-name>
---

## Self-Correction Verification Loop v3

Project: $ARGUMENTS (matches `design-essence/output/<project>/` 또는 monorepo root `<project>/`)

---

### Step 1: Identify Source Domain & Load References

1. Find the project directory (check both `design-essence/output/<project>/` and repo root `<project>/`)
2. Find the source domain from the most recent extraction in `design-essence/tokens/extracted/*/`
3. Load:
   - `design-essence/tokens/extracted/<domain>/section-map.json`
   - `design-essence/tokens/extracted/<domain>/sections/*/inner-elements.json` (v3)
   - Original section screenshots from `sections/*/screenshot.png`

---

### Step 2: Start Dev Server

1. Install dependencies if needed
2. Start dev server (Bash or preview_start)
3. Wait for server ready

---

### Step 3: 원본 사이트와 나란히 비교 (Side-by-Side)

**v3 핵심 변경: 자기 채점 금지. 구조적 비교를 수행합니다.**

For each section in section-map.json:

#### 3a. 원본 스크린샷 확인
- 브라우저 MCP로 원본 사이트 해당 섹션으로 스크롤
- 스크린샷 캡처 (또는 저장된 screenshot.png 확인)

#### 3b. 생성물 스크린샷 확인
- 생성된 사이트 해당 섹션으로 스크롤
- 스크린샷 캡처

#### 3c. ★ 구조적 편차 체크리스트 (Structural Deviation Checklist)

**아래 항목을 하나씩 비교하고, 편차가 있으면 기록합니다.**
"비슷해 보인다"는 답 금지. 구체적 CSS 속성 수준에서 비교합니다.

```
[S{XX} 구조 비교]

1. 레이아웃 유형 (Layout Type):
   원본: □ full-bleed  □ contained(max-width)  □ card-grid  □ flex-row  □ stacked
   생성: □ full-bleed  □ contained(max-width)  □ card-grid  □ flex-row  □ stacked
   일치: Y/N → 불일치 시 상세:

2. 반복 요소 간격 (Gap):
   원본: gap ≈ ___px
   생성: gap ≈ ___px
   일치: Y/N

3. 반복 요소 모서리 (Border Radius):
   원본: border-radius ≈ ___px
   생성: border-radius ≈ ___px
   일치: Y/N

4. 배경 처리 (Background):
   원본: □ 솔리드  □ 그라디언트  □ 이미지  □ 이미지+오버레이  □ 투명
   생성: □ 솔리드  □ 그라디언트  □ 이미지  □ 이미지+오버레이  □ 투명
   일치: Y/N → 불일치 시 상세:

5. 컨테이너 너비:
   원본: □ 100vw  □ max-width ≈ ___px  □ 양쪽 마진 있음
   생성: □ 100vw  □ max-width ≈ ___px  □ 양쪽 마진 있음
   일치: Y/N

6. 타이포그래피:
   원본 영문: □ serif  □ sans-serif  □ monospace
   생성 영문: □ serif  □ sans-serif  □ monospace
   원본 한글: □ 명조  □ 고딕
   생성 한글: □ 명조  □ 고딕
   일치: Y/N

7. 텍스트 수직 리듬 (Vertical Rhythm):
   원본: 텍스트 요소 간격이 □ 응집(compact)  □ 보통  □ 분산(loose)
   생성: 텍스트 요소 간격이 □ 응집(compact)  □ 보통  □ 분산(loose)
   일치: Y/N

8. 그림자/깊이 (Depth):
   원본: box-shadow □ 있음  □ 없음
   생성: box-shadow □ 있음  □ 없음
   일치: Y/N
```

이 체크리스트를 **반드시 텍스트로 출력**한 후 다음 단계로 넘어갑니다.
출력하지 않으면 "비슷해 보여서 통과" 환각이 발생합니다.

---

### Step 4: 점수 산정

체크리스트 결과를 기반으로 점수 산정:

| 항목 | 가중치 | 설명 |
|---|---|---|
| Layout Type | 30% | full-bleed vs contained vs card-grid 불일치 → 즉시 0점 |
| Background | 20% | 이미지 vs 솔리드 불일치 → 큰 감점 |
| Gap & Border Radius | 15% | 카드 간격/모서리 차이 |
| Typography | 15% | serif/sans-serif 불일치, 크기 비율 |
| Vertical Rhythm | 10% | 텍스트 그룹 응집도 |
| Depth (shadow) | 10% | 그림자 유무 불일치 |

**즉시 실패 조건 (해당 섹션 0점)**:
- Layout Type이 완전히 다름 (예: card-grid → full-bleed)
- 원본에 카드 UI가 있는데 생성물에 없음 (또는 반대)
- 원본이 contained인데 생성물이 full-bleed (또는 반대)

**Pass threshold: 70** (v2의 80에서 하향 — 대신 구조적 비교가 더 엄격)

---

### Step 5: Auto-Correction (실패 섹션)

```
MAX_ITERATIONS = 3
iteration = 0

while (failing_sections exist AND iteration < MAX_ITERATIONS):
  iteration++

  for each failing section:
    1. READ the structural deviation checklist results
    2. READ inner-elements.json for hard reference values
    3. READ the component file

    4. FIX based on deviation type:

       Layout Type 불일치:
       - full-bleed → contained: max-width 컨테이너 추가 + 좌우 여백
       - contained → full-bleed: max-width 제거 + width: 100%
       - card-grid 누락: border-radius, gap, box-shadow 추가
       - card-grid 과잉: border-radius/shadow 제거

       Background 불일치:
       - 솔리드 → 이미지: background-image 추가 (또는 리치 그라디언트)
       - 깨진 이미지: <Image> 대신 CSS background 사용, fallback 색상

       Typography 불일치:
       - serif ↔ sans-serif: font-family 교체
       - 크기 비율: inner-elements.json의 fontSize 값 적용

       Rhythm 불일치:
       - 분산 → 응집: margin/padding 줄이기
       - 응집 → 분산: margin/padding 늘리기

    5. SAVE fixed component

  Reload page
  Re-run structural checklist for fixed sections
  Re-score

  If all sections >= 70: BREAK
```

---

### Step 6: Generate Verification Report

Write to `<project-dir>/verification/report.json`:

```json
{
  "project": "<project>",
  "domain": "<domain>",
  "verified_date": "<ISO date>",
  "total_iterations": 2,
  "sections": [
    {
      "id": "S02",
      "name": "quick-links",
      "checklist": {
        "layout_type": { "original": "card-grid", "generated": "full-bleed", "match": false },
        "gap": { "original": "20px", "generated": "0px", "match": false },
        "border_radius": { "original": "12px", "generated": "0px", "match": false },
        "background": { "original": "image+overlay", "generated": "solid-gradient", "match": false },
        "container_width": { "original": "max-width ~1200px", "generated": "100vw", "match": false },
        "typography_en": { "original": "serif", "generated": "sans-serif", "match": false },
        "vertical_rhythm": { "original": "compact", "generated": "loose", "match": false },
        "depth": { "original": "none", "generated": "none", "match": true }
      },
      "score": 15,
      "status": "fixed",
      "initial_score": 15,
      "final_score": 75,
      "deviations_fixed": [
        "Layout: full-bleed → card-grid (max-width + gap + border-radius 추가)",
        "Background: 솔리드 그라디언트 → 리치 그라디언트 + 텍스처",
        "Typography: sans-serif → serif for English labels"
      ]
    }
  ],
  "final_score": 82
}
```

---

### Step 7: Report to User

Output:
- 전체 점수: XX/100
- 섹션별 구조 비교 체크리스트 요약
- 수정된 섹션 목록 + 수정 내용
- 여전히 실패인 섹션: 수동 개입 필요 안내

---

### Scoring Guidelines

| Score | Meaning |
|-------|---------|
| 90-100 | 구조 + 스타일 + 타이포 모두 일치 |
| 70-89 | 구조 일치, 세부 스타일에 미세 차이 |
| 40-69 | 구조 부분 일치, 눈에 띄는 차이 (auto-fix 대상) |
| 0-39 | 구조 완전 불일치 (즉시 실패) |
