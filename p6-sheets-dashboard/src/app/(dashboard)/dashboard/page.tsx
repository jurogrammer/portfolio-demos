import { getDashboardStats, getRecentChanges } from './actions'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentActivity from '@/components/dashboard/RecentActivity'
import DashboardOverviewHeading from '@/components/dashboard/DashboardOverviewHeading'

export const dynamic = 'force-dynamic'

export const metadata = { title: '개요 | Overview' }

export default async function DashboardPage() {
  const [stats, recentItems] = await Promise.all([
    getDashboardStats(),
    getRecentChanges(),
  ])

  return (
    <div className="space-y-6">
      <DashboardOverviewHeading />
      <StatsCards stats={stats} />
      <RecentActivity items={recentItems} />
    </div>
  )
}
