'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function unlinkKakao(kakaoUserId: string) {
  const adminKey = process.env.KAKAO_ADMIN_KEY
  if (!adminKey) return

  await fetch('https://kapi.kakao.com/v1/user/unlink', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `KakaoAK ${adminKey}`,
    },
    body: `target_id_type=user_id&target_id=${kakaoUserId}`,
  }).catch(() => {
    // 연동 해지 실패해도 계정 삭제는 진행
  })
}

export async function deleteAccount(): Promise<{ error: string } | never> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: '로그인이 필요합니다.' }
  }

  const admin = createAdminClient()

  // 카카오 연동 해지
  const { data: userData } = await admin.auth.admin.getUserById(user.id)
  const kakaoIdentity = userData?.user?.identities?.find((i) => i.provider === 'kakao')
  if (kakaoIdentity?.identity_data?.sub) {
    await unlinkKakao(String(kakaoIdentity.identity_data.sub))
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    return { error: '계정 삭제에 실패했습니다.' }
  }

  redirect('/auth/login')
}
