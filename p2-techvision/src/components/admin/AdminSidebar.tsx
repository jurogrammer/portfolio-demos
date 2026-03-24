'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Briefcase, Users, MessageSquare, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: '게시글 관리', icon: FileText },
  { href: '/admin/portfolio', label: '포트폴리오 관리', icon: Briefcase },
  { href: '/admin/careers', label: '채용 관리', icon: Users },
  { href: '/admin/inquiries', label: '문의 관리', icon: MessageSquare },
]

export default function AdminSidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <h1 className="font-bold text-lg">TechVision</h1>
        <p className="text-gray-400 text-xs mt-1">Admin Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.href === '/admin/inquiries' && unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs">{unreadCount}</Badge>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Button variant="ghost" onClick={handleSignOut} className="w-full text-gray-300 hover:text-white hover:bg-gray-700 justify-start gap-2">
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  )
}
