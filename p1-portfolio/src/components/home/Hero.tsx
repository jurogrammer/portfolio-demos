'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { buttonVariants } from '@/lib/button-variants';
import { useLocale } from '@/lib/i18n';
const AnimateOnScroll = dynamic(() => import('@/components/ui/AnimateOnScroll'), { ssr: false });

export default function Hero() {
  const { t } = useLocale();
  return (
    <section className="py-20 md:py-32 max-w-6xl mx-auto px-4">
      <AnimateOnScroll variant="slideUp">
        <div className="space-y-6 max-w-3xl">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">{t.hero.label}</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t.hero.greeting} {t.hero.role}<br />
            <span className="text-primary">풀스택 엔지니어 · {t.hero.subtitle}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/projects" className={buttonVariants({ size: 'lg' })}>{t.hero.ctaProjects}</Link>
            <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'lg' })}>{t.hero.ctaContact}</Link>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
