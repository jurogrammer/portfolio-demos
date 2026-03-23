import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { ProjectMeta } from '@/types/content';

export default function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <CardContent className="p-5 flex-1 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">{project.category}</Badge>
            <Badge variant="outline" className="text-xs">{project.duration}</Badge>
          </div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">{project.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
        </CardContent>
        <CardFooter className="px-5 pb-5 pt-0 flex flex-wrap gap-1">
          {project.tech.slice(0, 4).map(t => (
            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
          ))}
          {project.tech.length > 4 && (
            <Badge variant="outline" className="text-xs">+{project.tech.length - 4}</Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
