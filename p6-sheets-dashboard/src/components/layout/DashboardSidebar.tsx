'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Tags, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const navItems = [
  { href: '/dashboard', label: '개요', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/inventory', label: '재고관리', icon: Package },
  { href: '/dashboard/categories', label: '카테고리', icon: Tags },
  { href: '/dashboard/settings', label: '설정', icon: Settings },
]

function NavLinks() {
  const pathname = usePathname()
  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="font-bold text-lg">재고관리 대시보드</h1>
        <p className="text-muted-foreground text-xs mt-1">Google Sheets 연동</p>
      </div>
      <NavLinks />
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 fill-current text-green-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.9 2H8.1A2.1 2.1 0 0 0 6 4.1v2.1H4.1A2.1 2.1 0 0 0 2 8.3v11.6A2.1 2.1 0 0 0 4.1 22h11.8a2.1 2.1 0 0 0 2.1-2.1V17.9h1.9a2.1 2.1 0 0 0 2.1-2.1V4.1A2.1 2.1 0 0 0 19.9 2zM16 19.9a.1.1 0 0 1-.1.1H4.1a.1.1 0 0 1-.1-.1V8.3a.1.1 0 0 1 .1-.1H6v7.6A2.1 2.1 0 0 0 8.1 18H16zm3.9-4.1a.1.1 0 0 1-.1.1H8.1a.1.1 0 0 1-.1-.1V4.1a.1.1 0 0 1 .1-.1h11.8a.1.1 0 0 1 .1.1z" />
          </svg>
          <span>Powered by Google Sheets</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[250px] lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose()}>
        <SheetContent side="left" className="w-[250px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
