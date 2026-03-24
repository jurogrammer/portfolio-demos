import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationList } from '@/components/notification/NotificationList'
import { MarkAllReadButton } from '@/components/notification/MarkAllReadButton'
import type { Notification } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '알림 — DevTalk' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const notifications = (data ?? []) as Notification[]
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          알림{' '}
          {unreadCount > 0 && (
            <span className="text-muted-foreground font-normal text-base">
              ({unreadCount}개 읽지 않음)
            </span>
          )}
        </h1>
        {unreadCount > 0 && <MarkAllReadButton userId={user.id} />}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <NotificationList notifications={notifications} />
      </div>
    </div>
  )
}
