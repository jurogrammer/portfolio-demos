'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, CircleDollarSign, Tags } from 'lucide-react'
import type { DashboardStats } from '@/app/(dashboard)/dashboard/actions'
import { useLocale } from '@/lib/i18n'

const krw = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  const { t } = useLocale()
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.totalItems}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.totalItems.toLocaleString('ko-KR')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.totalItemsSub}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.lowStockWarning}</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive">{stats.lowStockCount.toLocaleString('ko-KR')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.lowStockSub}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.totalValue}</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{krw.format(stats.totalValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.totalValueSub}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.categoryCount}</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.categoryCount.toLocaleString('ko-KR')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.categoryCountSub}</p>
        </CardContent>
      </Card>
    </div>
  )
}
