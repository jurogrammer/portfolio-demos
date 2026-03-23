# P3. 커뮤니티 게시판 "DevTalk"

> 요구사항 명세서 및 인프라 구성 가이드
> 위시켓 웹개발 포트폴리오 프로젝트 시리즈
> 버전 1.0 | 2025년 3월

---

## 목차

1. 프로젝트 개요
2. 사용자 유형 및 권한 모델
3. 페이지 구성 및 기능 요구사항
4. 관리자 패널 요구사항
5. 비기능 요구사항 (NFR)
6. 기술 스택 선정
7. 인프라 구성 및 배포
8. 폴더 구조 및 파일 컨벤션
9. Supabase 스키마 설계
10. 실시간 기능 설계
11. 검색 전략
12. 개발 일정 (3주)
13. 완료 기준 (Definition of Done)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | DevTalk — 개발자 Q&A 커뮤니티 |
| **목적** | 위시켓 커뮤니티/게시판 프로젝트(₩800만~1,500만) 수주를 위한 핵심 데모. 실시간 기능, 복잡한 데이터 모델, 사용자 상호작용 등 백엔드 역량을 풀스택으로 증명 |
| **기간** | Week 4~7 (21일) |
| **타겟 사용자** | (가상) 개발자 커뮤니티 회원 + 관리자 |
| **핵심 성공 지표** | 카카오 OAuth 로그인, 대댓글, 실시간 알림, 전체 텍스트 검색, 관리자 패널 완성 |

### 1.1 배경

커뮤니티/게시판은 한국 특유의 게시판 문화 덕에 위시켓에서 꾸준한 수요가 있다. 실시간 기능, 사용자 관리, 복잡한 상호작용(대댓글, 추천/비추천, 레벨 시스템) 등 백엔드 역량이 차별화 요소가 되는 프로젝트 유형이다. 단순 CRUD를 넘어 실시간 알림, 포인트 시스템, 전체 검색까지 구현하여 경쟁력을 확보한다.

### 1.2 사이트맵

| URL 경로 | 페이지명 | 인증 | 역할 |
|---|---|---|---|
| `/` | 홈 | 불필요 | 최신글 + 인기글 + 카테고리 네비게이션 |
| `/auth/login` | 로그인 | 불필요 | 카카오 OAuth + 이메일 로그인 |
| `/auth/register` | 회원가입 | 불필요 | 이메일 회원가입 |
| `/auth/callback` | OAuth 콜백 | 불필요 | 카카오 로그인 후 리다이렉트 |
| `/c/[category]` | 카테고리별 목록 | 불필요 | 카테고리 필터된 게시글 목록 |
| `/post/[id]` | 게시글 상세 | 불필요(읽기) | 본문 + 댓글 + 추천 |
| `/write` | 글쓰기 | 필요 | Markdown 에디터 |
| `/post/[id]/edit` | 글수정 | 필요(작성자) | 기존 데이터 로드 → 편집 |
| `/search` | 검색 결과 | 불필요 | 전체 텍스트 검색 |
| `/u/[username]` | 사용자 프로필 | 불필요 | 활동 내역, 작성글, 레벨 |
| `/settings` | 설정 | 필요 | 프로필 수정, 알림 설정 |
| `/notifications` | 알림 | 필요 | 알림 목록 + 읽음 처리 |
| `/admin` | 관리자 대시보드 | 관리자 | 통계 + 관리 |
| `/admin/users` | 사용자 관리 | 관리자 | 목록 + 제재 |
| `/admin/reports` | 신고 관리 | 관리자 | 신고 목록 + 처리 |
| `/admin/posts` | 게시글 관리 | 관리자 | 삭제 + 고정 |

---

## 2. 사용자 유형 및 권한 모델

| 역할 | 읽기 | 글쓰기 | 댓글 | 추천 | 수정/삭제(본인) | 신고 | 관리 |
|---|---|---|---|---|---|---|---|
| **비회원** | O | X | X | X | X | X | X |
| **회원** | O | O | O | O | O | O | X |
| **관리자** | O | O | O | O | O(전체) | O | O |

