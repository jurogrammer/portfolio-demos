'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Ban, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Profile } from '@/types/database'
import { banUser, unbanUser, toggleAdminRole, warnUser } from '@/app/(admin)/admin/users/actions'

type BanType = 'warn' | 'temp' | 'permanent'

const banTypeLabel: Record<BanType, string> = {
  warn: '경고',
  temp: '일시정지 (7일)',
  permanent: '영구정지',
}

export function UserActions({ user }: { user: Profile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [banType, setBanType] = useState<BanType>('temp')
  const [reason, setReason] = useState('')

  async function handleSimple(action: () => Promise<void>) {
    setLoading(true)
    try {
      await action()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  function openBanDialog(type: BanType) {
    setBanType(type)
    setReason('')
    setDialogOpen(true)
  }

  async function handleBanSubmit() {
    if (!reason.trim()) return
    setLoading(true)
    try {
      if (banType === 'warn') {
        await warnUser(user.id, reason)
      } else {
        const banUntil = banType === 'temp'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null
        await banUser(user.id, reason, banUntil)
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
          {user.is_banned ? (
            <DropdownMenuItem onClick={() => handleSimple(() => unbanUser(user.id))}>
              <ShieldCheck className="size-4 mr-2" />
              정지 해제
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => openBanDialog('warn')}>
                <AlertTriangle className="size-4 mr-2" />
                경고
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openBanDialog('temp')}>
                <Ban className="size-4 mr-2" />
                일시정지 (7일)
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => openBanDialog('permanent')}>
                <Ban className="size-4 mr-2" />
                영구정지
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSimple(() => toggleAdminRole(user.id, user.role))}>
            <ShieldOff className="size-4 mr-2" />
            {user.role === 'admin' ? '관리자 해제' : '관리자 지정'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {banTypeLabel[banType]} — {user.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ban-reason">사유</Label>
            <Input
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="사유를 입력하세요..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              취소
            </Button>
            <Button
              variant={banType === 'permanent' ? 'destructive' : 'default'}
              onClick={handleBanSubmit}
              disabled={loading || !reason.trim()}
            >
              {banTypeLabel[banType]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
