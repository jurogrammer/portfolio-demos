import { Cpu, Database, LayoutDashboard } from "lucide-react";

const cards = [
  {
    icon: Cpu,
    title: "규칙 엔진",
    description:
      "KEYWORD, PATTERN 두 가지 조건 유형을 지원하는 커스텀 매칭 엔진. 우선순위 기반 규칙 체인으로 가장 적합한 템플릿을 자동 선택합니다.",
    tags: ["TypeScript", "Regex"],
  },
  {
    icon: Database,
    title: "데이터 파이프라인",
    description:
      "사용자 응답 → 규칙 매칭 → 템플릿 렌더링 → 답장 생성 → 데이터셋 저장까지 원자적으로 처리. Prisma + Supabase PostgreSQL 기반의 안정적인 파이프라인.",
    tags: ["Prisma", "Supabase", "PostgreSQL"],
  },
  {
    icon: LayoutDashboard,
    title: "관리자 CMS",
    description:
      "코호트 관리, 질문 스케줄링, 규칙 설정, 템플릿 CRUD, 리뷰 큐, 데이터셋 내보내기까지 — 관리자가 모든 것을 직접 제어할 수 있는 풀 기능 CMS.",
    tags: ["Next.js", "React Hook Form", "Zod"],
  },
];

export default function TechShowcase() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            기술 하이라이트
          </h2>
          <p className="text-muted-foreground">
            견고한 기술 스택으로 구축된 프로덕션 레디 시스템
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, description, tags }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="size-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
