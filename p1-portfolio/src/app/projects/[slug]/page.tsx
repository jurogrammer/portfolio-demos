import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjectSlugs, getAdjacentProjects } from '@/lib/content';
import MdxContent from '@/components/MdxContent';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, GitFork, ChevronLeft, ChevronRight } from 'lucide-react';

export async function generateStaticParams() {
  return getProjectSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const project = getProjectBySlug(slug);
    return { title: project.title, description: project.description, openGraph: { images: [project.thumbnail] } };
  } catch { return { title: '프로젝트를 찾을 수 없습니다' }; }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let project;
  try { project = getProjectBySlug(slug); } catch { notFound(); }
  const { prev, next } = getAdjacentProjects(slug);
  return (
    <article className="max-w-4xl mx-auto px-4 py-16 space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{project.category}</Badge>
          <Badge variant="outline">{project.duration}</Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
        <p className="text-lg text-muted-foreground">{project.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
        </div>
        <div className="flex gap-3">
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all"><ExternalLink className="h-3.5 w-3.5" />라이브 데모</a>}
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border bg-background text-sm font-medium transition-all hover:bg-muted"><GitFork className="h-3.5 w-3.5" />GitHub</a>}
        </div>
      </div>
      <div className="relative aspect-video rounded-lg overflow-hidden border">
        <Image src={project.thumbnail} alt={project.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
      </div>
      <Separator />
      <MdxContent source={project.content} />
      <Separator />
      <nav className="grid grid-cols-2 gap-4">
        <div>{prev && <Link href={`/projects/${prev.slug}`} className="group flex flex-col gap-1 p-4 rounded-lg border hover:bg-muted transition-colors"><span className="text-xs text-muted-foreground flex items-center gap-1"><ChevronLeft className="h-3 w-3" />이전</span><span className="text-sm font-medium group-hover:text-primary line-clamp-1">{prev.title}</span></Link>}</div>
        <div className="text-right">{next && <Link href={`/projects/${next.slug}`} className="group flex flex-col gap-1 p-4 rounded-lg border hover:bg-muted transition-colors items-end"><span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">다음<ChevronRight className="h-3 w-3" /></span><span className="text-sm font-medium group-hover:text-primary line-clamp-1">{next.title}</span></Link>}</div>
      </nav>
    </article>
  );
}
