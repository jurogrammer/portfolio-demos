import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Post } from '@/types/database'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const { createClient: createSC } = await import('@supabase/supabase-js')
    const supabase = createSC(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    )
    const { data } = await supabase.from('posts').select('slug').eq('is_published', true)
    const locales = ['ko', 'en']
    return (data || []).flatMap((p: { slug: string }) => locales.map(locale => ({ locale, slug: p.slug })))
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('posts').select('title, title_en, excerpt').eq('slug', slug).single()
    if (data) {
      const title = locale === 'en' && data.title_en ? data.title_en : data.title
      return { title, description: data.excerpt }
    }
  } catch {}
  return { title: 'News' }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const isEn = locale === 'en'
  let post: Post | null = null
  let related: Post[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('posts').select('*').eq('slug', slug).eq('is_published', true).single()
    if (!data) notFound()
    post = data
    const { data: relData } = await supabase
      .from('posts')
      .select('*')
      .eq('category', data.category)
      .eq('is_published', true)
      .neq('slug', slug)
      .limit(3)
    related = relData || []
  } catch { notFound() }

  if (!post) notFound()

  return (
    <article className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className={`h-64 rounded-2xl mb-8 bg-gradient-to-br ${post.category === 'blog' ? 'from-purple-400 to-purple-600' : 'from-blue-400 to-blue-600'}`} />
        <div className="flex items-center gap-3 mb-4">
          <Badge>{post.category === 'blog' ? (isEn ? 'Blog' : '블로그') : (isEn ? 'News' : '뉴스')}</Badge>
          {post.published_at && (
            <span className="text-sm text-gray-500">
              {new Date(post.published_at).toLocaleDateString(isEn ? 'en-US' : 'ko-KR')}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {isEn && post.title_en ? post.title_en : post.title}
        </h1>
        <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
          {isEn && post.content_en ? post.content_en : post.content}
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-xl font-bold mb-6">{isEn ? 'Related Posts' : '관련 게시글'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.id} href={`/${locale}/news/${r.slug}`} className="block rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-sm line-clamp-2">{isEn && r.title_en ? r.title_en : r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href={`/${locale}/news`} className="text-blue-600 hover:underline text-sm">← {isEn ? 'Back to News' : '뉴스 목록으로'}</Link>
        </div>
      </div>
    </article>
  )
}
