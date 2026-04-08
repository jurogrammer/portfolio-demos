import { Mail, PenLine, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Mail,
    title: "질문 수신",
    description:
      "매일 아침 9시, 코호트에 맞춤 설계된 성찰 질문이 메시지함에 도착합니다. 자기인식, 목표설정, 감정관리 등 다양한 카테고리의 질문을 받아보세요.",
  },
  {
    step: "02",
    icon: PenLine,
    title: "응답 작성",
    description:
      "당신의 생각, 감정, 경험을 자유롭게 작성하세요. 짧은 한 줄도, 긴 이야기도 괜찮습니다. 중요한 건 솔직하게 표현하는 것입니다.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "맞춤 답장",
    description:
      "AI 규칙 엔진이 응답을 분석하고, 키워드와 감정에 맞는 리프레이밍 답장을 자동 생성합니다. 새로운 시각으로 생각을 확장해보세요.",
  },
];

export default function FlowSteps() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            이렇게 작동해요
          </h2>
          <p className="text-muted-foreground">
            3단계의 간단한 프로세스로 매일 성장하세요
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(({ step, icon: Icon, title, description }) => (
            <div
              key={step}
              className="relative rounded-xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <span className="text-xs font-semibold tracking-widest text-muted-foreground">
                  STEP {step}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