### 2.1 레벨 시스템

| 레벨 | 필요 포인트 | 이름 | 혜택 |
|---|---|---|---|
| 1 | 0 | 뉴비 | 기본 기능 |
| 2 | 100 | 주니어 | 닉네임 색상 변경 |
| 3 | 500 | 미들 | 추가 태그 필터 |
| 4 | 1,500 | 시니어 | 고정 게시글 요청 |
| 5 | 5,000 | 마스터 | 관리자 추천 배지 |

### 2.2 포인트 획득 규칙

| 행동 | 포인트 |
|---|---|
| 게시글 작성 | +10 |
| 댓글 작성 | +3 |
| 게시글 추천 받기 | +5 |
| 댓글 추천 받기 | +2 |
| 출석 (1일 1회) | +1 |
| 게시글 비추천 받기 | -2 |

---

## 3. 페이지 구성 및 기능 요구사항

### 3.1 홈 (/)

**최신글 섹션**

- 최신 게시글 20개 (무한 스크롤 또는 페이지네이션)
- 각 항목: 카테고리 배지 + 제목 + 태그 + 작성자 + 작성 시간(상대) + 조회수 + 추천수 + 댓글수

**인기글 사이드바 (데스크톱)**

- 오늘/이번 주/이번 달 인기글 Top 5 (추천수 기준)
- 탭 전환 UI

**카테고리 네비게이션**

- 카테고리: Q&A, 자유, 기술, 커리어
- 사이드바(데스크톱) 또는 가로 스크롤 탭(모바일)

### 3.2 카테고리별 목록 (/c/[category])

- 해당 카테고리 게시글만 필터링
- 정렬: 최신순 / 인기순 / 댓글많은순
- 고정(pinned) 게시글 상단 표시
- 페이지네이션 (20개 단위)

### 3.3 게시글 상세 (/post/[id])

**본문 영역**

- 제목 + 카테고리 + 태그 + 작성자(아바타+닉네임+레벨) + 작성일 + 조회수
- Markdown 렌더링 본문 (코드 블록 신택스 하이라이팅)
- 이미지 인라인 표시
- 추천/비추천 버튼 + 현재 수치 표시
- 북마크 버튼
- 수정/삭제 버튼 (작성자에게만 노출)
- 신고 버튼

**댓글 영역**

- 댓글 목록 (최신순)
- 대댓글: parent_id 자기참조로 무한 깊이 — UI는 2단계까지 들여쓰기, 이후 플랫 표시
- 각 댓글: 작성자(아바타+닉네임+레벨) + 작성 시간 + 내용 + 추천 수 + 답글 버튼
- Markdown 지원 (간소화: 볼드, 이탈릭, 코드, 링크)
- 댓글 수정/삭제 (작성자만)

### 3.4 글쓰기 (/write)

- 카테고리 선택 (필수)
- 제목 입력 (필수, 최대 100자)
- Markdown 에디터: 미리보기 토글, 코드 블록 삽입, 이미지 업로드(드래그 앤 드롭)
- 태그 입력: 최대 5개, 자동완성 (기존 태그 기반)
- 작성 / 임시저장 버튼

### 3.5 검색 (/search)

- 검색 입력: Header에 검색 바 상시 노출
- 검색 대상: 제목 + 본문 (Supabase Full Text Search)
- 검색 결과: 게시글 목록과 동일 UI + 검색어 하이라이팅
- 결과 없음 시 안내 메시지

### 3.6 사용자 프로필 (/u/[username])

- 프로필 카드: 아바타 + 닉네임 + 레벨 + 포인트 + 가입일 + 자기소개
- 탭: 작성글 / 댓글 / 북마크(본인만)
- 각 탭은 해당 콘텐츠 목록 (페이지네이션)

### 3.7 알림 (/notifications)

