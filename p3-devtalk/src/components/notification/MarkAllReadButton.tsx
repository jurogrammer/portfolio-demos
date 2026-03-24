'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useNotificationStore } from '@/stores/notification'
import { toast } from 'sonner'

export function MarkAllReadButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const { markAllAsRead } = useNotificationStore()

  const handleMarkAll = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      markAllAsRead()
      toast.success('모든 알림을 읽음 처리했습니다.')
    } catch {
      toast.error('처리에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={isLoading}>
      {isLoading ? '처리 중...' : '모두 읽음'}
    </Button>
  )
}
