import Link from 'next/link'
import { ThumbsUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Post } from '@/types/database'

interface PopularPostsProps {
  today: Post[]
  week: Post[]
  month: Post[]
}

function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">게시글이 없습니다.</p>
  }
  return (
    <ol className="space-y-2">
      {posts.map((post, idx) => (
        <li key={post.id} className="flex items-start gap-2">
          <span className="shrink-0 text-xs font-bold text-muted-foreground/60 w-4 pt-0.5">
            {idx + 1}
          </span>
          <div className="min-w-0 flex-1">
            <Link
              href={`/post/${post.id}`}
              className="text-xs font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {post.title}
            </Link>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              {post.upvote_count - post.downvote_count}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function PopularPosts({ today, week, month }: PopularPostsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">인기글</h2>
      <Tabs defaultValue="today">
        <TabsList className="w-full mb-3 h-8">
          <TabsTrigger value="today" className="flex-1 text-xs">오늘</TabsTrigger>
          <TabsTrigger value="week" className="flex-1 text-xs">이번 주</TabsTrigger>
          <TabsTrigger value="month" className="flex-1 text-xs">이번 달</TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <PostList posts={today} />
        </TabsContent>
        <TabsContent value="week">
          <PostList posts={week} />
        </TabsContent>
        <TabsContent value="month">
          <PostList posts={month} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
