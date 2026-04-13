'use server'

import { createClient } from '@/lib/supabase/server'
import { Essay } from '@/types/database'

export async function getMyEssays() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('ss_essays')
    .select('*, scholarship:ss_scholarships(id, name, organization)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('getMyEssays error:', error)
    return []
  }

  return data ?? []
}

export async function getEssay(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('ss_essays')
    .select('*, scholarship:ss_scholarships(id, name, organization, essay_prompts)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('getEssay error:', error)
    return null
  }

  return data
}

export async function saveEssay(scholarshipId: string, content: Record<string, string>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { data, error } = await supabase
    .from('ss_essays')
    .upsert(
      {
        user_id: user.id,
        scholarship_id: scholarshipId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,scholarship_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('saveEssay error:', error)
    throw new Error('저장에 실패했습니다.')
  }

  return data as Essay
}

export async function deleteEssay(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await supabase
    .from('ss_essays')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('deleteEssay error:', error)
    throw new Error('삭제에 실패했습니다.')
  }
}
