import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, MessageCircleQuestion } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <MessageCircleQuestion className="size-4" />
          <span>코호트 기반 리플렉션 봇</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          매일 하나의 질문이
          <br />
          <span className="text-primary">생각의 방향을 바꿉니다</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          ReframeBot은 매일 개인화된 성찰 질문을 보내고, 당신의 응답에 맞춤형
          리프레이밍 답변을 제공합니다. 작은 질문 하나가 큰 변화를 만듭니다.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/login" className={buttonVariants({ size: "lg", className: "gap-2 px-8 py-6 text-base" })}>
            시작하기
            <ArrowRight className="size-4" />
          </Link>
          <Link href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg", className: "px-8 py-6 text-base" })}>
            서비스 살펴보기
          </Link>
        </div>
      </div>

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </section>
  );
}
