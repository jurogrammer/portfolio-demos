'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { registerUser } from './actions'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleKakaoRegister = async () => {
    setError('')
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${siteUrl}/auth/callback?redirect=/`,
      },
    })
    if (oauthError) {
      setError('카카오 회원가입에 실패했습니다.')
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (username.length < 2 || username.length > 20) {
      setError('사용자 이름은 2~20자여야 합니다.')
      setLoading(false)
      return
    }

    if (!/^[a-zA-Z0-9_가-힣]+$/.test(username)) {
      setError('사용자 이름은 영문, 숫자, 밑줄, 한글만 사용할 수 있습니다.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    // Server action: create user with auto-confirm + profile
    const result = await registerUser(email, username, password)

    if (!result.success) {
      setError(result.error || '회원가입에 실패했습니다.')
      setLoading(false)
      return
    }

    // Auto-login after successful registration
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // Registration succeeded but auto-login failed — send to login page
      router.push('/auth/login')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>DevTalk 커뮤니티에 참여하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md mb-4">{error}</p>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="username">사용자 이름</Label>
            <Input
              id="username"
              type="text"
              placeholder="devtalk_user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <p className="text-xs text-muted-foreground">영문, 숫자, 밑줄, 한글 2~20자</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="6자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '처리 중...' : '회원가입'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs text-muted-foreground">
            <span className="bg-card px-2">또는</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleKakaoRegister}
          disabled={loading}
        >
          카카오로 회원가입
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?&nbsp;
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          로그인
        </Link>
      </CardFooter>
    </Card>
  )
}
