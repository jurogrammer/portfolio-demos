-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text unique not null,
  content text not null,
  content_en text,
  excerpt text,
  thumbnail_url text,
  category text default 'news' check (category in ('news', 'blog')),
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  client_name text,
  tech_stack text[] default '{}',
  thumbnail_url text,
  images text[] default '{}',
  category text check (category in ('web', 'mobile', 'consulting')),
  is_featured boolean default false,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists job_postings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  location text default '서울',
  employment_type text default 'full-time' check (employment_type in ('full-time', 'contract', 'part-time')),
  description text not null,
  requirements text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- TRIGGERS
-- ============================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_posts_updated_at
  before update on posts
  for each row execute function update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table posts enable row level security;
alter table portfolio_items enable row level security;
alter table job_postings enable row level security;
alter table inquiries enable row level security;

-- posts: public can read published posts
create policy "Public can read published posts"
  on posts for select
  to anon, authenticated
  using (is_published = true);

-- posts: admin can do anything
create policy "Admin full access to posts"
  on posts for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- portfolio_items: public can read all
create policy "Public can read portfolio items"
  on portfolio_items for select
  to anon, authenticated
  using (true);

-- portfolio_items: admin can do anything
create policy "Admin full access to portfolio"
  on portfolio_items for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- job_postings: public can read active
create policy "Public can read active job postings"
  on job_postings for select
  to anon, authenticated
  using (is_active = true);

-- job_postings: admin can do anything
create policy "Admin full access to jobs"
  on job_postings for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- inquiries: anyone can insert
create policy "Anyone can submit inquiry"
  on inquiries for insert
  to anon, authenticated
  with check (true);

-- inquiries: admin can read and update
create policy "Admin can read inquiries"
  on inquiries for select
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin');

create policy "Admin can update inquiries"
  on inquiries for update
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- ============================================
-- STORAGE BUCKETS
-- ============================================

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

-- Allow public read of storage buckets
create policy "Public read post-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'post-images');

create policy "Admin upload post-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images' and (auth.jwt() ->> 'role') = 'admin');

create policy "Public read portfolio-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-images');

create policy "Admin upload portfolio-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-images' and (auth.jwt() ->> 'role') = 'admin');

-- ============================================
-- SEED DATA
-- ============================================

