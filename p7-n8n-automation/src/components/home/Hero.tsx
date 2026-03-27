import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-muted/50 to-background">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          n8n 기반 고객 문의<br className="hidden sm:block" /> 자동화 시스템
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          문의 접수 → AI 분류 → 알림 → 기록을 한 번에 자동화
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" render={<Link href="/inquiry" />}>
            문의하기
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/dashboard" />}>
            현황 보기
          </Button>
        </div>
      </div>
    </section>
  );
}
