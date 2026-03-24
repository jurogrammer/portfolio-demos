import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostForm } from '@/components/editor/PostForm'
import type { Post } from '@/types/database'

export const metadata = {
  title: '게시글 수정 | DevTalk',
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?next=/post/${id}/edit`)
  }

  const { data: post, error } = await supabase
    .from('dt_posts')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error || !post) {
    notFound()
  }

  // Only author or admin can edit
  if (post.author_id !== user.id) {
    // Check if admin
    const { data: profile } = await supabase
      .from('dt_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      redirect(`/post/${id}`)
    }
  }

  // Fetch existing tags for autocomplete
  const { data: tags } = await supabase
    .from('dt_tags')
    .select('name')
    .order('post_count', { ascending: false })
    .limit(50)

  const tagSuggestions = tags?.map((t) => t.name) ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">게시글 수정</h1>
      <PostForm existingPost={post as Post} tagSuggestions={tagSuggestions} />
    </div>
  )
}
