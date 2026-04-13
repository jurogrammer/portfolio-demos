import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, FileText, Bell, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <GraduationCap className="h-4 w-4" />
            한국 대학생을 위한 장학금 플랫폼
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            장학금 탐색부터<br />
            <span className="text-primary">자소서 작성</span>까지<br />
            10분이면 충분합니다
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            한국장학재단, 사설 재단, 지자체 장학금을 한 곳에서 검색하고,
            AI가 기관별 맞춤 자기소개서 초안을 즉시 생성해드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/scholarships">
                장학금 검색하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">무료로 시작하기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          이렇게 도와드립니다
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Search,
              title: "통합 검색",
              desc: "한국장학재단 + 사설 재단 + 지자체 장학금을 한 화면에서 검색하세요.",
            },
            {
              icon: CheckCircle,
              title: "개인화 매칭",
              desc: "학교·학점·소득분위·지역 기반으로 내게 맞는 장학금을 자동 매칭합니다.",
            },
            {
              icon: FileText,
              title: "AI 자소서 초안",
              desc: "기관별 항목에 맞춰 5~15초 내 한국어 자소서 초안을 생성합니다.",
            },
            {
              icon: Bell,
              title: "마감일 알림",
              desc: "매칭된 장학금의 마감일을 이메일로 미리 알려드립니다.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "300+", label: "등록 장학금" },
              { value: "100+", label: "제공 기관" },
              { value: "AI", label: "자소서 생성" },
              { value: "무료", label: "MVP 기간" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl md:text-4xl font-bold text-primary">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          지금 바로 시작하세요
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          등록금 걱정 대신 공부에 집중할 수 있도록, ScholarSync가 도와드립니다.
        </p>
        <Button size="lg" asChild>
          <Link href="/auth/signup">
            무료 회원가입
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
