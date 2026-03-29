'use client';
import Link from 'next/link';
import { buttonVariants } from '@/lib/button-variants';
import { useLocale } from '@/lib/i18n';

export default function CTABanner() {
  const { t } = useLocale();
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">{t.cta.title}</h2>
        <p className="text-primary-foreground/80 max-w-lg mx-auto">{t.cta.description}</p>
        <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>{t.cta.button}</Link>
      </div>
    </section>
  );
}
