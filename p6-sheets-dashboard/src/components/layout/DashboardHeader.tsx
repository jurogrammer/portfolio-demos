'use client'

import { usePathname } from 'next/navigation'
import { Menu, RefreshCw } from 'lucide-react'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { useLocale } from '@/lib/i18n'

export default function DashboardHeader({
  onMenuClick,
  refreshAction,
}: {
  onMenuClick: () => void
  refreshAction: () => Promise<void>
}) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const { t } = useLocale()

  const pageTitles: Record<string, string> = {
    '/dashboard': t.nav.overview,
    '/dashboard/inventory': t.nav.inventory,
    '/dashboard/categories': t.nav.categories,
    '/dashboard/settings': t.nav.settings,
  }

  const title = pageTitles[pathname] ?? t.header.dashboard

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
        aria-label={t.header.openMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h2 className="font-semibold text-sm flex-1">{title}</h2>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={isPending}
        aria-label={t.header.refresh}
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      </Button>

      <LanguageToggle />
      <ThemeToggle />
    </header>
  )
}
