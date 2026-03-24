'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, CheckCircle, XCircle, Trash2, Ban } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Report } from '@/types/database'
import { resolveReport, dismissReport, deleteReportTarget } from '@/app/(admin)/admin/reports/actions'

type ActionType = 'dismiss' | 'resolve' | 'delete'

const actionLabel: Record<ActionType, string> = {
  dismiss: '무시',
  resolve: '처리됨',
  delete: '콘텐츠 삭제',
}

export function ReportActions({ report }: { report: Report }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<ActionType>('dismiss')
  const [adminNote, setAdminNote] = useState('')

  if (report.status !== 'pending') {
    return <span className="text-xs text-muted-foreground">처리됨</span>
  }

  function openDialog(type: ActionType) {
    setActionType(type)
    setAdminNote('')
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      if (actionType === 'dismiss') {
        await dismissReport(report.id, adminNote)
      } else if (actionType === 'resolve') {
        await resolveReport(report.id, adminNote)
      } else {
        await deleteReportTarget(report.id, report.target_type, report.target_id, adminNote)
      }
      setDialogOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={loading}
          className="inline-flex size-7 items-center justify-center rounded-md p-0 text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openDialog('resolve')}>
            <CheckCircle className="size-4 mr-2 text-green-500" />
            처리됨
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('dismiss')}>
            <XCircle className="size-4 mr-2" />
            무시
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => openDialog('delete')}>
            <Trash2 className="size-4 mr-2" />
            콘텐츠 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionLabel[actionType]} — 신고 처리
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="admin-note">관리자 메모 (선택)</Label>
            <Textarea
              id="admin-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="처리 메모를 입력하세요..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              취소
            </Button>
            <Button
              variant={actionType === 'delete' ? 'destructive' : 'default'}
              onClick={handleSubmit}
              disabled={loading}
            >
              {actionLabel[actionType]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
