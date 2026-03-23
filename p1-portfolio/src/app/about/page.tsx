import type { Metadata } from 'next';
import { CAREER_TIMELINE, TECH_STACK } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: '소개',
  description: '5년+ 풀스택 엔지니어. 커리어와 기술 스택을 소개합니다.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">안녕하세요, 주인재입니다</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">5년+ 풀스택 엔지니어. Kotlin/Spring Boot 백엔드부터 React/Next.js 프론트엔드까지, 대규모 트래픽 최적화와 AI 개발 워크플로우 구축 경험이 있습니다.</p>
      </div>
      <Separator />
      <section className="space-y-8">
        <h2 className="text-2xl font-bold">커리어 히스토리</h2>
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
        <h2 className="text-2xl font-bold">기술 스택</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['backend', 'frontend', 'infra'] as const).map(group => (
            <div key={group} className="space-y-4">
              <h3 className="font-semibold text-primary border-b pb-2 capitalize">{group === 'backend' ? 'Backend' : group === 'frontend' ? 'Frontend' : 'Infra'}</h3>
              <ul className="space-y-3">
                {TECH_STACK[group].map(t => (
                  <li key={t.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.name}</span>
                      <Badge variant="outline" className="text-xs">{t.years}년</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
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
