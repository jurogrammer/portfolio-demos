import { createAdminClient } from '@/lib/supabase/admin'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, Flag, UserPlus, PenLine } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Report } from '@/types/database'

async function getStats() {
  const supabase = createAdminClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayIso = todayStart.toISOString()

  const [
    { count: totalUsers },
    { count: todayUsers },
    { count: totalPosts },
    { count: todayPosts },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('dt_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('dt_profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayIso),
    supabase.from('dt_posts').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('dt_posts').select('*', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', todayIso),
    supabase.from('dt_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    totalUsers: totalUsers ?? 0,
    todayUsers: todayUsers ?? 0,
    totalPosts: totalPosts ?? 0,
    todayPosts: todayPosts ?? 0,
    pendingReports: pendingReports ?? 0,
  }
}

async function getRecentReports() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('dt_reports')
    .select('*, reporter:profiles!reporter_id(id, username)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)
  return (data ?? []) as Report[]
}

async function getActivityData() {
  const supabase = createAdminClient()
  const days: { date: string; label: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    days.push({
      date: d.toISOString(),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
    })
  }

  const counts = await Promise.all(
    days.map(async ({ date }, idx) => {
      const nextDate = idx < days.length - 1 ? days[idx + 1].date : new Date().toISOString()
      const { count } = await supabase
        .from('dt_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date)
        .lt('created_at', nextDate)
        .eq('is_deleted', false)
      return count ?? 0
    })
  )

  return days.map(({ label }, i) => ({ label, count: counts[i] }))
}

const statusLabel: Record<string, string> = {
  pending: '대기',
  resolved: '처리됨',
  dismissed: '기각',
}

export default async function AdminDashboardPage() {
  const [stats, recentReports, activity] = await Promise.all([
    getStats(),
    getRecentReports(),
    getActivityData(),
  ])

  const maxActivity = Math.max(...activity.map((a) => a.count), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: '총 회원', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
          { label: '오늘 가입', value: stats.todayUsers, icon: UserPlus, color: 'text-cyan-500' },
          { label: '총 게시글', value: stats.totalPosts, icon: FileText, color: 'text-green-500' },
          { label: '오늘 게시글', value: stats.todayPosts, icon: PenLine, color: 'text-emerald-500' },
          { label: '미처리 신고', value: stats.pendingReports, icon: Flag, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${color}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{value.toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity chart (last 7 days posts) */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">최근 7일 게시글</h2>
          <div className="flex items-end gap-2 h-32">
            {activity.map(({ label, count }) => (
              <div key={label} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs text-muted-foreground">{count}</span>
                <div
                  className="w-full rounded-t bg-primary/70 transition-all"
                  style={{ height: `${(count / maxActivity) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent reports */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">최근 미처리 신고</h2>
          {recentReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">미처리 신고가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {recentReports.map((report) => (
                <li key={report.id} className="flex items-start justify-between gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-foreground">{report.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.reporter?.username ?? '알 수 없음'} ·{' '}
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ko })}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {report.target_type === 'post' ? '게시글' : '댓글'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
