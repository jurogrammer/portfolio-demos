import { AlertTriangle } from 'lucide-react'

export default function LowStockAlert({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        재고부족 경고: <strong>{count}개</strong> 품목이 최소 재고 기준 미달입니다.
      </span>
    </div>
  )
}
