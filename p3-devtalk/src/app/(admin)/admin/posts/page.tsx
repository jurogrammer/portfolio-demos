import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Post } from '@/types/database'
import { CATEGORIES } from '@/types/database'
import { PostActions } from '@/components/admin/PostActions'

async function getPosts(searchParams: { q?: string; category?: string; deleted?: string }) {
  const supabase = createAdminClient()
  let query = supabase
    .from('posts')
    .select('*, author:profiles!author_id(id, username)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.deleted === 'true') {
    query = query.eq('is_deleted', true)
  } else if (!searchParams.deleted) {
    query = query.eq('is_deleted', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Post[]
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; deleted?: string }>
}) {
  const params = await searchParams
  const posts = await getPosts(params)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">게시글 관리</h1>

      <form className="flex gap-2 mb-4 flex-wrap">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="제목 검색..."
          className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <select
          name="category"
          defaultValue={params.category ?? ''}
          className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          name="deleted"
          defaultValue={params.deleted ?? ''}
          className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">정상 게시글</option>
          <option value="true">삭제된 게시글</option>
          <option value="all">전체</option>
        </select>
        <button
          type="submit"
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          검색
        </button>
      </form>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>조회</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  게시글이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-xs truncate font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.author?.username ?? '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{post.view_count}</TableCell>
                  <TableCell>
                    {post.is_deleted ? (
                      <Badge variant="destructive">삭제됨</Badge>
                    ) : post.is_pinned ? (
                      <Badge variant="default">고정</Badge>
                    ) : (
                      <Badge variant="outline">정상</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
                  </TableCell>
                  <TableCell className="text-right">
                    <PostActions post={post} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
