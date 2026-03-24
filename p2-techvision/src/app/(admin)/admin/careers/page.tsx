import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CareerActions from '@/components/admin/CareerActions'

export default async function AdminCareersPage() {
  let jobs: any[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('job_postings').select('*').order('created_at', { ascending: false })
    jobs = data || []
  } catch {}

  const typeLabel: Record<string, string> = {
    'full-time': '정규직',
    'contract': '계약직',
    'part-time': '파트타임',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">채용 관리</h1>
        <Button render={<Link href="/admin/careers/new" />}>새 채용공고</Button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">직책</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">부서</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">고용형태</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">상태</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {jobs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">채용공고가 없습니다</td></tr>
            ) : jobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{job.title}</td>
                <td className="p-4 text-sm text-gray-600">{job.department || '-'}</td>
                <td className="p-4"><Badge variant="outline">{typeLabel[job.employment_type] || job.employment_type}</Badge></td>
                <td className="p-4">
                  <Badge variant={job.is_active ? 'default' : 'secondary'}>{job.is_active ? '활성' : '비활성'}</Badge>
                </td>
                <td className="p-4 text-right">
                  <CareerActions id={job.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
