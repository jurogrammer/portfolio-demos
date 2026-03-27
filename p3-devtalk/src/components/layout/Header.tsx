'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, type FormEvent } from 'react'
import { Search, Sun, Moon, Menu, LogIn, UserPlus, LogOut, User, Settings, Shield } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { NotificationBell } from '@/components/notification/NotificationBell'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { CATEGORIES } from '@/types/database'
import type { Profile } from '@/types/database'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <Button variant="ghost" size="icon" className="w-9 h-9" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="테마 전환"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

function SearchBar({ onSubmit }: { onSubmit?: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      onSubmit?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 w-48 lg:w-64"
        />
      </div>
    </form>
  )
}

const NAV_LINKS = [
  { href: '/', label: '홈' },
  ...CATEGORIES.map((c) => ({ href: `/c/${c.value}`, label: c.label })),
]

export function Header() {
  const router = useRouter()
  const { user, setUser, setLoading } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  useRealtimeNotifications(user?.id)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const profileFromUser = (authUser: { id: string; email?: string | null; created_at?: string; user_metadata?: Record<string, unknown> }): Profile => {
      const meta = authUser.user_metadata ?? {}
      return {
        id: authUser.id,
        username: (meta.username ?? meta.name ?? meta.preferred_username ?? authUser.email?.split('@')[0] ?? 'user') as string,
        avatar_url: (meta.avatar_url ?? meta.picture ?? null) as string | null,
        bio: null,
        points: 0,
        level: 1,
        role: 'user' as const,
        is_banned: false,
        ban_reason: null,
        ban_until: null,
        notify_comments: true,
        notify_votes: true,
        notify_email: false,
        created_at: authUser.created_at ?? new Date().toISOString(),
      }
    }

    const fetchAndSetProfile = async (authUser: { id: string; email?: string | null; created_at?: string; user_metadata?: Record<string, unknown> }) => {
      try {
        const { data: profile } = await supabase
          .from('dt_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        if (!isMounted) return
        setUser(profile ? (profile as Profile) : profileFromUser(authUser))
      } catch {
        if (isMounted) setUser(profileFromUser(authUser))
      }
    }

    // Single source of truth: onAuthStateChange fires INITIAL_SESSION on subscribe
    // (after any needed token refresh), then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED.
    // No parallel getSession() call — avoids competing for the GoTrue lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchAndSetProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-primary shrink-0">
          DevTalk
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" render={<Link href={link.href} />}>
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Desktop search */}
        <div className="hidden md:block">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} />
                      <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem render={<Link href={`/u/${user.username}`} />}>
                    <User className="mr-2 h-4 w-4" />
                    프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/settings" />}>
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      <Shield className="mr-2 h-4 w-4" />
                      관리자
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/auth/login" />}>
                <LogIn className="mr-1.5 h-4 w-4" />
                로그인
              </Button>
              <Button size="sm" render={<Link href="/auth/register" />}>
                <UserPlus className="mr-1.5 h-4 w-4" />
                회원가입
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-bold">DevTalk</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                <div className="mb-4">
                  <SearchBar onSubmit={() => setMobileOpen(false)} />
                </div>
                {NAV_LINKS.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="w-full justify-start"
                    render={<Link href={link.href} />}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
