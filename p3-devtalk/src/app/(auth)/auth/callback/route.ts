import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const origin = url.origin
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') ?? '/'

  if (code) {
    const response = NextResponse.redirect(`${origin}${redirect}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && sessionData.user) {
      // Ensure dt_profiles row exists for OAuth users (e.g. Kakao)
      const admin = createAdminClient()
      const userId = sessionData.user.id

      const { data: existingProfile } = await admin
        .from('dt_profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (!existingProfile) {
        // Derive username from Kakao metadata or email
        const meta = sessionData.user.user_metadata ?? {}
        const rawName: string =
          meta.full_name ?? meta.name ?? meta.preferred_username ?? ''

        // Sanitize: keep Korean, alphanumeric, underscore; collapse spaces to _
        const sanitized = rawName
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_가-힣]/g, '')
          .slice(0, 16)

        // Generate unique username
        const base = sanitized || 'user'
        const shortId = userId.replace(/-/g, '').slice(0, 6)
        let username = `${base}_${shortId}`

        // Check uniqueness; if taken, append more of the id
        const { data: taken } = await admin
          .from('dt_profiles')
          .select('id')
          .eq('username', username)
          .single()

        if (taken) {
          const longId = userId.replace(/-/g, '').slice(0, 12)
          username = `user_${longId}`
          // Final uniqueness fallback: append random suffix
          const { data: taken2 } = await admin
            .from('dt_profiles')
            .select('id')
            .eq('username', username)
            .single()
          if (taken2) {
            username = `user_${longId}_${Date.now().toString(36).slice(-4)}`
          }
        }

        const avatarUrl: string | null =
          meta.avatar_url ?? meta.picture ?? meta.profile_image ?? meta.profile_image_url ?? null

        const { error: profileError } = await admin.from('dt_profiles').upsert({
          id: userId,
          username,
          avatar_url: avatarUrl,
        }, { onConflict: 'id' })

        if (profileError) {
          console.error('OAuth profile upsert failed:', profileError)
          // Don't block login — user is authenticated, profile can be created later
        }
      }

      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
}
