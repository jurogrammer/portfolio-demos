import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, CircleDollarSign, Tags } from 'lucide-react'
import type { DashboardStats } from '@/app/(dashboard)/dashboard/actions'

const krw = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">전체 품목</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.totalItems.toLocaleString('ko-KR')}</p>
          <p className="text-xs text-muted-foreground mt-1">등록된 품목 수</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">재고부족 경고</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive">{stats.lowStockCount.toLocaleString('ko-KR')}</p>
          <p className="text-xs text-muted-foreground mt-1">기준 이하 품목 수</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">총 재고가치</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{krw.format(stats.totalValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">수량 × 단가 합계</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">카테고리 수</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.categoryCount.toLocaleString('ko-KR')}</p>
          <p className="text-xs text-muted-foreground mt-1">등록된 카테고리</p>
        </CardContent>
      </Card>
    </div>
  )
}
