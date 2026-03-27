export const SITE_NAME = '개발자 주인재';
export const SITE_DESCRIPTION = '풀스택 엔지니어 주인재 | Kotlin · Spring Boot · React · Next.js | 5년+ 경력';
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
];
export const SOCIAL_LINKS = {
  github: 'https://github.com/jurogrammer',
  linkedin: 'https://www.linkedin.com/in/injae-ju-942a451a4/',
};
export const HIGHLIGHTS = [
  { label: '개발 경력', value: '5년+' },
  { label: '서비스 사용자', value: '500만+' },
  { label: '처리량 개선', value: '90%↑' },
  { label: '콜드 스타트 단축', value: '2s→600ms' },
];
export const CAREER_TIMELINE = [
  { year: '2020', title: '개발자 커리어 시작', description: 'CS 기초(OS, 네트워크, 알고리즘) 독학 및 부트캠프 수료 후 첫 개발직 합류. Spring MVC / Java 백엔드 프로젝트 구축' },
  { year: '2020–2021', title: 'Dealicious (신상마켓) — 풀스택 엔지니어', description: 'AWS Lambda + SQS 서버리스 PDF 생성 파이프라인 설계, 처리 시간 1시간 → 5~10분 단축. 결제 API 및 어드민 UI 개발' },
  { year: '2021–2022', title: '핀테크 기업 — 풀스택 엔지니어', description: '뱅킹 환경에서 API 백엔드 및 어드민 대시보드 지원' },
  { year: '2022–현재', title: '대형 IT 플랫폼 기업 — 풀스택 엔지니어', description: '500만+ 모바일 사용자 BFF 서버 구축, Spring MVC → WebFlux 마이그레이션 후 Performance Profiler로 WebFlux 초기 설정을 튜닝, 마이그레이션 베이스라인 대비 TPS ~90% 향상, 시간당 500만+ 메시지 알림 시스템 설계. React/Next.js 어드민 개발 생산성 66% 향상' },
];
export const TECH_STACK = {
  backend: [
    { name: 'Kotlin / Spring Boot', years: 5, desc: '마이크로서비스, REST API, WebFlux' },
    { name: 'Java / Spring MVC', years: 5, desc: '엔터프라이즈 시스템, 배치 처리' },
    { name: 'MySQL / Redis / MongoDB', years: 4, desc: '쿼리 최적화, 캐싱, 중복 제거' },
    { name: 'Apache Kafka', years: 3, desc: '대용량 메시지 스트리밍, 500만+/시간' },
  ],
  frontend: [
    { name: 'React / Next.js', years: 2, desc: 'SSG/SSR, App Router' },
    { name: 'Vue.js', years: 2, desc: '어드민 대시보드, SPA' },
    { name: 'TypeScript', years: 3, desc: '타입 안전 개발' },
  ],
  infra: [
    { name: 'AWS (Lambda, SQS, RDS)', years: 5, desc: '서버리스 아키텍처, 인프라 운영' },
    { name: 'Kubernetes / Docker', years: 5, desc: '컨테이너화, 오케스트레이션' },
    { name: 'AI 도구 (Cursor, Claude Code, n8n)', years: 2, desc: 'AI 워크플로우, 자동 코드 리뷰 파이프라인' },
  ],
};
