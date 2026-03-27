# P7 남은 작업 — Phase 6 & 7

> Phase 1~5 (Next.js 프론트엔드) 완료됨. `pnpm build` 통과.
> 아래 작업만 남음.

---

## 사전 준비: Credential 발급

| # | Credential | 발급처 | 값 형태 |
|---|-----------|--------|---------|
| 1 | **OpenAI API Key** | https://platform.openai.com/api-keys | `sk-...` |
| 2 | **Slack Bot Token** | https://api.slack.com/apps → OAuth & Permissions | `xoxb-...` |
| 3 | **Google Service Account JSON** | https://console.cloud.google.com → IAM → Service Accounts → 키 생성 | JSON 파일 |
| 4 | **Google Spreadsheet ID** | 스프레드시트 URL의 `/d/{이 값}/edit` | 문자열 |
| 5 | **Resend API Key** | https://resend.com → API Keys | `re_...` |

### Slack App 설정 상세
1. Create New App → From scratch → 이름: `n8n-inquiry-bot`
2. OAuth & Permissions → Bot Token Scopes: `chat:write`, `chat:write.public`
3. Install to Workspace → Bot User OAuth Token 복사
4. 채널 생성: `#tech-support`, `#sales`, `#general`, `#daily-report`

### Google Sheets 설정 상세
1. Google Cloud → 프로젝트 생성 → Sheets API 활성화
2. Service Account 생성 → JSON 키 다운로드
3. 스프레드시트 생성 → 시트 탭 이름: `Inquiries`
4. Row 1 헤더 (A~L):
   ```
   ticketId | 이름 | 이메일 | 카테고리(입력) | 메시지 | AI분류카테고리 | AI긴급도 | AI요약 | 상태 | 접수일시 | 처리완료일시 | 비고
   ```
5. 스프레드시트를 Service Account 이메일에 **편집자** 권한으로 공유

---

## Phase 6: n8n 워크플로우 구축

### 6.0 n8n 로컬 실행
```bash
cd p7-n8n-automation/docker
docker compose up -d
# http://localhost:5678 접속 → 초기 계정 생성
```

n8n UI에서 Credentials 등록:
- OpenAI API → API Key 입력
- Slack OAuth2 API → Bot Token 입력
- Google Sheets → Service Account JSON 붙여넣기
- Header Auth (Resend) → Name: `Authorization`, Value: `Bearer re_...`

### 6.1 워크플로우 A: 고객 문의 자동 처리

**트리거**: Webhook (`POST /webhook/inquiry`)

**노드 흐름**:
1. **Webhook** (Trigger) — `POST /webhook/inquiry` 수신
2. **Set: 데이터 정리** — ticketId 생성 (`TK-{timestamp}-{random}`), 기본값 설정
3. **IF: 유효성 검증** — 이름, 이메일, 메시지 필수 필드 확인
4. **OpenAI: AI 분류** — 프롬프트로 카테고리/긴급도/요약 JSON 반환
5. **Switch: 카테고리별 분기** — AI 분류 결과에 따라 3개 분기
6. **Slack 알림** — 기술문의→`#tech-support`, 견적요청→`#sales`+이메일, 일반문의→`#general`
7. **Google Sheets: 로그 저장** — "Inquiries" 시트에 행 추가
8. **Resend: 접수 확인 이메일** — HTTP Request 노드로 고객에게 발송
9. **Respond to Webhook** — `{ success: true, ticketId: "TK-..." }` 반환

**OpenAI 프롬프트**:
```
다음 고객 문의를 분석하여 JSON으로 응답해주세요.

문의 내용: {{$json.message}}

응답 형식:
{
  "category": "기술문의" | "견적요청" | "일반문의",
  "urgency": "높음" | "보통" | "낮음",
  "summary": "한 줄 요약"
}
```

**Slack 메시지 포맷**:
```
📩 새 고객 문의 접수
• 티켓: {{ticketId}}
• 이름: {{name}}
• 카테고리: {{ai_category}}
• 긴급도: {{ai_urgency}}
• 요약: {{ai_summary}}
원문: {{message}}
```

