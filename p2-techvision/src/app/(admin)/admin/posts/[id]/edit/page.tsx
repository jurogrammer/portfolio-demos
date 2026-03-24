import { createAdminClient } from '@/lib/supabase/admin'
import PostForm from '@/components/admin/PostForm'
import { notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let post = null
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('posts').select('*').eq('id', id).single()
    post = data
  } catch {}
  if (!post) notFound()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
      <PostForm initialData={post} />
    </div>
  )
}
