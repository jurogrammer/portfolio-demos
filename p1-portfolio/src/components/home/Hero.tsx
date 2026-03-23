'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { buttonVariants } from '@/lib/button-variants';
const AnimateOnScroll = dynamic(() => import('@/components/ui/AnimateOnScroll'), { ssr: false });

export default function Hero() {
  return (
    <section className="py-20 md:py-32 max-w-6xl mx-auto px-4">
      <AnimateOnScroll variant="slideUp">
        <div className="space-y-6 max-w-3xl">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Fullstack Engineer · Injae Ju</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            안녕하세요, 주인재입니다<br />
            <span className="text-primary">풀스택 엔지니어 · Spring · React</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            5년+ 풀스택 경력. 대형 IT 플랫폼에서 500만+ 사용자 서버 구축, 처리량 90% 향상, React/Next.js 어드민 개발.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/projects" className={buttonVariants({ size: 'lg' })}>프로젝트 보기</Link>
            <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'lg' })}>문의하기</Link>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
