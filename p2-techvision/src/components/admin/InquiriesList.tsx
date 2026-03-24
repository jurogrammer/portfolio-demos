'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import type { Inquiry } from '@/types/database'

export default function InquiriesList({ inquiries }: { inquiries: Inquiry[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [marking, setMarking] = useState<string | null>(null)

  async function markRead(id: string) {
    setMarking(id)
    const supabase = createClient()
    await supabase.from('inquiries').update({ is_read: true }).eq('id', id)
    router.refresh()
    setMarking(null)
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, is_read: true } : null)
  }

  async function openInquiry(inquiry: Inquiry) {
    setSelected(inquiry)
    if (!inquiry.is_read) {
      await markRead(inquiry.id)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">이름</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">이메일</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">회사</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">상태</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">접수일</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inquiries.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">문의가 없습니다</td></tr>
            ) : inquiries.map(inq => (
              <tr
                key={inq.id}
                className={`hover:bg-gray-50 cursor-pointer ${!inq.is_read ? 'font-medium' : ''}`}
                onClick={() => openInquiry(inq)}
              >
                <td className="p-4 text-sm">{inq.name}</td>
                <td className="p-4 text-sm text-gray-600">{inq.email}</td>
                <td className="p-4 text-sm text-gray-600">{inq.company || '-'}</td>
                <td className="p-4">
                  <Badge variant={inq.is_read ? 'secondary' : 'destructive'} className="text-xs">
                    {inq.is_read ? '읽음' : '미읽음'}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(inq.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                  {!inq.is_read && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={marking === inq.id}
                      onClick={() => markRead(inq.id)}
                    >
                      읽음 표시
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>문의 상세</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">이름</p>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">이메일</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                {selected.phone && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">전화번호</p>
                    <p className="font-medium">{selected.phone}</p>
                  </div>
                )}
                {selected.company && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">회사명</p>
                    <p className="font-medium">{selected.company}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2">문의 내용</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>
              <p className="text-xs text-gray-400">
                접수: {new Date(selected.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
