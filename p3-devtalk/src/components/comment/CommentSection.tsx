'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import type { Comment } from '@/types/database'

interface CommentSectionProps {
  postId: string
  postAuthorId: string
  initialCommentCount?: number
}

export function CommentSection({ postId, postAuthorId, initialCommentCount = 0 }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch comments:', error)
      return
    }

    const raw = (data ?? []) as Comment[]

    // Build tree: top-level comments with nested replies (up to 2 levels)
    const topLevel: Comment[] = []
    const byId = new Map<string, Comment>()

    for (const c of raw) {
      byId.set(c.id, { ...c, replies: [] })
    }

    for (const c of raw) {
      const node = byId.get(c.id)!
      if (!c.parent_id) {
        topLevel.push(node)
      } else {
        const parent = byId.get(c.parent_id)
        if (parent) {
          // Find the true root ancestor to determine depth
          let rootId = c.parent_id
          while (byId.get(rootId)?.parent_id) {
            rootId = byId.get(rootId)!.parent_id!
          }
          if (rootId === c.parent_id) {
            // Direct child of top-level → depth 1
            parent.replies = parent.replies ?? []
            parent.replies.push(node)
          } else {
            // Grandchild or deeper → append flat to the top-level comment's replies
            const topAncestor = byId.get(rootId)
            if (topAncestor) {
              topAncestor.replies = topAncestor.replies ?? []
              topAncestor.replies.push(node)
            }
          }
        } else {
          topLevel.push(node)
        }
      }
    }

    // Sort top-level DESC (newest first)
    topLevel.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    setComments(topLevel)
    setIsLoading(false)
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const totalCount = comments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length ?? 0),
    0
  )

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        댓글 <span className="text-muted-foreground font-normal">{totalCount}</span>
      </h2>

      <CommentForm
        postId={postId}
        postAuthorId={postAuthorId}
        onSuccess={fetchComments}
      />

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: Math.max(initialCommentCount, 2) }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2 py-3">
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-muted" />
                  <div className="h-4 w-24 rounded bg-muted" />
                </div>
                <div className="h-4 w-3/4 rounded bg-muted ml-9" />
              </div>
            ))}
          </div>
        ) : (
          <CommentList
            comments={comments}
            postId={postId}
            postAuthorId={postAuthorId}
            onRefresh={fetchComments}
          />
        )}
      </div>
    </section>
  )
}
