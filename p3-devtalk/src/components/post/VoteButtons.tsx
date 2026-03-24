'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { VoteValue } from '@/types/database'

interface VoteButtonsProps {
  targetType: 'post' | 'comment'
  targetId: string
  upvoteCount: number
  downvoteCount?: number
  currentVote?: VoteValue | null
  onVoteChange?: (newUpvote: number, newDownvote: number, newVote: VoteValue | null) => void
}

export function VoteButtons({
  targetType,
  targetId,
  upvoteCount,
  downvoteCount = 0,
  currentVote = null,
  onVoteChange,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(upvoteCount)
  const [downvotes, setDownvotes] = useState(downvoteCount)
  const [userVote, setUserVote] = useState<VoteValue | null>(currentVote)
  const [loading, setLoading] = useState(false)

  const handleVote = async (value: VoteValue) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('로그인이 필요합니다')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('dt_toggle_vote', {
        p_target_type: targetType,
        p_target_id: targetId,
        p_value: value,
      })
      if (error) throw error

      // data returns updated counts and current vote
      const newUpvote = data?.upvote_count ?? upvotes
      const newDownvote = data?.downvote_count ?? downvotes
      const newVote = data?.user_vote ?? null

      setUpvotes(newUpvote)
      setDownvotes(newDownvote)
      setUserVote(newVote)
      onVoteChange?.(newUpvote, newDownvote, newVote)
    } catch {
      toast.error('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={userVote === 1 ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleVote(1)}
        disabled={loading}
        className="gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{upvotes}</span>
      </Button>
      {targetType === 'post' && (
        <Button
          variant={userVote === -1 ? 'destructive' : 'ghost'}
          size="sm"
          onClick={() => handleVote(-1)}
          disabled={loading}
          className="gap-1"
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{downvotes}</span>
        </Button>
      )}
    </div>
  )
}
