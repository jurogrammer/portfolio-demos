import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PostActions from '@/components/admin/PostActions'

export default async function AdminPostsPage() {
  let posts: any[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    posts = data || []
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">게시글 관리</h1>
        <Button render={<Link href="/admin/posts/new" />}>새 게시글</Button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">제목</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">카테고리</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">상태</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">작성일</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">게시글이 없습니다</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{post.title}</td>
                <td className="p-4"><Badge variant="outline">{post.category}</Badge></td>
                <td className="p-4"><Badge variant={post.is_published ? 'default' : 'secondary'}>{post.is_published ? '발행' : '임시저장'}</Badge></td>
                <td className="p-4 text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString('ko-KR')}</td>
                <td className="p-4 text-right">
                  <PostActions id={post.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
