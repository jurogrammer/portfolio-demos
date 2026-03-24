'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ThumbsUp, MessageSquare, MoreVertical, Flag, Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'  // used in edit form buttons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { getLevelName } from '@/types/database'
import { CommentForm } from './CommentForm'
import { toast } from 'sonner'
import type { Comment } from '@/types/database'

interface CommentItemProps {
  comment: Comment
  postId: string
  postAuthorId: string
  depth?: number
  onRefresh: () => void
}

export function CommentItem({ comment, postId, postAuthorId, depth = 0, onRefresh }: CommentItemProps) {
  const { user } = useAuthStore()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isSaving, setIsSaving] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [localVoteCount, setLocalVoteCount] = useState(comment.upvote_count)

  const isAuthor = user?.id === comment.author_id
  const indentClass = depth === 0 ? '' : 'ml-6 border-l border-border pl-4'

  const handleVote = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      return
    }
    if (isVoting) return
    setIsVoting(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('toggle_vote', {
        p_user_id: user.id,
        p_target_type: 'comment',
        p_target_id: comment.id,
        p_value: 1,
      })
      if (error) throw error
      // Refresh to get accurate count
      setLocalVoteCount((prev) => prev + (data as number))
    } catch {
      toast.error('추천에 실패했습니다.')
    } finally {
      setIsVoting(false)
    }
  }

  const handleEdit = async () => {
    const trimmed = editContent.trim()
    if (!trimmed || trimmed.length < 2) {
      toast.error('댓글은 2자 이상 입력해주세요.')
      return
    }
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('comments')
        .update({ content: trimmed })
        .eq('id', comment.id)
        .eq('author_id', user!.id)
      if (error) throw error
      toast.success('댓글이 수정되었습니다.')
      setIsEditing(false)
      onRefresh()
    } catch {
      toast.error('댓글 수정에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true, content: '삭제된 댓글입니다.' })
        .eq('id', comment.id)
        .eq('author_id', user!.id)
      if (error) throw error
      toast.success('댓글이 삭제되었습니다.')
      onRefresh()
    } catch {
      toast.error('댓글 삭제에 실패했습니다.')
    }
  }

  const handleReport = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      return
    }
    const reason = prompt('신고 사유를 입력하세요:')
    if (!reason?.trim()) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        target_type: 'comment',
        target_id: comment.id,
        reason: reason.trim(),
      })
      if (error) throw error
      toast.success('신고가 접수되었습니다.')
    } catch {
      toast.error('신고에 실패했습니다.')
    }
  }

  if (comment.is_deleted && !comment.replies?.length) {
    return (
      <div className={`py-3 ${indentClass}`}>
        <p className="text-sm text-muted-foreground italic">삭제된 댓글입니다.</p>
      </div>
    )
  }

  const author = comment.author
  const avatarFallback = author?.username?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className={`py-3 ${indentClass}`}>
      {comment.is_deleted ? (
        <p className="text-sm text-muted-foreground italic mb-2">삭제된 댓글입니다.</p>
      ) : (
        <>
          {/* Author row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={author?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{avatarFallback}</AvatarFallback>
              </Avatar>
              <a
                href={`/u/${author?.username}`}
                className="text-sm font-medium hover:underline"
              >
                {author?.username ?? '알 수 없음'}
              </a>
              {author && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  Lv.{author.level} {getLevelName(author.level)}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <MoreVertical className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthor && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </>
                )}
                {!isAuthor && (
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="h-4 w-4 mr-2" />
                    신고
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2 mb-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="resize-none bg-background text-sm"
                disabled={isSaving}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsEditing(false); setEditContent(comment.content) }}
                  disabled={isSaving}
                >
                  취소
                </Button>
                <Button size="sm" onClick={handleEdit} disabled={isSaving}>
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">{comment.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleVote}
              disabled={isVoting}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{localVoteCount}</span>
            </button>
            {depth < 2 && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                답글
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                postAuthorId={postAuthorId}
                parentAuthorId={comment.author_id}
                placeholder={`${author?.username ?? ''}님에게 답글 작성...`}
                onSuccess={() => {
                  setShowReplyForm(false)
                  onRefresh()
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              postAuthorId={postAuthorId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}
