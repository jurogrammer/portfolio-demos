import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PortfolioActions from '@/components/admin/PortfolioActions'

export default async function AdminPortfolioPage() {
  let items: any[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('portfolio_items').select('*').order('display_order', { ascending: true })
    items = data || []
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">포트폴리오 관리</h1>
        <Button render={<Link href="/admin/portfolio/new" />}>새 프로젝트</Button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">프로젝트명</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">클라이언트</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">카테고리</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Featured</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">프로젝트가 없습니다</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{item.title}</td>
                <td className="p-4 text-sm text-gray-600">{item.client_name || '-'}</td>
                <td className="p-4"><Badge variant="outline">{item.category}</Badge></td>
                <td className="p-4">
                  {item.is_featured && <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">Featured</Badge>}
                </td>
                <td className="p-4 text-right">
                  <PortfolioActions id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