- 알림 유형: 내 글에 댓글, 내 댓글에 답글, 내 글/댓글 추천, 멘션
- 각 알림: 타입 아이콘 + 메시지 + 시간 + 읽음 상태
- 전체 읽음 처리 버튼
- 실시간 수신 (Supabase Realtime)

### 3.8 설정 (/settings)

- 프로필 수정: 닉네임, 아바타 업로드, 자기소개
- 알림 설정: 댓글 알림 ON/OFF, 추천 알림 ON/OFF, 이메일 알림 ON/OFF

### 3.9 공통 컴포넌트

**Header**

- 로고 + 카테고리 네비게이션
- 검색 바
- 비로그인: 로그인/회원가입 버튼
- 로그인: 알림 벨 (미읽은 수 배지) + 프로필 드롭다운 (마이페이지, 설정, 로그아웃)
- 다크/라이트 모드 토글

**Footer**

- 간소화: 카피라이트 + GitHub 링크

---

## 4. 관리자 패널 요구사항

### 4.1 대시보드 (/admin)

- 통계 카드: 총 회원 수, 오늘 가입자 수, 총 게시글 수, 오늘 게시글 수, 미처리 신고 수
- 최근 신고 5건 리스트
- 일간 활동 그래프 (최근 7일 게시글/댓글 수 — 선형 차트)

### 4.2 사용자 관리 (/admin/users)

- 사용자 목록 테이블: 닉네임, 이메일, 레벨, 포인트, 가입일, 상태
- 검색 + 필터 (레벨별, 가입일 범위)
- 사용자 제재: 경고 / 일시정지(7일) / 영구정지 — 사유 입력

### 4.3 신고 관리 (/admin/reports)

- 신고 목록: 신고 대상(게시글/댓글), 신고자, 사유, 신고일, 처리 상태
- 처리 액션: 무시 / 콘텐츠 삭제 / 사용자 제재
- 처리 시 관리자 메모 입력

### 4.4 게시글 관리 (/admin/posts)

- 게시글 목록: 제목, 카테고리, 작성자, 작성일, 조회수, 추천수
- 검색 + 카테고리 필터
- 액션: 게시글 삭제, 고정/고정해제, 카테고리 변경

---

## 5. 비기능 요구사항 (NFR)

| 항목 | 목표 | 측정/검증 방법 |
|---|---|---|
| **Lighthouse 성능** | 85점 이상 (동적 콘텐츠 고려) | Chrome DevTools Lighthouse |
| **LCP** | 3초 미만 | Core Web Vitals |
| **반응형** | 360px ~ 1920px 대응 | Chrome DevTools 디바이스 모드 |
| **실시간 알림** | 3초 이내 수신 | Supabase Realtime 구독 후 INSERT 테스트 |
| **검색 응답** | 1초 이내 | 네트워크 탭에서 검색 API 응답 시간 |
| **이미지 업로드** | 최대 5MB, JPEG/PNG/GIF/WebP | 클라이언트 검증 + Supabase Storage |
| **동시 접속** | Supabase 무료 티어 범위 | 데모 수준이므로 별도 부하 테스트 불필요 |
| **다크 모드** | OS 설정 연동 + 수동 토글 | P1과 동일 |

---

## 6. 기술 스택 선정

| 영역 | 기술 | 선정 사유 |
|---|---|---|
| **프레임워크** | Next.js 14+ (App Router) | P1~P2와 동일 스택 |
| **언어** | TypeScript | 전 프로젝트 공통 |
| **스타일링** | Tailwind CSS | 전 프로젝트 공통 |
| **UI 컴포넌트** | shadcn/ui + Lucide React | 전 프로젝트 공통 |
| **DB / 백엔드** | Supabase (PostgreSQL) | RLS, Auth, Realtime, Storage, Full Text Search 통합 |
| **인증** | Supabase Auth (카카오 OAuth + 이메일) | 한국 시장 필수 소셜 로그인 |
| **실시간** | Supabase Realtime | postgres_changes 구독으로 알림 실시간 수신 |
| **검색** | Supabase Full Text Search (tsvector) | PostgreSQL 내장, 별도 검색 엔진 불필요 |
| **Markdown 에디터** | @uiw/react-md-editor | 미리보기, 코드 하이라이팅, 이미지 업로드 지원 |
| **코드 하이라이팅** | react-syntax-highlighter | Markdown 렌더링 시 코드 블록 하이라이팅 |
| **상태 관리** | Zustand | 알림 카운트 등 글로벌 상태. Redux 대비 경량 |
| **날짜** | date-fns | "3분 전", "2시간 전" 등 상대 시간 표시 |
| **배포** | Vercel | 전 프로젝트 공통 |

