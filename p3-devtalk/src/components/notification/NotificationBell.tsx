'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  return (
    <Link
      href="/notifications"
      className={cn(
        'relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground',
        'hover:bg-muted hover:text-foreground transition-colors'
      )}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      <span className="sr-only">알림</span>
    </Link>
  )
}
