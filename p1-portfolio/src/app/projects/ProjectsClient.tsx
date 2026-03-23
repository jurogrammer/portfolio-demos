'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/projects/ProjectCard';
import type { ProjectMeta } from '@/types/content';

const CATEGORIES = ['All', 'Enterprise', 'Community', 'SaaS', 'AI'] as const;
type Category = typeof CATEGORIES[number];

export default function ProjectsClient({ projects }: { projects: ProjectMeta[] }) {
  const [active, setActive] = useState<Category>('All');
  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active);
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">프로젝트</h1>
        <p className="text-muted-foreground">실제 비즈니스 문제를 해결한 케이스 스터디</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Button key={cat} variant={active === cat ? 'default' : 'outline'} size="sm" onClick={() => setActive(cat)}>{cat}</Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">해당 카테고리의 프로젝트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(p => <ProjectCard key={p.slug} project={p} />)}
        </div>
      )}
    </div>
  );
}