### 6.1 P2와 달라진 점

| 항목 | P2 | P3 |
|---|---|---|
| 인증 | 관리자 1명 (이메일) | 일반 사용자 + 관리자 (카카오 OAuth + 이메일) |
| 데이터 모델 | 단순 CRUD (4 테이블) | 복잡한 관계 (8+ 테이블, 자기참조) |
| 실시간 | 없음 | Supabase Realtime (알림) |
| 검색 | 없음 | Full Text Search (tsvector + GIN 인덱스) |
| 상태 관리 | 없음 | Zustand (알림, 사용자 상태) |
| 다국어 | 한/영 | 없음 (한국어 전용) |

---

## 7. 인프라 구성 및 배포

### 7.1 인프라 구성도

| 구성 요소 | 설명 |
|---|---|
| **소스 코드 저장소** | GitHub (Public Repository) |
| **빌드 & 배포** | Vercel |
| **CDN** | Vercel Edge Network |
| **DB** | Supabase PostgreSQL (P2와 동일 프로젝트 또는 별도 — 무료 2개 제한 고려) |
| **인증** | Supabase Auth (카카오 OAuth + 이메일/비밀번호) |
| **실시간** | Supabase Realtime (notifications 테이블 구독) |
| **검색** | Supabase Full Text Search (PostgreSQL tsvector) |
| **파일 저장** | Supabase Storage (post-images 버킷, avatars 버킷) |
| **도메인** | devtalk-demo.vercel.app (무료) |

### 7.2 환경변수

| 변수명 | 용도 | 설정 위치 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Vercel + .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | Vercel + .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 키 | Vercel |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL | Vercel |

카카오 OAuth 키는 Supabase Dashboard에서 직접 설정 (Authentication → Providers → Kakao).

### 7.3 비용

| 항목 | 요금제 | 월 비용 | 비고 |
|---|---|---|---|
| Vercel 호스팅 | Hobby (Free) | $0 | |
| Supabase | Free | $0 | P2와 프로젝트 공유 또는 별도 생성 |
| **총합** | | **$0/월** | |

### 7.4 Supabase 프로젝트 전략

Supabase 무료 티어는 프로젝트 2개까지 허용. P2와 P3를 하나의 Supabase 프로젝트에서 스키마 분리(별도 테이블 prefix 또는 Supabase 스키마)로 운영하거나, 별도 프로젝트로 분리할 수 있다. 데모 수준에서는 별도 프로젝트 권장 (스키마 충돌 방지).

---

## 8. 폴더 구조 및 파일 컨벤션

