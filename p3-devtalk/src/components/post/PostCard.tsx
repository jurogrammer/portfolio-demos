import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Eye, MessageSquare, ThumbsUp, Pin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Post } from '@/types/database'
import { CATEGORIES, getLevelName } from '@/types/database'

interface PostCardProps {
  post: Post
}

const CATEGORY_COLORS: Record<string, string> = {
  qna: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  free: 'bg-green-500/10 text-green-400 border-green-500/20',
  tech: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  career: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

export default function PostCard({ post }: PostCardProps) {
  const categoryLabel = CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category
  const categoryColor = CATEGORY_COLORS[post.category] ?? 'bg-muted text-muted-foreground'
  const authorName = post.author?.username ?? '알 수 없음'
  const authorAvatar = post.author?.avatar_url ?? null
  const authorLevel = post.author?.level ?? 1
  const levelName = getLevelName(authorLevel)
  const netVotes = post.upvote_count - post.downvote_count

  return (
    <article className="group border-b border-border last:border-0 py-4 hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-lg">
      <Link href={`/post/${post.id}`} className="block">
        <div className="flex items-start gap-3">
          {post.is_pinned && (
            <Pin className="mt-1 h-3.5 w-3.5 text-primary shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            {/* Top row: category badge + title */}
            <div className="flex items-start gap-2 mb-1.5">
              <span
                className={`shrink-0 mt-0.5 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${categoryColor}`}
              >
                {categoryLabel}
              </span>
              <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {post.title}
              </h2>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {post.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom row: author + stats */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Avatar className="h-5 w-5 shrink-0">
                  <AvatarImage src={authorAvatar ?? undefined} alt={authorName} />
                  <AvatarFallback className="text-[10px]">
                    {authorName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  {authorName}
                </span>
                <span className="text-xs text-muted-foreground/60">·</span>
                <span className="text-xs text-muted-foreground/60 shrink-0">{levelName}</span>
                <span className="text-xs text-muted-foreground/60">·</span>
                <time className="text-xs text-muted-foreground/60 shrink-0">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </time>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="h-3 w-3" />
                  {netVotes}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {post.view_count}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {post.comment_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
