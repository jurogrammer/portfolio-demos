import { fetchDashboardData } from './actions'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { InquiryTable } from '@/components/dashboard/InquiryTable'

export const metadata = { title: '문의 현황 대시보드 | n8n 자동화 시스템' }

export default async function DashboardPage() {
  const result = await fetchDashboardData()

  if (!result.success) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <p className="text-destructive">{result.error}</p>
      </div>
    )
  }

  const { stats, inquiries } = result.data

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">문의 현황 대시보드</h1>
      <StatsCards stats={stats} />
      <div>
        <h2 className="text-xl font-semibold mb-4">최근 문의 목록</h2>
        <InquiryTable inquiries={inquiries} />
      </div>
    </div>
  )
}
