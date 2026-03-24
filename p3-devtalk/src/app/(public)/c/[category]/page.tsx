import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PenSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post/PostCard'
import CategoryNav from '@/components/home/CategoryNav'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { CATEGORIES } from '@/types/database'
import type { Post, Category } from '@/types/database'

const PAGE_SIZE = 20

type SortKey = 'latest' | 'popular' | 'comments'

const SORT_LABELS: Record<SortKey, string> = {
  latest: '최신순',
  popular: '인기순',
  comments: '댓글많은순',
}

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}

async function getPosts(
  category: Category,
  sort: SortKey,
  page: number,
): Promise<{ posts: Post[]; total: number }> {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('dt_posts')
    .select('*, author:profiles(*)', { count: 'exact' })
    .eq('category', category)
    .eq('is_deleted', false)

  // Pinned posts always first, then sort
  if (sort === 'popular') {
    query = query
      .order('is_pinned', { ascending: false })
      .order('upvote_count', { ascending: false })
  } else if (sort === 'comments') {
    query = query
      .order('is_pinned', { ascending: false })
      .order('comment_count', { ascending: false })
  } else {
    query = query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
  }

  query = query.range(from, to)

  const { data, count } = await query
  return { posts: (data as Post[]) ?? [], total: count ?? 0 }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params
  const { sort: sortParam, page: pageParam } = await searchParams

  const categoryDef = CATEGORIES.find((c) => c.value === category)
  if (!categoryDef) notFound()

  const sort: SortKey = (sortParam as SortKey) ?? 'latest'
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const { posts, total } = await getPosts(category as Category, sort, page)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex gap-6">
      {/* Left sidebar: category nav (desktop) */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-20">
          <CategoryNav active={category as Category} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile category tabs */}
        <nav className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <Link
            href="/"
            className="shrink-0 rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs font-medium hover:bg-muted/80 transition-colors"
          >
            전체
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/c/${cat.value}`}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                cat.value === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-foreground">{categoryDef.label}</h1>
          <Link
            href="/write"
            className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <PenSquare className="h-3.5 w-3.5" />
            글쓰기
          </Link>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-1 mb-4">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <Link
              key={key}
              href={`/c/${category}?sort=${key}&page=1`}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                sort === key
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {SORT_LABELS[key]}
            </Link>
          ))}
        </div>

        {/* Post list */}
        <div className="rounded-lg border border-border bg-card px-4">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              게시글이 없습니다. 첫 번째 글을 작성해보세요!
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={`/c/${category}?sort=${sort}&page=${page - 1}`} />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Show pages around current
                  let p: number
                  if (totalPages <= 7) {
                    p = i + 1
                  } else if (page <= 4) {
                    p = i + 1
                    if (i >= 5) p = totalPages - (6 - i)
                  } else if (page >= totalPages - 3) {
                    p = totalPages - 6 + i
                  } else {
                    p = page - 3 + i
                  }
                  return (
                    <PaginationItem key={p}>
                      <Link
                        href={`/c/${category}?sort=${sort}&page=${p}`}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors ${
                          p === page
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {p}
                      </Link>
                    </PaginationItem>
                  )
                })}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={`/c/${category}?sort=${sort}&page=${page + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  )
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.value }))
}