| 경로 | 역할 |
|---|---|
| `src/app/(public)/` | 비로그인 접근 가능 페이지 |
| `src/app/(public)/page.tsx` | 홈 |
| `src/app/(public)/c/[category]/page.tsx` | 카테고리별 목록 |
| `src/app/(public)/post/[id]/page.tsx` | 게시글 상세 |
| `src/app/(public)/search/page.tsx` | 검색 결과 |
| `src/app/(public)/u/[username]/page.tsx` | 사용자 프로필 |
| `src/app/(auth)/auth/` | 인증 관련 (로그인, 회원가입, 콜백) |
| `src/app/(protected)/write/page.tsx` | 글쓰기 (인증 필요) |
| `src/app/(protected)/settings/page.tsx` | 설정 |
| `src/app/(protected)/notifications/page.tsx` | 알림 |
| `src/app/(admin)/admin/` | 관리자 패널 |
| `src/components/post/` | PostCard, PostContent, PostActions |
| `src/components/comment/` | CommentList, CommentItem, CommentForm |
| `src/components/editor/` | MarkdownEditor, ImageUploader |
| `src/components/search/` | SearchBar, SearchResults |
| `src/components/notification/` | NotificationBell, NotificationList |
| `src/components/admin/` | 관리자 전용 컴포넌트 |
| `src/components/ui/` | shadcn/ui 컴포넌트 |
| `src/hooks/` | useRealtimeNotifications, useInfiniteScroll, useVote |
| `src/stores/` | Zustand 스토어 (notification.ts, auth.ts) |
| `src/lib/supabase/` | client.ts, server.ts, middleware.ts |
| `src/types/` | database.ts, 공통 타입 |

---

## 9. Supabase 스키마 설계

### 9.1 테이블 목록

| 테이블 | 역할 | RLS |
|---|---|---|
| `profiles` | 사용자 프로필 (auth.users 확장) | 공개 읽기 + 본인 수정 |
| `posts` | 게시글 | 공개 읽기 + 회원 생성 + 작성자 수정 |
| `comments` | 댓글 (대댓글 포함) | 공개 읽기 + 회원 생성 + 작성자 수정 |
| `votes` | 추천/비추천 | 회원 CRUD (본인 투표만) |
| `bookmarks` | 북마크 | 회원 CRUD (본인만) |
| `notifications` | 알림 | 본인 읽기 + 시스템 생성 |
| `reports` | 신고 | 회원 생성 + 관리자 읽기/수정 |
| `tags` | 태그 마스터 | 공개 읽기 + 시스템 관리 |

### 9.2 profiles 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, FK→auth.users | |
| `username` | TEXT | UNIQUE, NOT NULL | 닉네임 |
| `avatar_url` | TEXT | | 아바타 이미지 URL |
| `bio` | TEXT | | 자기소개 |
| `points` | INT | DEFAULT 0 | 포인트 |
| `level` | INT | DEFAULT 1 | 레벨 (포인트 기반 자동 계산) |
| `is_banned` | BOOLEAN | DEFAULT false | 정지 여부 |
| `ban_reason` | TEXT | | 정지 사유 |
| `ban_until` | TIMESTAMPTZ | | 정지 해제일 (NULL이면 영구) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 9.3 posts 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `author_id` | UUID | FK→profiles, NOT NULL | |
| `category` | TEXT | NOT NULL | 'qna' / 'free' / 'tech' / 'career' |
| `title` | TEXT | NOT NULL | 제목 (최대 100자) |
| `content` | TEXT | NOT NULL | Markdown 본문 |
| `tags` | TEXT[] | | 태그 배열 (최대 5개) |
| `view_count` | INT | DEFAULT 0 | |
| `upvote_count` | INT | DEFAULT 0 | |
| `downvote_count` | INT | DEFAULT 0 | |
| `comment_count` | INT | DEFAULT 0 | |
| `is_pinned` | BOOLEAN | DEFAULT false | |
| `is_deleted` | BOOLEAN | DEFAULT false | 소프트 삭제 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |
| `fts` | tsvector | GENERATED (title + content) | 전체 텍스트 검색용 |

### 9.4 comments 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `post_id` | UUID | FK→posts, ON DELETE CASCADE, NOT NULL | |
| `author_id` | UUID | FK→profiles, NOT NULL | |
| `parent_id` | UUID | FK→comments (자기참조), NULL | NULL이면 최상위 댓글 |
| `content` | TEXT | NOT NULL | |
| `upvote_count` | INT | DEFAULT 0 | |
| `is_deleted` | BOOLEAN | DEFAULT false | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 9.5 votes 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `user_id` | UUID | FK→profiles, NOT NULL | |
| `target_type` | TEXT | NOT NULL | 'post' / 'comment' |
| `target_id` | UUID | NOT NULL | |
| `value` | INT | CHECK (value IN (-1, 1)) | 1: 추천, -1: 비추천 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| — | — | UNIQUE(user_id, target_type, target_id) | 중복 투표 방지 |

