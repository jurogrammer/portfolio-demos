import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post/PostCard'
import type { Post } from '@/types/database'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const supabase = await createClient()

  let posts: Post[] = []
  let popularTags: string[] = []

  if (query) {
    const { data } = await supabase.rpc('dt_search_posts', { query_text: query })
    posts = (data ?? []) as Post[]
  }

  // Always fetch popular tags for empty state
  if (!query || posts.length === 0) {
    const { data: tagData } = await supabase
      .from('dt_tags')
      .select('name')
      .order('post_count', { ascending: false })
      .limit(10)
    popularTags = (tagData ?? []).map((t) => t.name)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Search header */}
      <div className="mb-6">
        {query ? (
          <h1 className="text-xl font-semibold">
            <span className="text-primary">&ldquo;{query}&rdquo;</span> 검색 결과{' '}
            <span className="text-muted-foreground font-normal text-base">
              {posts.length}건
            </span>
          </h1>
        ) : (
          <h1 className="text-xl font-semibold text-muted-foreground">검색어를 입력하세요</h1>
        )}
      </div>

      {/* Results */}
      {query && posts.length > 0 ? (
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : query ? (
        /* Empty state */
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground text-lg">검색 결과가 없습니다.</p>
          <p className="text-sm text-muted-foreground">
            다른 키워드로 검색하거나 아래 인기 태그를 확인해보세요.
          </p>
          {popularTags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {popularTags.map((tag) => (
                <a
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* No query — show popular tags */
        popularTags.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">인기 태그</h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <a
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}
