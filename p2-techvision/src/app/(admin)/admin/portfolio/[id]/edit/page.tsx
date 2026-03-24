import { createAdminClient } from '@/lib/supabase/admin'
import PortfolioForm from '@/components/admin/PortfolioForm'
import { notFound } from 'next/navigation'

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let item = null
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('portfolio_items').select('*').eq('id', id).single()
    item = data
  } catch {}
  if (!item) notFound()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">프로젝트 수정</h1>
      <PortfolioForm initialData={item} />
    </div>
  )
}
