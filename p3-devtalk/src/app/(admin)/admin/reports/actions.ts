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

export async function resolveReport(reportId: string, adminNote?: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('dt_reports')
    .update({ status: 'resolved', admin_note: adminNote || null })
    .eq('id', reportId)
}

export async function dismissReport(reportId: string, adminNote?: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('dt_reports')
    .update({ status: 'dismissed', admin_note: adminNote || null })
    .eq('id', reportId)
}

export async function deleteReportTarget(
  reportId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  adminNote?: string
) {
  await requireAdmin()
  const supabase = createAdminClient()

  if (targetType === 'post') {
    await supabase.from('dt_posts').update({ is_deleted: true }).eq('id', targetId)
  } else {
    await supabase.from('dt_comments').update({ is_deleted: true }).eq('id', targetId)
  }

  await supabase
    .from('dt_reports')
    .update({ status: 'resolved', admin_note: adminNote || '콘텐츠 삭제됨' })
    .eq('id', reportId)
}
