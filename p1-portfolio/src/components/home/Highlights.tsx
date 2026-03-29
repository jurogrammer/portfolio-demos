'use client';
import dynamic from 'next/dynamic';
import { HIGHLIGHTS } from '@/lib/constants';
import { useLocale } from '@/lib/i18n';
const AnimateOnScroll = dynamic(() => import('@/components/ui/AnimateOnScroll'), { ssr: false });

export default function Highlights() {
  const { t } = useLocale();
  return (
    <section className="py-16 border-y bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {HIGHLIGHTS.map((item, i) => (
          <AnimateOnScroll key={item.labelKey} delay={i * 0.1} variant="slideUp">
            <div className="text-center space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-primary">{item.value}</p>
              <p className="text-sm text-muted-foreground">{t.highlights[item.labelKey as keyof typeof t.highlights]}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
