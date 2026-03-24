'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types/database'

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

export async function warnUser(userId: string, reason: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('dt_profiles')
    .update({ ban_reason: `[경고] ${reason}` })
    .eq('id', userId)
}

export async function banUser(userId: string, reason: string, banUntil: string | null) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('dt_profiles')
    .update({ is_banned: true, ban_reason: reason, ban_until: banUntil })
    .eq('id', userId)
}

export async function unbanUser(userId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('dt_profiles')
    .update({ is_banned: false, ban_reason: null, ban_until: null })
    .eq('id', userId)
}

export async function toggleAdminRole(userId: string, currentRole: UserRole) {
  await requireAdmin()
  const supabase = createAdminClient()
  const newRole: UserRole = currentRole === 'admin' ? 'user' : 'admin'
  await supabase
    .from('dt_profiles')
    .update({ role: newRole })
    .eq('id', userId)
}
