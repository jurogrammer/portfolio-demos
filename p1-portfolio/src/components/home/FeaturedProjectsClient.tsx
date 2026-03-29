'use client';
import Link from 'next/link';
import { buttonVariants } from '@/lib/button-variants';
import { useLocale } from '@/lib/i18n';
import ProjectCard from '@/components/projects/ProjectCard';
import type { ProjectMeta } from '@/types/content';

export default function FeaturedProjectsClient({ projects }: { projects: ProjectMeta[] }) {
  const { t } = useLocale();
  return (
    <section className="py-16 max-w-6xl mx-auto px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{t.featuredProjects.title}</h2>
          <p className="text-muted-foreground mt-1">{t.featuredProjects.subtitle}</p>
        </div>
        <Link href="/projects" className={buttonVariants({ variant: 'ghost' })}>{t.common.viewAll}</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
      </div>
    </section>
  );
}