### 9.6 notifications 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `user_id` | UUID | FK→profiles, NOT NULL | 알림 수신자 |
| `type` | TEXT | NOT NULL | 'comment' / 'reply' / 'vote' / 'mention' |
| `message` | TEXT | NOT NULL | 알림 메시지 |
| `link` | TEXT | | 이동할 URL |
| `is_read` | BOOLEAN | DEFAULT false | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 9.7 reports 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `reporter_id` | UUID | FK→profiles, NOT NULL | 신고자 |
| `target_type` | TEXT | NOT NULL | 'post' / 'comment' |
| `target_id` | UUID | NOT NULL | |
| `reason` | TEXT | NOT NULL | 신고 사유 |
| `status` | TEXT | DEFAULT 'pending' | 'pending' / 'resolved' / 'dismissed' |
| `admin_note` | TEXT | | 관리자 처리 메모 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### 9.8 bookmarks 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, auto | |
| `user_id` | UUID | FK→profiles, NOT NULL | |
| `post_id` | UUID | FK→posts, NOT NULL | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| — | — | UNIQUE(user_id, post_id) | 중복 방지 |

### 9.9 인덱스

| 인덱스 | 대상 | 용도 |
|---|---|---|
| `posts_fts_idx` | posts(fts) USING gin | 전체 텍스트 검색 |
| `posts_category_idx` | posts(category, created_at DESC) | 카테고리별 목록 조회 |
| `comments_post_idx` | comments(post_id, created_at) | 게시글별 댓글 조회 |
| `notifications_user_idx` | notifications(user_id, is_read, created_at DESC) | 사용자별 알림 조회 |
| `votes_target_idx` | votes(target_type, target_id) | 투표 집계 |

### 9.10 DB 함수 (RPC)

| 함수명 | 용도 |
|---|---|
| `increment_view_count(post_id)` | 조회수 증가 (중복 방지는 클라이언트 쿠키로) |
| `toggle_vote(user_id, target_type, target_id, value)` | 추천/비추천 토글 + 카운트 동기화 (트랜잭션) |
| `add_points(user_id, amount)` | 포인트 추가 + 레벨 자동 계산 |
| `search_posts(query, limit, offset)` | FTS 검색 결과 반환 |

---

## 10. 실시간 기능 설계

### 10.1 Supabase Realtime 구독 대상

| 테이블 | 이벤트 | 필터 | 용도 |
|---|---|---|---|
| `notifications` | INSERT | `user_id=eq.{currentUserId}` | 새 알림 실시간 수신 |

### 10.2 클라이언트 구현

- `useRealtimeNotifications(userId)` 커스텀 훅
- 초기 로드: 미읽은 알림 목록 + 카운트
- 실시간 구독: INSERT 이벤트 시 상태 업데이트 + 카운트 증가
- 컴포넌트 언마운트 시 채널 해제

### 10.3 알림 생성 트리거

알림은 Supabase Database Trigger 또는 Server Action에서 생성:

| 트리거 이벤트 | 알림 수신자 | 메시지 |
|---|---|---|
| 댓글 작성 | 게시글 작성자 | "{username}님이 회원님의 글에 댓글을 남겼습니다" |
| 대댓글 작성 | 부모 댓글 작성자 | "{username}님이 회원님의 댓글에 답글을 남겼습니다" |
| 게시글 추천 | 게시글 작성자 | "{username}님이 회원님의 글을 추천했습니다" |

---

## 11. 검색 전략

### 11.1 Supabase Full Text Search

- `posts` 테이블에 `fts` tsvector 컬럼 (GENERATED ALWAYS AS)
- 가중치: title → 'A', content → 'B' (제목 매칭 우선)
- GIN 인덱스로 빠른 검색
- `to_tsvector('simple', ...)` — 한국어 형태소 분석 미지원이지만, 데모 수준에서 충분

