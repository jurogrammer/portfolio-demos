import { MessageSquare, BarChart3, AlertTriangle, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const workflows = [
  {
    icon: MessageSquare,
    title: "고객 문의 자동 처리",
    description: "웹훅 수신 → AI 분류 → Slack 알림 → Sheets 저장 → 자동 응답 이메일",
    steps: ["웹훅 수신", "AI 분류", "Slack 알림", "Sheets 저장", "이메일 응답"],
  },
  {
    icon: BarChart3,
    title: "일일 문의 요약 리포트",
    description: "매일 오전 9시 자동 집계 → 카테고리별 통계 → 이메일/Slack 리포트",
    steps: ["자동 집계", "카테고리 통계", "이메일 발송", "Slack 리포트"],
  },
  {
    icon: AlertTriangle,
    title: "미응답 문의 에스컬레이션",
    description: "24시간 미응답 감지 → Slack 긴급 알림 → 자동 에스컬레이션",
    steps: ["미응답 감지", "긴급 알림", "에스컬레이션"],
  },
];

export function WorkflowCards() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
          자동화 워크플로우
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflows.map(({ icon: Icon, title, description, steps }) => (
            <Card key={title}>
              <CardHeader>
                <div className="mb-2">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{description}</p>
                <div className="flex flex-wrap items-center gap-1">
                  {steps.map((step, i) => (
                    <span key={step} className="flex items-center gap-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{step}</span>
                      {i < steps.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