-- Posts (5 total: 3 news, 2 blog)
insert into posts (title, title_en, slug, content, content_en, excerpt, category, is_published, published_at) values
(
  'TechVision, 2025년 AI 솔루션 사업 본격 출범',
  'TechVision Launches AI Solution Business in 2025',
  'techvision-ai-launch-2025',
  'TechVision Solutions가 2025년부터 인공지능(AI) 기반 솔루션 사업을 본격적으로 시작한다고 발표했습니다. 회사는 자연어 처리, 컴퓨터 비전, 예측 분석 등 다양한 AI 기술을 활용한 맞춤형 솔루션을 기업 고객에게 제공할 계획입니다. TechVision의 CEO는 "AI는 더 이상 미래의 기술이 아닌 현재의 비즈니스 도구입니다. 우리는 고객사가 AI를 통해 실질적인 비즈니스 가치를 창출할 수 있도록 돕겠습니다"라고 밝혔습니다.',
  'TechVision Solutions has announced the full launch of its AI-based solutions business starting in 2025. The company plans to provide customized solutions to enterprise clients using various AI technologies including natural language processing, computer vision, and predictive analytics.',
  'TechVision Solutions가 2025년부터 AI 솔루션 사업을 본격 시작합니다.',
  'news',
  true,
  '2025-01-15 09:00:00+09'
),
(
  '글로벌 IT 기업과 전략적 파트너십 체결',
  'Strategic Partnership with Global IT Company',
  'global-partnership-2024',
  'TechVision Solutions는 글로벌 클라우드 서비스 기업과 전략적 파트너십을 체결했습니다. 이번 파트너십을 통해 TechVision은 엔터프라이즈급 클라우드 인프라 구축 및 마이그레이션 서비스를 강화할 예정입니다. 양사는 공동 마케팅 및 기술 협력을 통해 국내 클라우드 시장 점유율을 높여나갈 계획입니다.',
  'TechVision Solutions has signed a strategic partnership with a global cloud services company. Through this partnership, TechVision will strengthen its enterprise-grade cloud infrastructure and migration services.',
  '글로벌 클라우드 기업과 전략적 파트너십을 체결했습니다.',
  'news',
  true,
  '2024-11-20 10:00:00+09'
),
(
  '2024 대한민국 IT혁신 대상 수상',
  'Winner of 2024 Korea IT Innovation Award',
  'it-innovation-award-2024',
  'TechVision Solutions가 2024 대한민국 IT혁신 대상에서 중소·중견기업 부문 최우수상을 수상했습니다. 이번 수상은 회사의 지속적인 기술 혁신과 고객 중심 서비스 철학을 인정받은 결과입니다. 시상식은 지난 12월 서울 코엑스에서 개최되었으며, TechVision은 특히 핀테크 분야 디지털 전환 프로젝트에서 높은 평가를 받았습니다.',
  'TechVision Solutions won the Best Award in the SME category at the 2024 Korea IT Innovation Awards. This award recognizes the company''s continuous technological innovation and customer-centric service philosophy.',
  '2024 대한민국 IT혁신 대상 중소·중견기업 부문 최우수상을 수상했습니다.',
  'news',
  true,
  '2024-12-10 14:00:00+09'
),
(
  'Next.js 15로 웹 성능을 극대화하는 방법',
  'Maximizing Web Performance with Next.js 15',
  'nextjs-15-performance-guide',
  '웹 애플리케이션의 성능은 사용자 경험과 비즈니스 성과에 직결됩니다. Next.js 15에서 도입된 새로운 기능들을 활용하면 Core Web Vitals 점수를 크게 향상시킬 수 있습니다. 이 글에서는 Server Components, Streaming, Partial Prerendering 등 주요 기능을 실제 프로젝트에 적용하는 방법을 알아보겠습니다. 특히 LCP(Largest Contentful Paint) 개선을 위한 이미지 최적화와 폰트 로딩 전략에 대해 자세히 다루겠습니다.',
  'Web application performance is directly linked to user experience and business outcomes. Next.js 15''s new features can significantly improve Core Web Vitals scores. In this article, we explore how to apply Server Components, Streaming, and Partial Prerendering to real projects.',
  'Next.js 15의 새로운 기능으로 웹 성능을 최적화하는 실전 가이드입니다.',
  'blog',
  true,
  '2025-02-01 09:00:00+09'
),
(
  'TypeScript 5.0 새 기능 완벽 정리',
  'Complete Guide to TypeScript 5.0 New Features',
  'typescript-5-new-features',
  'TypeScript 5.0이 출시되면서 개발자들의 생산성을 높여주는 다양한 새 기능이 추가되었습니다. Decorators의 표준화, const Type Parameters, Multiple Config Files 지원 등 실무에서 바로 활용 가능한 기능들을 정리했습니다. 특히 Decorators는 Angular, NestJS 등의 프레임워크에서 오랫동안 사용해왔지만, 이제 공식 표준으로 자리 잡았습니다.',
  'TypeScript 5.0 introduces various new features that improve developer productivity. We''ve compiled the features you can use right away in production, including standardized Decorators, const Type Parameters, and Multiple Config Files support.',
  'TypeScript 5.0의 새로운 기능을 실무 관점에서 정리합니다.',
  'blog',
  false,
  null
);

