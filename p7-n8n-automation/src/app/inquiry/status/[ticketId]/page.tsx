import { StatusTimeline } from '@/components/inquiry/StatusTimeline'

export const metadata = { title: '문의 상태 조회 | n8n 자동화 시스템' }

export default async function StatusPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <StatusTimeline ticketId={ticketId} />
    </div>
  )
}
