'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface CommentFormProps {
  postId: string
  parentId?: string | null
  postAuthorId?: string
  parentAuthorId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
}

export function CommentForm({
  postId,
  parentId = null,
  postAuthorId,
  parentAuthorId,
  onSuccess,
  onCancel,
  placeholder = '댓글을 작성하세요...',
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        댓글을 작성하려면 <a href="/auth/login" className="text-primary underline">로그인</a>이 필요합니다.
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    if (trimmed.length < 2) {
      toast.error('댓글은 2자 이상 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const { data: comment, error } = await supabase
        .from('dt_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          parent_id: parentId,
          content: trimmed,
        })
        .select()
        .single()

      if (error) throw error

      // Update post comment_count
      await supabase.rpc('dt_increment_comment_count', { p_post_id: postId })

      // Add points to comment author (+3)
      await supabase.rpc('dt_add_points', { user_id: user.id, points: 3 })

      // Create notifications
      const notificationsToInsert: {
        user_id: string
        type: string
        message: string
        link: string
      }[] = []

      const postLink = `/post/${postId}`

      if (parentId) {
        // Reply: notify parent comment author (if different from self)
        if (parentAuthorId && parentAuthorId !== user.id) {
          notificationsToInsert.push({
            user_id: parentAuthorId,
            type: 'reply',
            message: `${user.username}님이 회원님의 댓글에 답글을 달았습니다.`,
            link: postLink,
          })
        }
      } else {
        // Top-level comment: notify post author (if different from self)
        if (postAuthorId && postAuthorId !== user.id) {
          notificationsToInsert.push({
            user_id: postAuthorId,
            type: 'comment',
            message: `${user.username}님이 회원님의 게시글에 댓글을 달았습니다.`,
            link: postLink,
          })
        }
      }

      if (notificationsToInsert.length > 0) {
        await supabase.from('dt_notifications').insert(notificationsToInsert)
      }

      setContent('')
      toast.success('댓글이 작성되었습니다.')
      onSuccess?.()
    } catch (err) {
      console.error(err)
      toast.error('댓글 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="resize-none bg-background"
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting || content.trim().length < 2}>
          {isSubmitting ? '등록 중...' : '댓글 등록'}
        </Button>
      </div>
    </form>
  )
}
