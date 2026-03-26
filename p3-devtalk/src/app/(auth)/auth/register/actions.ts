'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface RegisterResult {
  success: boolean
  error?: string
}

export async function registerUser(
  email: string,
  username: string,
  password: string
): Promise<RegisterResult> {
  const supabase = createAdminClient()

  // Check username uniqueness
  const { data: existing } = await supabase
    .from('dt_profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    return { success: false, error: '이미 사용 중인 사용자 이름입니다.' }
  }

  // Create user with auto-confirm (no email verification needed)
  const { data, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  })

  if (createError) {
    if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
      return { success: false, error: '이미 가입된 이메일입니다.' }
    }
    return { success: false, error: '회원가입에 실패했습니다. 다시 시도해주세요.' }
  }

  if (!data.user) {
    return { success: false, error: '회원가입에 실패했습니다. 다시 시도해주세요.' }
  }

  // Create profile (in case there's no database trigger)
  const { error: profileError } = await supabase
    .from('dt_profiles')
    .upsert({
      id: data.user.id,
      username,
    }, { onConflict: 'id' })

  if (profileError) {
    // Profile creation failed but user was created - try to clean up
    console.error('Profile creation failed:', profileError)
    return { success: false, error: '프로필 생성에 실패했습니다. 다시 시도해주세요.' }
  }

  return { success: true }
}
