import Link from 'next/link'
import { PenSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post/PostCard'
import PopularPosts from '@/components/home/PopularPosts'
import CategoryNav from '@/components/home/CategoryNav'
import type { Post } from '@/types/database'

async function getLatestPosts(): Promise<Post[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dt_posts')
    .select('*, author:dt_profiles(*)')
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)
  return (data as Post[]) ?? []
}

async function getPopularPosts(period: 'today' | 'week' | 'month'): Promise<Post[]> {
  const supabase = await createClient()
  const now = new Date()
  let since: Date

  if (period === 'today') {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === 'week') {
    since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else {
    since = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const { data } = await supabase
    .from('dt_posts')
    .select('*, author:dt_profiles(*)')
    .eq('is_deleted', false)
    .gte('created_at', since.toISOString())
    .order('upvote_count', { ascending: false })
    .limit(5)
  return (data as Post[]) ?? []
}

export default async function HomePage() {
  const [latestPosts, todayPopular, weekPopular, monthPopular] = await Promise.all([
    getLatestPosts(),
    getPopularPosts('today'),
    getPopularPosts('week'),
    getPopularPosts('month'),
  ])

  return (
    <div className="flex gap-6">
      {/* Left sidebar: category nav (desktop) */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-20 space-y-4">
          <CategoryNav active="all" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile category tabs */}
        <nav className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <Link
            href="/"
            className="shrink-0 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium"
          >
            전체
          </Link>
          {[
            { value: 'qna', label: 'Q&A' },
            { value: 'free', label: '자유' },
            { value: 'tech', label: '기술' },
            { value: 'career', label: '커리어' },
          ].map((cat) => (
            <Link
              key={cat.value}
              href={`/c/${cat.value}`}
              className="shrink-0 rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-foreground">최신글</h1>
          <Link
            href="/write"
            className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <PenSquare className="h-3.5 w-3.5" />
            글쓰기
          </Link>
        </div>

        {/* Post list */}
        <div className="rounded-lg border border-border bg-card px-4">
          {latestPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!
            </p>
          ) : (
            latestPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </main>

      {/* Right sidebar: popular posts (desktop) */}
      <aside className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-20">
          <PopularPosts today={todayPopular} week={weekPopular} month={monthPopular} />
        </div>
      </aside>
    </div>
  )
}
