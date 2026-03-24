import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Report } from '@/types/database'
import { ReportActions } from '@/components/admin/ReportActions'

async function getReports(status?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from('reports')
    .select('*, reporter:profiles!reporter_id(id, username)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Report[]
}

const statusLabel: Record<string, string> = {
  pending: '대기',
  resolved: '처리됨',
  dismissed: '기각',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'destructive',
  resolved: 'default',
  dismissed: 'secondary',
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const reports = await getReports(status)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">신고 관리</h1>

      <form className="flex gap-2 mb-4">
        <select
          name="status"
          defaultValue={status ?? ''}
          className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">전체 상태</option>
          <option value="pending">대기</option>
          <option value="resolved">처리됨</option>
          <option value="dismissed">기각</option>
        </select>
        <button
          type="submit"
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          필터
        </button>
      </form>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>대상 유형</TableHead>
              <TableHead>사유</TableHead>
              <TableHead>신고자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>신고일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  신고 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {report.target_type === 'post' ? '게시글' : '댓글'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {report.reporter?.username ?? '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[report.status] ?? 'outline'}>
                      {statusLabel[report.status] ?? report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ko })}
                  </TableCell>
                  <TableCell className="text-right">
                    <ReportActions report={report} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
