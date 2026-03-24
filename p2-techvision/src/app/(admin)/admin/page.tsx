import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Briefcase, MessageSquare, Users } from 'lucide-react'

async function getStats() {
  try {
    const supabase = createAdminClient()
    const [posts, portfolio, inquiries, jobs] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('portfolio_items').select('*', { count: 'exact', head: true }),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('job_postings').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])
    return {
      totalPosts: posts.count || 0,
      totalPortfolio: portfolio.count || 0,
      unreadInquiries: inquiries.count || 0,
      activeJobs: jobs.count || 0,
    }
  } catch { return { totalPosts: 0, totalPortfolio: 0, unreadInquiries: 0, activeJobs: 0 } }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  let recentInquiries: any[] = []
  let recentPosts: any[] = []
  try {
    const supabase = createAdminClient()
    const [inqRes, postRes] = await Promise.all([
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(5),
    ])
    recentInquiries = inqRes.data || []
    recentPosts = postRes.data || []
  } catch {}

  const statCards = [
    { title: '총 게시글', value: stats.totalPosts, icon: FileText, color: 'text-blue-600' },
    { title: '포트폴리오', value: stats.totalPortfolio, icon: Briefcase, color: 'text-green-600' },
    { title: '미읽은 문의', value: stats.unreadInquiries, icon: MessageSquare, color: 'text-red-600' },
    { title: '활성 채용', value: stats.activeJobs, icon: Users, color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">최근 문의</CardTitle></CardHeader>
          <CardContent>
            {recentInquiries.length === 0 ? (
              <p className="text-gray-500 text-sm">문의가 없습니다</p>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inq: any) => (
                  <div key={inq.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{inq.name}</p>
                      <p className="text-xs text-gray-500">{inq.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={inq.is_read ? 'secondary' : 'destructive'} className="text-xs">
                        {inq.is_read ? '읽음' : '미읽음'}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(inq.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">최근 게시글</CardTitle></CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-gray-500 text-sm">게시글이 없습니다</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                      <Badge variant="outline" className="text-xs mt-1">{post.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.is_published ? 'default' : 'secondary'} className="text-xs">
                        {post.is_published ? '발행' : '임시'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
