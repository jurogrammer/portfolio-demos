'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MessageSquare, ThumbsUp, Reply, AtSign, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotificationStore } from '@/stores/notification'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types/database'

interface NotificationListProps {
  notifications: Notification[]
}

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  comment: <MessageSquare className="h-4 w-4 text-blue-400" />,
  reply: <Reply className="h-4 w-4 text-green-400" />,
  vote: <ThumbsUp className="h-4 w-4 text-yellow-400" />,
  mention: <AtSign className="h-4 w-4 text-purple-400" />,
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter()
  const { markAsRead } = useNotificationStore()

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      const supabase = createClient()
      await supabase.from('dt_notifications').update({ is_read: true }).eq('id', n.id)
      markAsRead(n.id)
    }
    if (n.link) router.push(n.link)
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <Bell className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">알림이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((n) => (
        <button
          key={n.id}
          onClick={() => handleClick(n)}
          className={cn(
            'w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors',
            !n.is_read && 'bg-primary/5'
          )}
        >
          <div className="mt-0.5 flex-shrink-0">
            {TYPE_ICONS[n.type] ?? <Bell className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm leading-snug', !n.is_read && 'font-medium')}>
              {n.message}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ko })}
            </p>
          </div>
          {!n.is_read && (
            <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  )
}
