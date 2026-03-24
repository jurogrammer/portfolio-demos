import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostForm } from '@/components/editor/PostForm'

export const metadata = {
  title: '글쓰기 | DevTalk',
}

export default async function WritePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/write')
  }

  // Fetch existing tags for autocomplete
  const { data: tags } = await supabase
    .from('tags')
    .select('name')
    .order('post_count', { ascending: false })
    .limit(50)

  const tagSuggestions = tags?.map((t) => t.name) ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">글쓰기</h1>
      <PostForm tagSuggestions={tagSuggestions} />
    </div>
  )
}
