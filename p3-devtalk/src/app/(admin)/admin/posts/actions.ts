'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('dt_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')
}

export async function deletePost(postId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('dt_posts')
    .update({ is_deleted: true })
    .eq('id', postId)
}

export async function restorePost(postId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('dt_posts')
    .update({ is_deleted: false })
    .eq('id', postId)
}

export async function togglePinPost(postId: string, isPinned: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('dt_posts')
    .update({ is_pinned: !isPinned })
    .eq('id', postId)
}

export async function changeCategory(postId: string, category: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('dt_posts').update({ category }).eq('id', postId)
}
