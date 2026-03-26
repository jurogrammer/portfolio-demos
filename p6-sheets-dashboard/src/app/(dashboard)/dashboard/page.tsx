import { getDashboardStats, getRecentChanges } from './actions'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentActivity from '@/components/dashboard/RecentActivity'

export const dynamic = 'force-dynamic'

export const metadata = { title: '개요' }

export default async function DashboardPage() {
  const [stats, recentItems] = await Promise.all([
    getDashboardStats(),
    getRecentChanges(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">개요</h1>
        <p className="text-sm text-muted-foreground mt-1">재고 현황 요약</p>
      </div>
      <StatsCards stats={stats} />
      <RecentActivity items={recentItems} />
    </div>
  )
}