### 11.2 검색 UI

- Header 검색 바: 엔터 시 `/search?q={query}` 이동
- 검색 결과 페이지: 게시글 목록 + 검색어 하이라이팅
- 결과 없음 시: "검색 결과가 없습니다" + 인기 태그 추천

---

## 12. 개발 일정 (3주)

### Week 1: 인증 + 게시판 코어

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 1** | 프로젝트 초기화, Supabase 스키마 전체 실행, 카카오 OAuth 설정, Vercel 최초 배포 | DB 테이블 + 카카오 로그인 확인 |
| **Day 2** | 인증 (로그인/회원가입/콜백/로그아웃) + 프로필 자동 생성 | 카카오 로그인 → 프로필 생성 확인 |
| **Day 3** | 홈 페이지 + 카테고리 목록 + 게시글 목록 UI | 더미 데이터 기반 목록 렌더링 |
| **Day 4** | 글쓰기 (Markdown 에디터 + 이미지 업로드 + 태그) | 게시글 작성 → DB 저장 → 목록 노출 |
| **Day 5** | 게시글 상세 + Markdown 렌더링 + 코드 하이라이팅 | 게시글 상세 페이지 완성 |

### Week 2: 상호작용 + 검색 + 프로필

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 6** | 댓글 + 대댓글 (CRUD) | 댓글 작성/수정/삭제 + 대댓글 들여쓰기 |
| **Day 7** | 추천/비추천 + 북마크 + 신고 | 투표 토글 + 카운트 동기화 |
| **Day 8** | 검색 (FTS + 검색 UI) + 페이지네이션 정비 | 검색 결과 노출 + 페이지네이션 |
| **Day 9** | 사용자 프로필 + 레벨/포인트 시스템 | 프로필 페이지 + 포인트 적립 확인 |
| **Day 10** | 실시간 알림 (Supabase Realtime + Zustand) | 댓글 작성 시 작성자에게 알림 수신 |

### Week 3: 관리자 + 폴리싱

| 일차 | 작업 내용 | 완료 기준 |
|---|---|---|
| **Day 11** | 관리자 대시보드 + 사용자 관리 | 통계 카드 + 사용자 목록/제재 |
| **Day 12** | 신고 관리 + 게시글 관리 | 신고 처리 + 게시글 삭제/고정 |
| **Day 13~14** | 반응형 QA, 다크모드 QA, 더미 데이터 시딩 | 모바일~데스크톱 전 구간 정상 |
| **Day 15** | Lighthouse 최적화, 스크린샷, README | Lighthouse 85+ |

---

## 13. 완료 기준 (Definition of Done)

### 필수 완료 조건

1. Vercel에 배포되어 공개 URL에서 접근 가능
2. GitHub Public Repository에 소스 코드 공개 + README
3. 카카오 OAuth 로그인 + 이메일 로그인 정상 작동
4. 게시글 CRUD (목록, 상세, 작성, 수정, 삭제) 정상 작동
5. 대댓글 (작성, 수정, 삭제) 정상 작동
6. 추천/비추천 토글 + 카운트 동기화 정상
7. 전체 텍스트 검색 정상 작동
8. 실시간 알림 수신 확인 (댓글 → 게시글 작성자에게 알림)
9. 관리자 패널: 대시보드 + 사용자/신고/게시글 관리
10. 모바일(360px) ~ 데스크톱(1920px) 반응형 정상 작동

### 권장 완료 조건

- 더미 데이터 시딩 (사용자 5명, 게시글 20개, 댓글 50개)
- 레벨/포인트 시스템 정상 작동
- 북마크 기능 정상
- 다크/라이트 모드 전환
- P1 포트폴리오 사이트에 케이스 스터디 작성
- 디바이스 목업 스크린샷 (데스크톱 + 모바일 각 3~5장)
- 30~60초 데모 영상