### 6.2 워크플로우 B: 일일 문의 요약 리포트

**트리거**: Schedule (매일 09:00 KST) + Webhook (`POST /webhook/daily-report` 수동용)

**노드 흐름**:
1. **Schedule / Webhook** — 매일 09:00 또는 수동 트리거
2. **Google Sheets: 읽기** — "Inquiries" 시트에서 전일 문의 조회
3. **Function: 통계 집계** — 카테고리별/긴급도별 건수, 미응답 건수
4. **HTML: 리포트 생성** — HTML 테이블 + 요약
5. **Resend: 리포트 이메일** — 관리자에게 발송
6. **Slack: 리포트 포스팅** — `#daily-report` 채널

### 6.3 워크플로우 C: 미응답 문의 에스컬레이션

**트리거**: Schedule (매 2시간)

**노드 흐름**:
1. **Schedule** — 매 2시간
2. **Google Sheets: 조회** — status='접수됨' AND 24시간 경과
3. **IF: 미응답 건 존재** — 결과 행 > 0
4. **Slack: 긴급 알림** — @channel 멘션으로 미응답 목록 전송
5. **Google Sheets: 상태 변경** — status를 '에스컬레이션'으로 업데이트

### 6.4 워크플로우 Export
각 워크플로우를 n8n UI에서 JSON export:
```
workflows/inquiry-automation.json   ← 워크플로우 A
workflows/daily-report.json         ← 워크플로우 B
workflows/escalation-alert.json     ← 워크플로우 C
```

---

## Phase 7: 배포 + 마무리

### 7.1 n8n → Render 배포
1. https://render.com → New Web Service → Docker
2. Image: `n8nio/n8n`
3. 환경변수:

| 변수명 | 값 |
|--------|-----|
| `N8N_ENCRYPTION_KEY` | 프로덕션용 강력한 문자열 |
| `N8N_HOST` | `0.0.0.0` |
| `N8N_PORT` | `$PORT` |
| `N8N_PROTOCOL` | `https` |
| `WEBHOOK_URL` | `https://{service-name}.onrender.com/` |
| `GENERIC_TIMEZONE` | `Asia/Seoul` |

4. 디스크 추가: `/home/node/.n8n`
5. 배포 → n8n UI 접속 → credential 설정 → 워크플로우 import + 활성화

### 7.2 Next.js → Vercel 배포
1. Vercel Dashboard → 프로젝트 생성, Root Directory: `p7-n8n-automation`
2. 환경변수:

| 변수명 | 값 |
|--------|-----|
| `N8N_WEBHOOK_URL` | `https://{service-name}.onrender.com` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account 이메일 |
| `GOOGLE_PRIVATE_KEY_BASE64` | `echo -n "private_key값" \| base64` |
| `GOOGLE_SPREADSHEET_ID` | 스프레드시트 ID |
| `NEXT_PUBLIC_SITE_URL` | Vercel 배포 URL |

3. `git push` → 자동 빌드/배포

### 7.3 UptimeRobot 설정 (선택)
- https://uptimerobot.com → New Monitor → HTTP(s)
- URL: Render n8n URL, 5분 간격
- 슬립 방지용

### 7.4 E2E 검증 체크리스트
- [ ] 문의 폼 제출 → ticketId 반환
- [ ] Slack 채널 알림 수신
- [ ] Google Sheets 행 추가 확인
- [ ] 자동 응답 이메일 수신
- [ ] `/inquiry/status/[ticketId]` 타임라인 표시
- [ ] `/dashboard` 통계 + 테이블 표시
- [ ] 다크/라이트 모드 전환
- [ ] 모바일(360px) 반응형
- [ ] 워크플로우 B 수동 트리거 → 리포트 수신
- [ ] 워크플로우 C 수동 트리거 → 에스컬레이션 알림
