import { createAdminClient } from '@/lib/supabase/admin'
import InquiriesList from '@/components/admin/InquiriesList'
import type { Inquiry } from '@/types/database'

export default async function AdminInquiriesPage() {
  let inquiries: Inquiry[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    inquiries = data || []
  } catch {}

  const unread = inquiries.filter(i => !i.is_read).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">문의 관리</h1>
        {unread > 0 && (
          <span className="bg-red-100 text-red-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
            미읽음 {unread}건
          </span>
        )}
      </div>
      <InquiriesList inquiries={inquiries} />
    </div>
  )
}
