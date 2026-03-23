import Link from 'next/link';
import { getFeaturedProjects } from '@/lib/content';
import ProjectCard from '@/components/projects/ProjectCard';
import { buttonVariants } from '@/lib/button-variants';

export default function FeaturedProjects() {
  const projects = getFeaturedProjects();
  if (projects.length === 0) return null;
  return (
    <section className="py-16 max-w-6xl mx-auto px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">주요 프로젝트</h2>
          <p className="text-muted-foreground mt-1">실제 비즈니스 문제를 해결한 케이스 스터디</p>
        </div>
        <Link href="/projects" className={buttonVariants({ variant: 'ghost' })}>전체 보기 →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
      </div>
    </section>
  );
}
