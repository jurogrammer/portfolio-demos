import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Eye, Calendar, ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { PostContent } from '@/components/post/PostContent'
import { PostActions } from '@/components/post/PostActions'
import { VoteButtons } from '@/components/post/VoteButtons'
import { CATEGORIES, getLevelName } from '@/types/database'
import type { Post, Vote, Bookmark } from '@/types/database'

const CATEGORY_COLORS: Record<string, string> = {
  qna: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  free: 'bg-green-500/10 text-green-400 border-green-500/20',
  tech: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  career: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch post with author
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error || !post) {
    notFound()
  }

  // Increment view count (fire-and-forget via RPC)
  supabase.rpc('increment_view_count', { p_post_id: id }).then(() => {})

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's vote on this post
  let userVote: Vote | null = null
  let isBookmarked = false
  if (user) {
    const [voteResult, bookmarkResult] = await Promise.all([
      supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_type', 'post')
        .eq('target_id', id)
        .maybeSingle(),
      supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', id)
        .maybeSingle(),
    ])
    userVote = voteResult.data
    isBookmarked = !!bookmarkResult.data
  }

  const typedPost = post as Post & { author: NonNullable<Post['author']> }
  const isAuthor = user?.id === typedPost.author_id
  const categoryLabel = CATEGORIES.find((c) => c.value === typedPost.category)?.label ?? typedPost.category
  const categoryColor = CATEGORY_COLORS[typedPost.category] ?? 'bg-muted text-muted-foreground'
  const levelName = getLevelName(typedPost.author.level)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </Link>

      <article>
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${categoryColor}`}
            >
              {categoryLabel}
            </span>
            {typedPost.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl font-bold leading-snug mb-4">{typedPost.title}</h1>

          {/* Author + meta */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Link href={`/u/${typedPost.author.username}`}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={typedPost.author.avatar_url ?? undefined} alt={typedPost.author.username} />
                  <AvatarFallback>{typedPost.author.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/u/${typedPost.author.username}`}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {typedPost.author.username}
                  </Link>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    Lv.{typedPost.author.level} {levelName}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(typedPost.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    조회 {typedPost.view_count.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <PostActions
              post={typedPost}
              isAuthor={isAuthor}
              isBookmarked={isBookmarked}
            />
          </div>
        </header>

        <Separator className="mb-6" />

        {/* Content */}
        <div className="mb-8">
          <PostContent content={typedPost.content} />
        </div>

        <Separator className="mb-6" />

        {/* Vote section */}
        <div className="flex items-center justify-center gap-4 py-4">
          <VoteButtons
            targetType="post"
            targetId={typedPost.id}
            upvoteCount={typedPost.upvote_count}
            downvoteCount={typedPost.downvote_count}
            currentVote={userVote?.value ?? null}
          />
          <span className="text-sm text-muted-foreground">
            추천 {typedPost.upvote_count} / 비추천 {typedPost.downvote_count}
          </span>
        </div>

        <Separator className="mb-6" />

        {/* Comments section placeholder — rendered by comment system */}
        <section id="comments">
          <h2 className="text-lg font-semibold mb-4">
            댓글 {typedPost.comment_count}개
          </h2>
          <div className="text-sm text-muted-foreground py-8 text-center">
            댓글을 불러오는 중...
          </div>
        </section>
      </article>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, content')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (!post) return {}

  return {
    title: `${post.title} | DevTalk`,
    description: post.content.slice(0, 150).replace(/[#*`]/g, ''),
  }
}