-- Portfolio items (4: 2 web, 1 mobile, 1 consulting)
insert into portfolio_items (title, description, client_name, tech_stack, category, is_featured, display_order) values
(
  '핀테크 플랫폼 리디자인',
  '기존 레거시 금융 시스템을 현대적인 웹 플랫폼으로 전환한 프로젝트입니다. 사용자 경험 개선과 성능 최적화에 중점을 두었으며, 거래 처리 속도를 40% 향상시켰습니다. React 기반의 SPA 아키텍처와 GraphQL API를 도입하여 개발 생산성도 크게 높였습니다.',
  'FinBank Corp',
  ARRAY['React', 'TypeScript', 'GraphQL', 'Node.js', 'PostgreSQL', 'AWS'],
  'web',
  true,
  1
),
(
  '스마트 물류 관리 시스템',
  '실시간 물류 추적 및 재고 관리를 위한 통합 웹 플랫폼입니다. 지도 API 연동, 실시간 알림, 대시보드 분석 기능을 포함합니다. 300개 이상의 거점에서 동시 사용 가능한 확장성 있는 아키텍처를 구현했습니다.',
  'LogiTech Solutions',
  ARRAY['Next.js', 'TypeScript', 'Supabase', 'Mapbox', 'Redis', 'Docker'],
  'web',
  false,
  2
),
(
  '헬스케어 모바일 앱',
  '개인 건강 데이터 관리 및 의료진 연결 서비스를 제공하는 크로스플랫폼 모바일 앱입니다. 생체 데이터 모니터링, 원격 진료 예약, 처방전 관리 기능을 제공합니다. 출시 6개월 만에 5만 명 이상의 사용자를 확보했습니다.',
  'MediConnect',
  ARRAY['React Native', 'TypeScript', 'Firebase', 'Node.js', 'MongoDB'],
  'mobile',
  false,
  3
),
(
  '제조업 디지털 전환 컨설팅',
  '전통 제조업체의 디지털 전환을 위한 전략 수립 및 IT 시스템 구축 프로젝트입니다. ERP 시스템 도입, IoT 기반 스마트 팩토리 구축, 데이터 분석 인프라 마련을 포함한 2년 장기 프로젝트를 성공적으로 완수했습니다.',
  'Hansung Manufacturing',
  ARRAY['AWS IoT', 'Python', 'TensorFlow', 'SAP', 'Power BI'],
  'consulting',
  false,
  4
);

-- Job postings (3 active)
insert into job_postings (title, department, location, employment_type, description, requirements, is_active) values
(
  '시니어 프론트엔드 개발자',
  '개발팀',
  '서울 (재택 가능)',
  'full-time',
  'TechVision Solutions의 프론트엔드 팀에서 함께 일할 시니어 개발자를 모집합니다. React/Next.js 기반의 복잡한 웹 애플리케이션을 개발하고, 주니어 개발자를 멘토링하는 역할을 담당합니다. 코드 품질과 사용자 경험을 최우선으로 생각하는 분을 찾습니다.',
  ARRAY['React, Next.js 실무 경력 4년 이상', 'TypeScript 심화 지식', 'CSS-in-JS 또는 Tailwind CSS 경험', '웹 성능 최적화 경험', '협업 및 코드 리뷰 경험'],
  true
),
(
  '백엔드 개발자 (Node.js)',
  '개발팀',
  '서울',
  'full-time',
  'Node.js 기반의 서버 사이드 개발을 담당할 백엔드 개발자를 모집합니다. REST API 및 GraphQL API 설계 및 개발, 데이터베이스 설계 및 최적화, 클라우드 인프라 관리를 주요 업무로 합니다.',
  ARRAY['Node.js 실무 경력 3년 이상', 'PostgreSQL 또는 MySQL 숙련', 'AWS 또는 GCP 경험', 'Docker/Kubernetes 기본 지식', 'RESTful API 설계 경험'],
  true
),
(
  'UX/UI 디자이너',
  '디자인팀',
  '서울 (재택 가능)',
  'full-time',
  '사용자 중심의 인터페이스 디자인을 담당할 디자이너를 모집합니다. 와이어프레임부터 고퀄리티 프로토타입까지, 제품의 전체 디자인 프로세스를 리드합니다. 개발팀과 긴밀하게 협업하여 디자인을 실제 제품으로 구현하는 것을 즐기는 분을 찾습니다.',
  ARRAY['Figma 고급 활용 능력', 'UI/UX 디자인 경력 3년 이상', '반응형 웹 디자인 이해', '디자인 시스템 구축 경험', '사용자 리서치 및 테스트 경험'],
  true
);

-- Inquiries (2)
insert into inquiries (name, email, phone, company, message, is_read) values
(
  '김철수',
  'chulsoo.kim@example.com',
  '010-1234-5678',
  '(주)대한기업',
  '안녕하세요. 저희 회사의 레거시 ERP 시스템을 현대적인 웹 플랫폼으로 전환하는 프로젝트를 검토 중입니다. 프로젝트 규모는 약 6개월 정도로 예상하고 있으며, 예산은 협의 가능합니다. 미팅 일정을 잡을 수 있을까요?',
  true
),
(
  '이영희',
  'younghee.lee@startup.io',
  null,
  '테크스타트업',
  '스타트업 초기 단계에서 MVP 웹서비스 개발을 의뢰하고 싶습니다. React 기반의 SaaS 서비스로, 주요 기능은 사용자 인증, 대시보드, 결제 연동입니다. 예산과 일정에 대해 상담받고 싶습니다.',
  false
);
