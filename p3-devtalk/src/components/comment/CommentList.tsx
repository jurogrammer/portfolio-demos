'use client'

import { CommentItem } from './CommentItem'
import type { Comment } from '@/types/database'

interface CommentListProps {
  comments: Comment[]
  postId: string
  postAuthorId: string
  onRefresh: () => void
}

export function CommentList({ comments, postId, postAuthorId, onRefresh }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
      </p>
    )
  }

  return (
    <div className="divide-y divide-border">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          postAuthorId={postAuthorId}
          depth={0}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}
