'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck, Flag, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Post } from '@/types/database'

interface PostActionsProps {
  post: Post
  isAuthor: boolean
  isBookmarked: boolean
}

export function PostActions({ post, isAuthor, isBookmarked }: PostActionsProps) {
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)

  const handleBookmark = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('로그인이 필요합니다')
      return
    }

    setBookmarkLoading(true)
    try {
      if (bookmarked) {
        await supabase
          .from('dt_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)
        setBookmarked(false)
        toast.success('북마크가 해제되었습니다')
      } else {
        await supabase
          .from('dt_bookmarks')
          .insert({ user_id: user.id, post_id: post.id })
        setBookmarked(true)
        toast.success('북마크에 추가되었습니다')
      }
    } catch {
      toast.error('오류가 발생했습니다')
    } finally {
      setBookmarkLoading(false)
    }
  }

  const handleDelete = async () => {
    const supabase = createClient()
    setDeleteLoading(true)
    try {
      const { error } = await supabase
        .from('dt_posts')
        .update({ is_deleted: true })
        .eq('id', post.id)
      if (error) throw error
      toast.success('게시글이 삭제되었습니다')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('삭제 중 오류가 발생했습니다')
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('신고 사유를 입력해주세요')
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('로그인이 필요합니다')
      return
    }

    setReportLoading(true)
    try {
      const { error } = await supabase.from('dt_reports').insert({
        reporter_id: user.id,
        target_type: 'post',
        target_id: post.id,
        reason: reportReason.trim(),
      })
      if (error) throw error
      toast.success('신고가 접수되었습니다')
      setReportOpen(false)
      setReportReason('')
    } catch {
      toast.error('신고 중 오류가 발생했습니다')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className="gap-1"
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">북마크</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReportOpen(true)}
          className="gap-1 text-muted-foreground"
        >
          <Flag className="h-4 w-4" />
          <span className="hidden sm:inline">신고</span>
        </Button>

        {isAuthor && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/post/${post.id}/edit`)}
              className="gap-1"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">수정</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">삭제</span>
            </Button>
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 신고</DialogTitle>
            <DialogDescription>
              신고 사유를 입력해주세요. 운영진이 검토 후 처리합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="report-reason">신고 사유</Label>
            <Textarea
              id="report-reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="신고 사유를 자세히 입력해주세요"
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              취소
            </Button>
            <Button onClick={handleReport} disabled={reportLoading}>
              {reportLoading ? '신고 중...' : '신고하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
