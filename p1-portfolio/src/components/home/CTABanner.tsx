import Link from 'next/link';
import { buttonVariants } from '@/lib/button-variants';

export default function CTABanner() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">프로젝트를 함께 만들어봐요</h2>
        <p className="text-primary-foreground/80 max-w-lg mx-auto">아이디어가 있으신가요? 기획부터 배포까지 빠르고 믿을 수 있게 진행합니다.</p>
        <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>무료 상담 신청</Link>
      </div>
    </section>
  );
}
