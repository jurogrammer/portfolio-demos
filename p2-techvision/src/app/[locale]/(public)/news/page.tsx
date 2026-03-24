import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Post } from '@/types/database'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return { title: locale === 'en' ? 'News & Blog' : '뉴스 & 블로그' }
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const perPage = 12
  const isEn = locale === 'en'

  let posts: Post[] = []
  let total = 0
  try {
    const supabase = await createClient()
    const from = (page - 1) * perPage
    const { data, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(from, from + perPage - 1)
    posts = data || []
    total = count || 0
  } catch {}

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">{isEn ? 'News & Blog' : '뉴스 & 블로그'}</h1>
          <p className="text-white/90">{isEn ? 'Latest news and tech insights' : '최신 소식과 기술 인사이트'}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-12">{isEn ? 'No posts available' : '게시글이 없습니다'}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {posts.map(post => (
                  <Link key={post.id} href={`/${locale}/news/${post.slug}`} className="block rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`h-40 bg-gradient-to-br ${post.category === 'blog' ? 'from-purple-400 to-purple-600' : 'from-blue-400 to-blue-600'}`} />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={post.category === 'blog' ? 'secondary' : 'default'} className="text-xs">
                          {post.category === 'blog' ? (isEn ? 'Blog' : '블로그') : (isEn ? 'News' : '뉴스')}
                        </Badge>
                        {post.published_at && (
                          <span className="text-xs text-gray-400">
                            {new Date(post.published_at).toLocaleDateString(isEn ? 'en-US' : 'ko-KR')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {isEn && post.title_en ? post.title_en : post.title}
                      </h3>
                      {post.excerpt && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {page > 1 && (
                    <Link href={`/${locale}/news?page=${page - 1}`} className="px-4 py-2 border rounded hover:bg-gray-50">
                      {isEn ? 'Prev' : '이전'}
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Link
                      key={p}
                      href={`/${locale}/news?page=${p}`}
                      className={`px-4 py-2 border rounded ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link href={`/${locale}/news?page=${page + 1}`} className="px-4 py-2 border rounded hover:bg-gray-50">
                      {isEn ? 'Next' : '다음'}
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
