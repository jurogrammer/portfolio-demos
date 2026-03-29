'use client';
import { CAREER_TIMELINE, TECH_STACK } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/lib/i18n';

export default function AboutClient() {
  const { t } = useLocale();
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">{t.about.title} {t.about.titleSub}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">{t.about.description}</p>
      </div>
      <Separator />
      <section className="space-y-8">
        <h2 className="text-2xl font-bold">{t.about.careerTitle}</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-8">
            {CAREER_TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-6 pl-12 relative">
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-primary font-semibold">{item.year}</span>
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Separator />
      <section className="space-y-8">
        <h2 className="text-2xl font-bold">{t.about.techTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['backend', 'frontend', 'infra'] as const).map(group => (
            <div key={group} className="space-y-4">
              <h3 className="font-semibold text-primary border-b pb-2 capitalize">{group === 'backend' ? 'Backend' : group === 'frontend' ? 'Frontend' : 'Infra'}</h3>
              <ul className="space-y-3">
                {TECH_STACK[group].map(tech => (
                  <li key={tech.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{tech.name}</span>
                      <Badge variant="outline" className="text-xs">{tech.years}{t.about.yearsUnit}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tech.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
