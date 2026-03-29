'use client'

import { AlertTriangle } from 'lucide-react'
import { useLocale } from '@/lib/i18n'

export default function LowStockAlert({ count }: { count: number }) {
  const { t } = useLocale()
  if (count === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        {t.lowStock.alert} <strong>{count}</strong> {t.lowStock.itemsBelowMin}
      </span>
    </div>
  )
}
