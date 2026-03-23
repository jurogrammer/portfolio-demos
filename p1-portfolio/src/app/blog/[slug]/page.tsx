import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogSlugs, getAdjacentBlogPosts, getHeadings } from '@/lib/content';
import MdxContent from '@/components/MdxContent';
import TableOfContents from '@/components/blog/TableOfContents';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export async function generateStaticParams() {
  return getBlogSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = getBlogPostBySlug(slug);
    return { title: post.title, description: post.description };
  } catch { return { title: '포스트를 찾을 수 없습니다' }; }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post;
  try { post = getBlogPostBySlug(slug); } catch { notFound(); }
  const headings = getHeadings(post.content);
  const { prev, next } = getAdjacentBlogPosts(slug);
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12">
        <article className="space-y-8 min-w-0">
          <header className="space-y-4">
            <div className="flex flex-wrap gap-1.5">{post.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
            <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <time>{formatDate(post.date)}</time><span>·</span><span>{post.readingTime}</span>
            </div>
            <p className="text-muted-foreground">{post.description}</p>
          </header>
          <Separator />
          <MdxContent source={post.content} />
          <Separator />
          <nav className="grid grid-cols-2 gap-4">
            <div>{prev && <Link href={`/blog/${prev.slug}`} className="group flex flex-col gap-1 p-4 rounded-lg border hover:bg-muted transition-colors"><span className="text-xs text-muted-foreground flex items-center gap-1"><ChevronLeft className="h-3 w-3" />이전</span><span className="text-sm font-medium group-hover:text-primary line-clamp-1">{prev.title}</span></Link>}</div>
            <div className="text-right">{next && <Link href={`/blog/${next.slug}`} className="group flex flex-col gap-1 p-4 rounded-lg border hover:bg-muted transition-colors items-end"><span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">다음<ChevronRight className="h-3 w-3" /></span><span className="text-sm font-medium group-hover:text-primary line-clamp-1">{next.title}</span></Link>}</div>
          </nav>
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-24"><TableOfContents headings={headings} /></div>
        </aside>
      </div>
    </div>
  );
}
