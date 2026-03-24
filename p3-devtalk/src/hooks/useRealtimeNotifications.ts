'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types/database'

export function useRealtimeNotifications(userId: string | undefined) {
  const { addNotification, setNotifications, setUnreadCount } =
    useNotificationStore()

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    // Initial load
    const loadNotifications = async () => {
      const { data } = await supabase
        .from('dt_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setNotifications(data as Notification[])
      }

      const { count } = await supabase
        .from('dt_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      setUnreadCount(count ?? 0)
    }

    loadNotifications()

    // Realtime subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dt_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addNotification(payload.new as Notification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, addNotification, setNotifications, setUnreadCount])
}
