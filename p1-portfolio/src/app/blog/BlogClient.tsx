'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { BlogMeta } from '@/types/content';

export default function BlogClient({ posts }: { posts: BlogMeta[] }) {
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filtered = activeTag ? posts.filter(p => p.tags.includes(activeTag)) : posts;
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">블로그</h1>
        <p className="text-muted-foreground">기술 의사결정과 개발 경험을 기록합니다</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant={activeTag === null ? 'default' : 'outline'} size="sm" onClick={() => setActiveTag(null)}>All</Button>
        {allTags.map(tag => (
          <Button key={tag} variant={activeTag === tag ? 'default' : 'outline'} size="sm" onClick={() => setActiveTag(tag)}>{tag}</Button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <article className="p-6 rounded-lg border hover:bg-muted/50 transition-colors space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">{post.title}</h2>
                <span className="text-xs text-muted-foreground shrink-0">{post.readingTime}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
