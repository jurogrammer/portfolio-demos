'use client'

import { usePathname } from 'next/navigation'
import { Menu, RefreshCw } from 'lucide-react'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'

const pageTitles: Record<string, string> = {
  '/dashboard': '개요',
  '/dashboard/inventory': '재고관리',
  '/dashboard/categories': '카테고리',
  '/dashboard/settings': '설정',
}

export default function DashboardHeader({
  onMenuClick,
  refreshAction,
}: {
  onMenuClick: () => void
  refreshAction: () => Promise<void>
}) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const title = pageTitles[pathname] ?? '대시보드'

  function handleRefresh() {
    startTransition(async () => {
      await refreshAction()
    })
  }

  return (
    <header className="h-14 border-b border-border bg-background flex items-center gap-3 px-4 sticky top-0 z-10">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h2 className="font-semibold text-sm flex-1">{title}</h2>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={isPending}
        aria-label="새로고침"
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      </Button>

      <ThemeToggle />
    </header>
  )
}
